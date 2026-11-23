const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    logo: { type: String, default: '' },
    cuisines: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    city: { type: String, default: 'Ado-Ekiti' },
    area: { type: String, default: '' },
    address: { type: String, default: '' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    deliveryMin: { type: Number, default: 20 },
    deliveryMax: { type: Number, default: 35 },
    deliveryFee: { type: Number, default: 300 },
    minimumOrder: { type: Number, default: 1000 },
    isOpen: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    promo: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', cuisines: 'text', city: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
