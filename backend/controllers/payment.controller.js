const Stripe = require('stripe');
const Listing = require('../models/Listing');
const ChatRequest = require('../models/ChatRequest');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    const err = new Error('Stripe is not configured on the server (missing STRIPE_SECRET_KEY).');
    err.status = 500;
    throw err;
  }
  return new Stripe(key);
}

async function createCheckoutSession(req, res, next) {
  try {
    const { listingId } = req.body || {};
    if (!listingId) return res.status(400).json({ error: 'listingId is required.' });

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.status !== 'available') {
      return res.status(400).json({ error: 'This item has already been sold.' });
    }
    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot purchase your own listing.' });
    }

    const approvedChat = await ChatRequest.findOne({
      listing: listing._id,
      buyer: req.user._id,
      status: 'approved',
    });
    if (!approvedChat) {
      return res.status(403).json({
        error: 'Ask the seller in chat and wait for their approval before buying with Stripe.',
      });
    }

    const stripe = getStripe();
    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: Math.max(5000, Math.round(listing.price * 100)),
            product_data: {
              name: listing.item,
              description: `${listing.category} · ${listing.condition} condition`,
              ...(listing.images?.length ? { images: [listing.images[0].url] } : {}),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        listingId: listing._id.toString(),
        buyerId: req.user._id.toString(),
      },
      success_url: `${origin}/listings/${listing._id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/listings/${listing._id}?payment=cancelled`,
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    return next(error);
  }
}

async function verifyCheckoutSession(req, res, next) {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required.' });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment has not been completed.' });
    }

    const { listingId, buyerId } = session.metadata || {};
    if (!listingId) return res.status(400).json({ error: 'Invalid payment session metadata.' });

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    if (listing.status === 'available') {
      listing.status = 'sold';
      listing.buyer = buyerId || req.user._id;
      listing.soldAt = new Date();
      await listing.save();
    }

    return res.json({ paid: true, listing });
  } catch (error) {
    return next(error);
  }
}

async function myPurchases(req, res, next) {
  try {
    const purchases = await Listing.find({ buyer: req.user._id })
      .sort({ soldAt: -1, updatedAt: -1 })
      .populate('owner', 'name')
      .lean();
    res.json({
      purchases: purchases.map((x) => ({
        ...x,
        id: x._id.toString(),
        sellerName: x.owner?.name || 'Campus seller',
      })),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createCheckoutSession, verifyCheckoutSession, myPurchases };
