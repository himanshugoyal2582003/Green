const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const chatRequestSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

chatRequestSchema.index({ listing: 1, buyer: 1 }, { unique: true });

module.exports = mongoose.model('ChatRequest', chatRequestSchema);
