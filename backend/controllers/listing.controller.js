const Listing = require('../models/Listing');
const SaleHistory = require('../models/SaleHistory');
const { categories, conditions } = require('../utils/pricing');
const { uploadImage, destroyImages } = require('../utils/cloudinaryUpload');
const { lookupRealWorldPrice } = require('../utils/geminiPrice');

async function suggestPrice({ category, condition, age, originalPrice }) {
  const config = categories[category];
  const years = Number(age), original = Number(originalPrice);
  if (!config || !conditions.includes(condition) || !Number.isFinite(years) || years < 0 || years > 30 || !Number.isFinite(original) || original <= 0) return { error: 'Enter a valid category, condition, item age (0–30 years), and original price.' };
  const sales = await SaleHistory.find({ category, condition }).select('originalPrice soldPrice age').lean();
  if (!sales.length) return { error: 'There is not enough sale data for this item yet.' };
  const rates = sales.map(sale => sale.soldPrice / sale.originalPrice / Math.max(.55, 1 - sale.age * config.age));
  const rate = rates.reduce((sum, value) => sum + value, 0) / rates.length;
  const fairPrice = Math.max(50, Math.round(original * rate * Math.max(.55, 1 - years * config.age) / 10) * 10);
  return {
    fairPrice,
    range: { low: Math.round(fairPrice * .9 / 10) * 10, high: Math.round(fairPrice * 1.1 / 10) * 10 },
    sampleSize: sales.length,
    explanation: `Based on ${sales.length} fictional ${condition.toLowerCase()} ${category.toLowerCase()} sales, adjusted for ${years} year${years === 1 ? '' : 's'} of age. Items in this category lose about ${Math.round(config.age * 100)}% of value per year.`,
    trend: `Typical ${category.toLowerCase()} resale value falls about ${Math.round(config.age * 100)}% per year.`
  };
}

async function stats(_req, res, next) {
  try {
    const [historicalCount, activeCount] = await Promise.all([SaleHistory.countDocuments(), Listing.countDocuments({ status: 'available' })]);
    res.json({ historicalCount, activeCount, categories: Object.keys(categories) });
  } catch (error) { next(error); }
}

async function getListings(req, res, next) {
  try {
    const { q = '', category = '', condition = '', minPrice, maxPrice, status = 'available' } = req.query;
    const query = {};
    if (status !== 'all') query.status = status;
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (q) query.item = { $regex: String(q).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = Number(maxPrice);
    if (!Object.keys(query.price).length) delete query.price;
    const [listings, total] = await Promise.all([Listing.find(query).sort({ createdAt: -1 }).limit(100).populate('owner', 'name role').lean(), Listing.countDocuments(query)]);
    res.json({ listings: listings.map(x => ({ ...x, id: x._id.toString(), sellerName: x.owner?.name || 'Campus seller' })), total });
  } catch (error) { next(error); }
}

async function createListing(req, res, next) {
  const uploadedImages = [];
  try {
    const { item, category, condition, age, originalPrice, description = '', mode = 'sell', swapFor = '' } = req.body || {};
    const pricing = await suggestPrice({ category, condition, age, originalPrice });
    if (pricing.error || typeof item !== 'string' || item.trim().length < 2 || item.trim().length > 80 || !['sell', 'swap'].includes(mode) || (mode === 'swap' && (typeof swapFor !== 'string' || swapFor.trim().length < 2 || swapFor.trim().length > 80))) return res.status(400).json({ error: pricing.error || 'Add a valid item name and, for a swap, what you would like in return.' });
    for (const file of req.files || []) uploadedImages.push(await uploadImage(file.buffer, 'listings'));
    const listing = await Listing.create({ item: item.trim(), category, condition, age: Number(age), originalPrice: Number(originalPrice), price: pricing.fairPrice, suggestedPrice: pricing.fairPrice, mode, swapFor: mode === 'swap' ? swapFor.trim() : '', description: String(description).slice(0, 240), images: uploadedImages, owner: req.user._id });
    res.status(201).json({ listing, pricing });
  } catch (error) { await destroyImages(uploadedImages); next(error); }
}

async function myListings(req, res, next) {
  try {
    const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ listings, total: listings.length });
  } catch (error) { next(error); }
}

async function suggest(req, res, next) {
  try { const result = await suggestPrice(req.body || {}); res.status(result.error ? 400 : 200).json(result); }
  catch (error) { next(error); }
}

async function aiPriceEstimate(req, res, next) {
  try {
    const { item, category, condition, age } = req.body || {};
    if (!item || String(item).trim().length < 2) {
      return res.status(400).json({ error: 'Enter an item name to look up its real-world price.' });
    }
    const ai = await lookupRealWorldPrice(item, category);
    const pricing = await suggestPrice({
      category,
      condition,
      age,
      originalPrice: ai.originalPrice,
    });
    if (pricing.error) return res.status(400).json(pricing);

    return res.json({
      ...pricing,
      originalPrice: ai.originalPrice,
      aiSource: ai.source,
      aiNote: ai.note,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { stats, getListings, createListing, myListings, suggest, aiPriceEstimate };
