const SaleHistory = require('../models/SaleHistory');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { categories, generateHistorical } = require('./pricing');

async function seedDatabase() {
  if (await SaleHistory.estimatedDocumentCount() === 0) await SaleHistory.insertMany(generateHistorical());
  if (await Listing.countDocuments({ isSample: true }) === 0) {
    const sampleOwner = await User.findOneAndUpdate(
      { email: 'campus.demo@green.example' },
      { $setOnInsert: { name: 'Campus Demo', email: 'campus.demo@green.example', passwordHash: 'sample-account-cannot-login', role: 'seller' } },
      { upsert: true, new: true }
    );
    const samples = generateHistorical().slice(0, 18).map((sale, index) => ({
      item: sale.item, category: sale.category, condition: sale.condition, age: sale.age,
      originalPrice: sale.originalPrice, price: sale.soldPrice, suggestedPrice: sale.soldPrice,
      status: 'available', owner: sampleOwner._id, isSample: true,
      createdAt: new Date(Date.now() - (index + 1) * 3600000),
      ...(index % 7 === 0 ? { mode: 'swap', swapFor: categories[sale.category].names[(index + 1) % categories[sale.category].names.length] } : {})
    }));
    await Listing.insertMany(samples);
  }
  console.log('Marketplace data is ready.');
}

module.exports = { seedDatabase };
