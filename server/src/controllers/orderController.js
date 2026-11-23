const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

const ACTIVE_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'on_the_way',
];

const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['on_the_way', 'cancelled'],
  on_the_way: ['delivered'],
  delivered: [],
  cancelled: [],
};

const withDetails = (query) =>
  query
    .populate('user', 'name phone')
    .populate('restaurant', 'name image')
    .populate('rider', 'name phone');

const ownedRestaurantIds = async (userId) => {
  const restaurants = await Restaurant.find({ owner: userId }).select('_id');
  return restaurants.map((restaurant) => restaurant._id);
};

const assertManageable = async (order, req, res) => {
  if (req.user.role === 'admin') return;

  if (req.user.role !== 'vendor') {
    res.status(403);
    throw new Error('You are not allowed to manage this order.');
  }

  const owned = await ownedRestaurantIds(req.user._id);
  const restaurantId = order.restaurant?._id || order.restaurant;
  if (!owned.some((id) => id.equals(restaurantId))) {
    res.status(403);
    throw new Error('This order belongs to another restaurant.');
  }
};

const readableOrder = (req, id, extra = {}) => {
  const query = { _id: id, ...extra };

  if (req.user.role === 'customer') query.user = req.user._id;
  if (req.user.role === 'rider') query.rider = req.user._id;

  if (req.user.role === 'vendor') {
    return ownedRestaurantIds(req.user._id).then((ids) =>
      withDetails(Order.findOne({ ...query, restaurant: { $in: ids } }))
    );
  }

  return withDetails(Order.findOne(query));
};

exports.createOrder = async (req, res) => {
  const { items, deliveryAddress, paymentMethod, note } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty.');
  }
  if (!deliveryAddress?.fullAddress || !deliveryAddress?.phone) {
    res.status(400);
    throw new Error('Please provide a delivery address and phone number.');
  }

  const itemIds = items.map((item) => item.menuItem);
  const menuItems = await MenuItem.find({
    _id: { $in: itemIds },
    available: true,
  });

  if (menuItems.length !== itemIds.length) {
    res.status(400);
    throw new Error('One or more items in your cart are no longer available.');
  }

  const menuById = Object.fromEntries(menuItems.map((item) => [item._id.toString(), item]));
  const orderItems = items.map((item) => {
    const menuItem = menuById[item.menuItem.toString()];
    if (!menuItem || item.quantity < 1) {
      res.status(400);
      throw new Error('Invalid item in your cart.');
    }
    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      image: menuItem.image,
      price: menuItem.price,
      quantity: item.quantity,
    };
  });

  const restaurant = await Restaurant.findById(menuItems[0].restaurant);
  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found.');
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  if (subtotal < restaurant.minimumOrder) {
    res.status(400);
    throw new Error(
      `Minimum order for ${restaurant.name} is ₦${restaurant.minimumOrder.toLocaleString()}.`
    );
  }

  const deliveryFee = restaurant.deliveryFee || 0;
  const serviceFee = Math.round(subtotal * 0.03);
  const total = subtotal + deliveryFee + serviceFee;
  const duration = restaurant.deliveryMax || 35;

  const order = await Order.create({
    user: req.user._id,
    restaurant: restaurant._id,
    restaurantName: restaurant.name,
    items: orderItems,
    subtotal,
    deliveryFee,
    serviceFee,
    total,
    paymentMethod: paymentMethod || 'cash',
    deliveryAddress: {
      label: deliveryAddress.label || 'Home',
      fullAddress: deliveryAddress.fullAddress,
      landmark: deliveryAddress.landmark || '',
      phone: deliveryAddress.phone,
      note: note || deliveryAddress.note || '',
    },
    estimatedDelivery: new Date(Date.now() + duration * 60 * 1000),
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully.',
    order,
  });
};

exports.getMyOrders = async (req, res) => {
  const orders = await withDetails(
    Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  );
  res.status(200).json({ success: true, orders });
};

exports.getIncomingOrders = async (req, res) => {
  const query = { status: { $in: ACTIVE_STATUSES } };
  if (req.user.role === 'vendor') {
    query.restaurant = { $in: await ownedRestaurantIds(req.user._id) };
  }

  const orders = await withDetails(Order.find(query).sort({ createdAt: 1 }));
  res.status(200).json({ success: true, orders });
};

exports.getAvailableOrders = async (req, res) => {
  const orders = await withDetails(
    Order.find({ status: 'ready_for_pickup', rider: null }).sort({ createdAt: 1 })
  );
  res.status(200).json({ success: true, orders });
};

