const User = require('../models/User');
const Listing = require('../models/Listing');
const SaleHistory = require('../models/SaleHistory');

async function overview(_req, res, next) {
  try {
    const [users, listings, historicalSales, byRole] = await Promise.all([
      User.countDocuments({ email: { $ne: 'campus.demo@green.example' } }), Listing.countDocuments(), SaleHistory.countDocuments(),
      User.aggregate([{ $match: { email: { $ne: 'campus.demo@green.example' } } }, { $group: { _id: '$role', count: { $sum: 1 } } }])
    ]);
    res.json({ users, listings, historicalSales, usersByRole: Object.fromEntries(byRole.map(x => [x._id, x.count])) });
  } catch (error) { next(error); }
}

async function listUsers(_req, res, next) {
  try {
    const users = await User.find({ email: { $ne: 'campus.demo@green.example' } }).select('name email role createdAt').sort({ createdAt: -1 }).limit(200).lean();
    res.json({ users });
  } catch (error) { next(error); }
}

async function listListings(_req, res, next) {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 }).limit(200).populate('owner', 'name email role').lean();
    res.json({ listings });
  } catch (error) { next(error); }
}
module.exports = { overview, listUsers, listListings };
