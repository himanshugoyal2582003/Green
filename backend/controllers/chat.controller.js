const ChatRequest = require('../models/ChatRequest');
const Listing = require('../models/Listing');

/** Get chat thread(s) for a specific listing */
async function getListingChat(req, res, next) {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).select('owner item price status').lean();
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const isSeller = listing.owner.toString() === req.user._id.toString();

    if (isSeller) {
      const threads = await ChatRequest.find({ listing: listingId })
        .sort({ updatedAt: -1 })
        .populate('buyer', 'name email')
        .lean();
      return res.json({ isSeller: true, threads });
    }

    const thread = await ChatRequest.findOne({
      listing: listingId,
      buyer: req.user._id,
    })
      .populate('seller', 'name')
      .lean();

    return res.json({ isSeller: false, thread: thread || null });
  } catch (error) {
    return next(error);
  }
}

/** Send a message (buyer initiates buy request, or buyer/seller replies) */
async function sendMessage(req, res, next) {
  try {
    const { listingId } = req.params;
    const { text, buyerId } = req.body || {};

    if (typeof text !== 'string' || text.trim().length < 1 || text.trim().length > 500) {
      return res.status(400).json({ error: 'Message must be between 1 and 500 characters.' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    const isSeller = listing.owner.toString() === req.user._id.toString();
    const msg = {
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: isSeller ? 'seller' : 'buyer',
      text: text.trim(),
    };

    if (isSeller) {
      if (!buyerId) return res.status(400).json({ error: 'buyerId is required to reply.' });
      const thread = await ChatRequest.findOne({ listing: listingId, buyer: buyerId });
      if (!thread) return res.status(404).json({ error: 'Buyer chat thread not found.' });
      thread.messages.push(msg);
      await thread.save();
      return res.json({ thread });
    }

    // Buyer sending a message / buy request
    let thread = await ChatRequest.findOne({ listing: listingId, buyer: req.user._id });
    if (!thread) {
      thread = await ChatRequest.create({
        listing: listingId,
        buyer: req.user._id,
        seller: listing.owner,
        status: 'pending',
        messages: [msg],
      });
    } else {
      thread.messages.push(msg);
      await thread.save();
    }

    return res.status(201).json({ thread });
  } catch (error) {
    return next(error);
  }
}

/** Seller approves or rejects a buyer's request to buy */
async function decideRequest(req, res, next) {
  try {
    const { chatId } = req.params;
    const { decision } = req.body || {};

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approved or rejected.' });
    }

    const thread = await ChatRequest.findById(chatId);
    if (!thread) return res.status(404).json({ error: 'Chat request not found.' });

    if (thread.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the seller can approve or reject this request.' });
    }

    thread.status = decision;
    thread.messages.push({
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: 'seller',
      text:
        decision === 'approved'
          ? 'Approved your request to buy! You can now complete payment via Stripe.'
          : 'Declined this purchase request.',
    });
    await thread.save();

    return res.json({ thread });
  } catch (error) {
    return next(error);
  }
}

/** Get all chat threads for the current user (as buyer or seller) */
async function myChats(req, res, next) {
  try {
    const threads = await ChatRequest.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }],
    })
      .sort({ updatedAt: -1 })
      .populate('listing', 'item price category condition status images')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .lean();

    return res.json({ threads });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getListingChat, sendMessage, decideRequest, myChats };
