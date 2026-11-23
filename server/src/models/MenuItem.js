const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    category: { type: String, default: 'Mains' },
    popular: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    prepTime: { type: Number, default: 15 },
    spiceLevel: { type: Number, default: 0, min: 0, max: 3 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
