const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const User = require('../models/User');
const Listing = require('../models/Listing');
const SaleHistory = require('../models/SaleHistory');
const ChatRequest = require('../models/ChatRequest');
const { categories, conditions } = require('../utils/pricing');
const { lookupRealWorldPrice } = require('../utils/geminiPrice');
const { uploadImage } = require('../utils/cloudinaryUpload');

const sessions = new Map(); // chatId -> { step, data }

function getToken() {
  return process.env.TELEGRAM_BOT_TOKEN;
}

async function tg(method, body) {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) console.error(`Telegram ${method} error:`, data.description);
  return data;
}

function sendMsg(chatId, text, replyMarkup) {
  return tg('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

function sendPhoto(chatId, photoUrl, caption, replyMarkup) {
  return tg('sendPhoto', {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: 'HTML',
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

async function downloadTelegramFile(fileId) {
  const token = getToken();
  const info = await tg('getFile', { file_id: fileId });
  const filePath = info?.result?.file_path;
  if (!filePath) throw new Error('Could not get Telegram file path.');
  const res = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
  if (!res.ok) throw new Error('Failed to download photo from Telegram.');
  return Buffer.from(await res.arrayBuffer());
}

async function computeFairPrice({ category, condition, age, originalPrice }) {
  const config = categories[category];
  const years = Number(age);
  const original = Number(originalPrice);
  const sales = await SaleHistory.find({ category, condition }).select('originalPrice soldPrice age').lean();
  const rates = sales.length
    ? sales.map((s) => s.soldPrice / s.originalPrice / Math.max(0.55, 1 - s.age * config.age))
    : [0.7];
  const rate = rates.reduce((sum, v) => sum + v, 0) / rates.length;
  return Math.max(50, Math.round((original * rate * Math.max(0.55, 1 - years * config.age)) / 10) * 10);
}

async function getCurrentUser(chatId) {
  return User.findOne({ telegramChatId: String(chatId) });
}

function showAuthPrompt(chatId) {
  return sendMsg(
    chatId,
    `🌿 <b>Welcome to Green Second Life!</b>\nSign in or create an account to browse, chat, buy, or sell on campus.`,
    {
      inline_keyboard: [
        [
          { text: '🔑 Sign in', callback_data: 'auth:login' },
          { text: '✨ Create account', callback_data: 'auth:signup' },
        ],
      ],
    }
  );
}

function showMainMenu(chatId, user) {
  const rows = [
    [
      { text: '🛍 Browse Products', callback_data: 'menu:browse' },
      { text: '💬 My Chats', callback_data: 'menu:chats' },
    ],
  ];
  if (['seller', 'admin'].includes(user.role)) {
    rows.push([
      { text: '➕ Sell an Item', callback_data: 'menu:sell' },
      { text: '📦 My Listings', callback_data: 'menu:mylistings' },
    ]);
  }
  rows.push([{ text: '🚪 Sign out', callback_data: 'auth:logout' }]);

  return sendMsg(
    chatId,
    `👋 <b>Hey ${user.name}</b> (${user.role})\nWhat would you like to do?`,
    { inline_keyboard: rows }
  );
}

async function sendBrowseList(chatId, user) {
  const listings = await Listing.find({ status: 'available' })
    .sort({ createdAt: -1 })
    .limit(6)
    .populate('owner', 'name')
    .lean();

  if (!listings.length) {
    return sendMsg(chatId, 'No available products right now.');
  }

  await sendMsg(chatId, `🛍 <b>Available Campus Products (${listings.length})</b>`);

  for (const item of listings) {
    const id = item._id.toString();
    const isOwner = item.owner?._id?.toString() === user._id.toString();
    const chatReq = !isOwner
      ? await ChatRequest.findOne({ listing: id, buyer: user._id }).lean()
      : null;

    const caption =
      `<b>${item.item}</b>\n` +
      `Category: ${item.category} · ${item.condition}\n` +
      `Age: ${item.age} yr(s)\n` +
      `Price: <b>₹${item.price.toLocaleString('en-IN')}</b> <s>₹${item.originalPrice.toLocaleString('en-IN')}</s>\n` +
      `Seller: ${item.owner?.name || 'Campus seller'}`;

    const buttons = [];
    if (!isOwner) {
      const row = [{ text: '💬 Chat with Seller', callback_data: `chat:start:${id}` }];
      if (chatReq?.status === 'approved') {
        row.push({ text: '💳 Buy with Stripe', callback_data: `buy:stripe:${id}` });
      }
      buttons.push(row);
    }

    const markup = buttons.length ? { inline_keyboard: buttons } : undefined;
    if (item.images?.length && item.images[0].url) {
      await sendPhoto(chatId, item.images[0].url, caption, markup);
    } else {
      await sendMsg(chatId, caption, markup);
    }
  }
}

async function handleStripeBuy(chatId, user, listingId) {
  const listing = await Listing.findById(listingId);
  if (!listing || listing.status !== 'available') {
    return sendMsg(chatId, '❌ This item is no longer available.');
  }
  const approved = await ChatRequest.findOne({
    listing: listing._id,
    buyer: user._id,
    status: 'approved',
  });
  if (!approved) {
    return sendMsg(chatId, '⏳ Please chat with the seller and wait for their approval before paying.');
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return sendMsg(chatId, '❌ Stripe is not configured on the server.');
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'inr',
          unit_amount: Math.max(5000, Math.round(listing.price * 100)),
          product_data: {
            name: listing.item,
            description: `${listing.category} · ${listing.condition} condition`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { listingId: listing._id.toString(), buyerId: user._id.toString() },
    success_url: `${frontendUrl}/listings/${listing._id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/listings/${listing._id}?payment=cancelled`,
  });

  return sendMsg(
    chatId,
    `💳 <b>Stripe Checkout Ready</b>\nItem: ${listing.item}\nAmount: <b>₹${listing.price.toLocaleString('en-IN')}</b>`,
    { inline_keyboard: [[{ text: 'Pay Now with Stripe ↗', url: session.url }]] }
  );
}

async function handleCallback(cb) {
  const chatId = cb.message.chat.id;
  const data = cb.data || '';
  await tg('answerCallbackQuery', { callback_query_id: cb.id });

  if (data === 'auth:login') {
    sessions.set(chatId, { step: 'login_email', data: {} });
    return sendMsg(chatId, '📧 Enter your <b>email</b>:');
  }
  if (data === 'auth:signup') {
    sessions.set(chatId, { step: 'signup_name', data: {} });
    return sendMsg(chatId, '👤 Enter your <b>full name</b>:');
  }
  if (data.startsWith('signup:role:')) {
    const role = data.split(':')[2];
    const sess = sessions.get(chatId);
    if (!sess || sess.step !== 'signup_role') return;
    const { name, email, password } = sess.data;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      telegramChatId: String(chatId),
    });
    sessions.delete(chatId);
    await sendMsg(chatId, `✅ Account created! Welcome, <b>${user.name}</b>.`);
    return showMainMenu(chatId, user);
  }
  if (data === 'auth:logout') {
    await User.updateMany({ telegramChatId: String(chatId) }, { $set: { telegramChatId: null } });
    sessions.delete(chatId);
    await sendMsg(chatId, '👋 Signed out.');
    return showAuthPrompt(chatId);
  }

  const user = await getCurrentUser(chatId);
  if (!user) return showAuthPrompt(chatId);

  if (data === 'menu:browse') return sendBrowseList(chatId, user);
  if (data === 'menu:mylistings') {
    const mine = await Listing.find({ owner: user._id }).sort({ createdAt: -1 }).limit(10).lean();
    if (!mine.length) return sendMsg(chatId, 'You have no listings yet.');
    const lines = mine.map((x) => `• <b>${x.item}</b> — ₹${x.price} (${x.status})`).join('\n');
    return sendMsg(chatId, `📦 <b>Your Listings</b>\n\n${lines}`);
  }
  if (data === 'menu:sell') {
    if (!['seller', 'admin'].includes(user.role)) {
      return sendMsg(chatId, '❌ Only Seller accounts can post listings.');
    }
    sessions.set(chatId, { step: 'sell_name', data: {} });
    return sendMsg(chatId, '📝 Enter the <b>item name</b> (e.g. Casio fx-991EX):');
  }
  if (data.startsWith('sell:cat:')) {
    const cat = data.slice('sell:cat:'.length);
    const sess = sessions.get(chatId);
    if (!sess || sess.step !== 'sell_category') return;
    sess.data.category = cat;
    sess.step = 'sell_condition';
    return sendMsg(chatId, '✨ Choose the <b>condition</b>:', {
      inline_keyboard: [
        conditions.map((c) => ({ text: c, callback_data: `sell:cond:${c}` })),
      ],
    });
  }
  if (data.startsWith('sell:cond:')) {
    const cond = data.slice('sell:cond:'.length);
    const sess = sessions.get(chatId);
    if (!sess || sess.step !== 'sell_condition') return;
    sess.data.condition = cond;
    sess.step = 'sell_age';
    return sendMsg(chatId, '⏳ Enter <b>product age in years</b> (e.g. 2):');
  }
  if (data === 'sell:skip_photo') {
    const sess = sessions.get(chatId);
    if (!sess || sess.step !== 'sell_photo') return;
    return finalizeSell(chatId, user, sess.data, []);
  }
  if (data === 'menu:chats') {
    const threads = await ChatRequest.find({
      $or: [{ buyer: user._id }, { seller: user._id }],
    })
      .sort({ updatedAt: -1 })
      .limit(8)
      .populate('listing', 'item price status')
      .populate('buyer', 'name')
      .populate('seller', 'name')
      .lean();

    if (!threads.length) return sendMsg(chatId, '💬 You have no active chats yet.');

    for (const t of threads) {
      const isSeller = t.seller?._id?.toString() === user._id.toString();
      const other = isSeller ? t.buyer?.name : t.seller?.name;
      const last = t.messages?.[t.messages.length - 1];
      const text =
        `💬 <b>${t.listing?.item || 'Item'}</b> (₹${t.listing?.price})\n` +
        `With: ${other || 'User'} · Status: <b>${t.status.toUpperCase()}</b>\n` +
        (last ? `Last: "${last.text}"` : '');

      const row = [{ text: '↩️ Reply', callback_data: `chat:reply:${t._id}` }];
      if (isSeller && t.status === 'pending') {
        row.push({ text: '✅ Approve', callback_data: `chat:approve:${t._id}` });
        row.push({ text: '❌ Decline', callback_data: `chat:reject:${t._id}` });
      }
      if (!isSeller && t.status === 'approved' && t.listing?.status === 'available') {
        row.push({ text: '💳 Buy with Stripe', callback_data: `buy:stripe:${t.listing._id}` });
      }
      await sendMsg(chatId, text, { inline_keyboard: [row] });
    }
    return;
  }
  if (data.startsWith('chat:start:')) {
    const listingId = data.split(':')[2];
    sessions.set(chatId, { step: 'chat_send', data: { listingId } });
    return sendMsg(chatId, '💬 Type your message to the seller (to ask & request to buy):');
  }
  if (data.startsWith('chat:reply:')) {
    const chatIdDb = data.split(':')[2];
    sessions.set(chatId, { step: 'chat_reply', data: { chatIdDb } });
    return sendMsg(chatId, '↩️ Type your reply:');
  }
  if (data.startsWith('chat:approve:') || data.startsWith('chat:reject:')) {
    const [, action, chatIdDb] = data.split(':');
    const decision = action === 'approve' ? 'approved' : 'rejected';
    const thread = await ChatRequest.findById(chatIdDb)
      .populate('listing', 'item price')
      .populate('buyer', 'name telegramChatId');
    if (!thread || thread.seller.toString() !== user._id.toString()) {
      return sendMsg(chatId, '❌ You cannot update this request.');
    }
    thread.status = decision;
    thread.messages.push({
      sender: user._id,
      senderName: user.name,
      senderRole: 'seller',
      text:
        decision === 'approved'
          ? 'Approved your request to buy! You can now pay via Stripe.'
          : 'Declined this purchase request.',
    });
    await thread.save();
    await sendMsg(chatId, `✅ Request marked as <b>${decision}</b>.`);

    if (thread.buyer?.telegramChatId) {
      const markup =
        decision === 'approved'
          ? {
              inline_keyboard: [
                [{ text: '💳 Pay with Stripe', callback_data: `buy:stripe:${thread.listing._id}` }],
              ],
            }
          : undefined;
      await sendMsg(
        thread.buyer.telegramChatId,
        decision === 'approved'
          ? `🎉 <b>${user.name}</b> approved your request to buy <b>${thread.listing.item}</b> (₹${thread.listing.price})!`
          : `❌ <b>${user.name}</b> declined your request for <b>${thread.listing.item}</b>.`,
        markup
      );
    }
    return;
  }
  if (data.startsWith('buy:stripe:')) {
    const listingId = data.split(':')[2];
    return handleStripeBuy(chatId, user, listingId);
  }
}

async function finalizeSell(chatId, user, data, images) {
  const listing = await Listing.create({
    item: data.item,
    category: data.category,
    condition: data.condition,
    age: data.age,
    originalPrice: data.originalPrice,
    price: data.fairPrice,
    suggestedPrice: data.fairPrice,
    mode: 'sell',
    images,
    owner: user._id,
  });
  sessions.delete(chatId);
  await sendMsg(
    chatId,
    `🎉 <b>Listing published!</b>\n<b>${listing.item}</b> is live at <b>₹${listing.price.toLocaleString('en-IN')}</b>.`
  );
  return showMainMenu(chatId, user);
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();

  if (text === '/start' || text === '/menu') {
    sessions.delete(chatId);
    const user = await getCurrentUser(chatId);
    if (!user) return showAuthPrompt(chatId);
    return showMainMenu(chatId, user);
  }
  if (text === '/logout') {
    await User.updateMany({ telegramChatId: String(chatId) }, { $set: { telegramChatId: null } });
    sessions.delete(chatId);
    await sendMsg(chatId, '👋 Signed out.');
    return showAuthPrompt(chatId);
  }

  const sess = sessions.get(chatId);
  if (sess) {
    // ── Login Flow ──
    if (sess.step === 'login_email') {
      sess.data.email = text.toLowerCase();
      sess.step = 'login_password';
      return sendMsg(chatId, '🔒 Enter your <b>password</b>:');
    }
    if (sess.step === 'login_password') {
      const user = await User.findOne({ email: sess.data.email }).select('+passwordHash');
      if (!user || !(await bcrypt.compare(text, user.passwordHash))) {
        sessions.delete(chatId);
        await sendMsg(chatId, '❌ Incorrect email or password.');
        return showAuthPrompt(chatId);
      }
      user.telegramChatId = String(chatId);
      await user.save();
      sessions.delete(chatId);
      await sendMsg(chatId, `✅ Signed in as <b>${user.name}</b>!`);
      return showMainMenu(chatId, user);
    }

    // ── Signup Flow ──
    if (sess.step === 'signup_name') {
      if (text.length < 2) return sendMsg(chatId, 'Name must be at least 2 characters.');
      sess.data.name = text;
      sess.step = 'signup_email';
      return sendMsg(chatId, '📧 Enter your <b>email</b>:');
    }
    if (sess.step === 'signup_email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return sendMsg(chatId, 'Enter a valid email.');
      if (await User.exists({ email: text.toLowerCase() })) {
        sessions.delete(chatId);
        await sendMsg(chatId, '⚠️ That email is already registered. Try signing in.');
        return showAuthPrompt(chatId);
      }
      sess.data.email = text.toLowerCase();
      sess.step = 'signup_password';
      return sendMsg(chatId, '🔒 Create a <b>password</b> (min 8 characters):');
    }
    if (sess.step === 'signup_password') {
      if (text.length < 8) return sendMsg(chatId, 'Password must be at least 8 characters.');
      sess.data.password = text;
      sess.step = 'signup_role';
      return sendMsg(chatId, '🎭 Choose your account role:', {
        inline_keyboard: [
          [
            { text: '🛍 Buyer', callback_data: 'signup:role:buyer' },
            { text: '🏷 Seller', callback_data: 'signup:role:seller' },
          ],
        ],
      });
    }

    const user = await getCurrentUser(chatId);
    if (!user) return showAuthPrompt(chatId);

    // ── Sell Flow ──
    if (sess.step === 'sell_name') {
      if (text.length < 2) return sendMsg(chatId, 'Enter a valid item name.');
      sess.data.item = text;
      sess.step = 'sell_category';
      const catButtons = Object.keys(categories).map((c) => [
        { text: c, callback_data: `sell:cat:${c}` },
      ]);
      return sendMsg(chatId, '📂 Choose a <b>category</b>:', { inline_keyboard: catButtons });
    }
    if (sess.step === 'sell_age') {
      const age = Number(text);
      if (!Number.isFinite(age) || age < 0 || age > 30) {
        return sendMsg(chatId, 'Enter a valid age between 0 and 30 years.');
      }
      sess.data.age = age;
      await sendMsg(chatId, '✨ Checking real-world price with Gemini AI…');
      const ai = await lookupRealWorldPrice(sess.data.item, sess.data.category);
      sess.data.originalPrice = ai.originalPrice;
      sess.data.fairPrice = await computeFairPrice({
        category: sess.data.category,
        condition: sess.data.condition,
        age,
        originalPrice: ai.originalPrice,
      });
      sess.step = 'sell_photo';
      return sendMsg(
        chatId,
        `💡 <b>Price Estimate</b>\nReal-world price: ₹${ai.originalPrice.toLocaleString('en-IN')} (${ai.note})\n` +
          `Suggested selling price: <b>₹${sess.data.fairPrice.toLocaleString('en-IN')}</b>\n\n` +
          `📸 Send a <b>photo</b> of the item now, or tap Skip:`,
        { inline_keyboard: [[{ text: 'Skip photo →', callback_data: 'sell:skip_photo' }]] }
      );
    }
    if (sess.step === 'sell_photo') {
      if (msg.photo?.length) {
        const largest = msg.photo[msg.photo.length - 1];
        try {
          await sendMsg(chatId, '☁️ Uploading photo…');
          const buffer = await downloadTelegramFile(largest.file_id);
          const uploaded = await uploadImage(buffer, 'listings');
          return finalizeSell(chatId, user, sess.data, [uploaded]);
        } catch (err) {
          console.error('Telegram photo upload error:', err.message);
          return finalizeSell(chatId, user, sess.data, []);
        }
      }
      return sendMsg(chatId, 'Please send a photo or tap "Skip photo →".');
    }

    // ── Chat Flows ──
    if (sess.step === 'chat_send') {
      const listing = await Listing.findById(sess.data.listingId).populate('owner', 'name telegramChatId');
      if (!listing) {
        sessions.delete(chatId);
        return sendMsg(chatId, '❌ Listing not found.');
      }
      let thread = await ChatRequest.findOne({ listing: listing._id, buyer: user._id });
      const msgObj = {
        sender: user._id,
        senderName: user.name,
        senderRole: 'buyer',
        text,
      };
      if (!thread) {
        thread = await ChatRequest.create({
          listing: listing._id,
          buyer: user._id,
          seller: listing.owner._id,
          status: 'pending',
          messages: [msgObj],
        });
      } else {
        thread.messages.push(msgObj);
        await thread.save();
      }
      sessions.delete(chatId);
      await sendMsg(chatId, '✅ Message sent! Waiting for seller approval.');

      if (listing.owner?.telegramChatId) {
        await sendMsg(
          listing.owner.telegramChatId,
          `📩 <b>New Buy Request</b> for <b>${listing.item}</b>\nFrom: ${user.name}\nMessage: "${text}"`,
          {
            inline_keyboard: [
              [
                { text: '✅ Approve to Buy', callback_data: `chat:approve:${thread._id}` },
                { text: '❌ Decline', callback_data: `chat:reject:${thread._id}` },
              ],
              [{ text: '↩️ Reply', callback_data: `chat:reply:${thread._id}` }],
            ],
          }
        );
      }
      return;
    }

    if (sess.step === 'chat_reply') {
      const thread = await ChatRequest.findById(sess.data.chatIdDb)
        .populate('listing', 'item')
        .populate('buyer', 'name telegramChatId')
        .populate('seller', 'name telegramChatId');
      if (!thread) {
        sessions.delete(chatId);
        return sendMsg(chatId, '❌ Chat not found.');
      }
      const isSeller = thread.seller._id.toString() === user._id.toString();
      thread.messages.push({
        sender: user._id,
        senderName: user.name,
        senderRole: isSeller ? 'seller' : 'buyer',
        text,
      });
      await thread.save();
      sessions.delete(chatId);
      await sendMsg(chatId, '✅ Reply sent.');

      const targetChatId = isSeller ? thread.buyer?.telegramChatId : thread.seller?.telegramChatId;
      if (targetChatId) {
        await sendMsg(
          targetChatId,
          `💬 <b>${user.name}</b> (${thread.listing?.item || 'Listing'}):\n"${text}"`,
          { inline_keyboard: [[{ text: '↩️ Reply', callback_data: `chat:reply:${thread._id}` }]] }
        );
      }
      return;
    }
  }

  const user = await getCurrentUser(chatId);
  if (!user) return showAuthPrompt(chatId);
  return showMainMenu(chatId, user);
}

function startTelegramBot() {
  const token = getToken();
  if (!token) {
    console.log('TELEGRAM_BOT_TOKEN not set — Telegram bot skipped.');
    return;
  }

  let offset = 0;
  let active = true;

  async function poll() {
    while (active) {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${token}/getUpdates?timeout=25&offset=${offset}`
        );
        const data = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            if (update.callback_query) {
              handleCallback(update.callback_query).catch((e) =>
                console.error('Bot callback error:', e.message)
              );
            } else if (update.message) {
              handleMessage(update.message).catch((e) =>
                console.error('Bot message error:', e.message)
              );
            }
          }
        }
      } catch (err) {
        console.error('Telegram polling error:', err.message);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  poll();
  console.log('Telegram bot @GreenSecondSellerBot is polling...');
}

module.exports = { startTelegramBot };
