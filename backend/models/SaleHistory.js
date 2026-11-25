const mongoose = require('mongoose');

const saleHistorySchema = new mongoose.Schema({
  item: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, required: true },
  age: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  soldPrice: { type: Number, required: true },
  soldAt: { type: Date, required: true }
}, { timestamps: false });

module.exports = mongoose.model('SaleHistory', saleHistorySchema);
