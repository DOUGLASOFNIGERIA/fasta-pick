const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    restaurantName: { type: String, default: '' },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready_for_pickup',
        'on_the_way',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'paystack'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    deliveryAddress: {
      label: { type: String, default: 'Home' },
      fullAddress: { type: String, required: true },
      landmark: { type: String, default: '' },
      phone: { type: String, required: true },
    note: { type: String, default: '' },
    by: { type: String, default: '' },
    },
    estimatedDelivery: { type: Date },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    riderName: { type: String, default: '' },
    riderPhone: { type: String, default: '' },
    riderLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
    readyAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    timeline: { type: [timelineSchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({ status: 'pending', note: 'Order placed successfully' });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