exports.getAssignedOrders = async (req, res) => {
  const orders = await withDetails(
    Order.find({
      rider: req.user._id,
      status: { $in: ['ready_for_pickup', 'on_the_way'] },
    }).sort({ createdAt: 1 })
  );
  res.status(200).json({ success: true, orders });
};

exports.getOrder = async (req, res) => {
  const order = await readableOrder(req, req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }
  res.status(200).json({ success: true, order });
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }

  await assertManageable(order, req, res);

  if (!TRANSITIONS[order.status]?.includes(status)) {
    res.status(400);
    throw new Error(`Cannot change ${order.status} to ${status}.`);
  }

  if (status === 'on_the_way' && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the assigned rider can mark an order as on the way.');
  }

  order.status = status;
  if (status === 'ready_for_pickup') order.readyAt = new Date();
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'paid';
  }
  order.timeline.push({
    status,
    note: `Status changed to ${status.replaceAll('_', ' ')}`,
    by: req.user.name,
  });

  await order.save();
  res.status(200).json({ success: true, message: 'Order updated.', order });
};

exports.assignRider = async (req, res) => {
  const { riderId } = req.body;
  if (!riderId) {
    res.status(400);
    throw new Error('Please choose a rider.');
  }

  const rider = await User.findOne({ _id: riderId, role: 'rider' }).select(
    'name phone'
  );
  if (!rider) {
    res.status(404);
    throw new Error('Rider not found.');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }

  await assertManageable(order, req, res);

  if (!['preparing', 'ready_for_pickup'].includes(order.status)) {
    res.status(400);
    throw new Error('This order is not ready for rider assignment.');
  }

  const changed = !order.rider || !order.rider.equals(rider._id);
  order.rider = rider._id;
  order.riderName = rider.name;
  order.riderPhone = rider.phone || '';
  order.status = 'ready_for_pickup';
  order.readyAt = order.readyAt || new Date();

  if (changed) {
    order.timeline.push({
      status: 'ready_for_pickup',
      note: `Rider assigned: ${rider.name}`,
      by: req.user.name,
    });
  }

  await order.save();
  res.status(200).json({ success: true, message: 'Rider assigned.', order });
};

exports.riderAccept = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    status: 'ready_for_pickup',
    $or: [{ rider: null }, { rider: req.user._id }],
  });

  if (!order) {
    res.status(409);
    throw new Error('This delivery is no longer available.');
  }

  order.rider = req.user._id;
  order.riderName = req.user.name;
  order.riderPhone = req.user.phone || '';
  order.timeline.push({
    status: 'ready_for_pickup',
    note: 'Rider accepted the delivery',
    by: req.user.name,
  });

  await order.save();
  res.status(200).json({ success: true, message: 'Delivery accepted.', order });
};

exports.riderPickup = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    rider: req.user._id,
    status: 'ready_for_pickup',
  });

  if (!order) {
    res.status(409);
    throw new Error('This order cannot be picked up.');
  }

  order.status = 'on_the_way';
  order.pickedUpAt = new Date();
  order.timeline.push({
    status: 'on_the_way',
    note: 'Rider picked up the order',
    by: req.user.name,
  });

  await order.save();
  res.status(200).json({ success: true, message: 'Order picked up.', order });
};

exports.riderDeliver = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    rider: req.user._id,
    status: 'on_the_way',
  });

  if (!order) {
    res.status(409);
    throw new Error('This order cannot be marked as delivered.');
  }

  order.status = 'delivered';
  order.deliveredAt = new Date();
  order.paymentStatus = 'paid';
  order.timeline.push({
    status: 'delivered',
    note: 'Order delivered',
    by: req.user.name,
  });

  await order.save();
  res.status(200).json({ success: true, message: 'Order delivered.', order });
};

exports.updateLocation = async (req, res) => {
  const { lat, lng } = req.body;
  const latitude = Number(lat);
  const longitude = Number(lng);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    res.status(400);
    throw new Error('Valid latitude and longitude are required.');
  }

  const order = await Order.findOne({
    _id: req.params.id,
    rider: req.user._id,
    status: { $in: ['ready_for_pickup', 'on_the_way'] },
  });

  if (!order) {
    res.status(409);
    throw new Error('You are not on an active delivery.');
  }

  order.riderLocation = {
    lat: latitude,
    lng: longitude,
    updatedAt: new Date(),
  };
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Location shared.',
    location: order.riderLocation,
  });
};
