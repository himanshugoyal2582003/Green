const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  item: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  category: { type: String, required: true, enum: ['Books', 'Calculators', 'Cycles', 'Electronics', 'Hostel essentials'] },
  condition: { type: String, required: true, enum: ['Like new', 'Good', 'Fair'] },
  age: { type: Number, required: true, min: 0, max: 30 },
  originalPrice: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 1 },
  suggestedPrice: { type: Number, required: true, min: 1 },
  mode: { type: String, enum: ['sell', 'swap'], default: 'sell' },
  swapFor: { type: String, trim: true, maxlength: 80, default: '' },
  description: { type: String, trim: true, maxlength: 240, default: '' },
  images: [{ url: { type: String, required: true }, publicId: { type: String, required: true } }],
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  soldAt: { type: Date, default: null },
  isSample: { type: Boolean, default: false }
}, { timestamps: true });

listingSchema.index({ status: 1, category: 1, condition: 1, price: 1 });
listingSchema.index({ item: 'text', category: 'text' });
module.exports = mongoose.model('Listing', listingSchema);
