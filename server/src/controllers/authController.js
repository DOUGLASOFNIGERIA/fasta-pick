const User = require('../models/User');
const { signToken } = require('../middleware/auth');
const { ROLES, REGISTRABLE_ROLES, DEFAULT_ROLE } = require('../constants/roles');

const buildResponse = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      city: user.city,
      avatar: user.avatar,
      addresses: user.addresses,
    },
  });
};

exports.register = async (req, res) => {
  const { name, email, phone, password, city } = req.body;
  const role = String(req.body.role || DEFAULT_ROLE).toLowerCase();

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide your name, email and password.');
  }

  if (!REGISTRABLE_ROLES.includes(role)) {
    res.status(400);
    throw new Error('Please choose a valid account type.');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    res.status(409);
    throw new Error('An account with that email already exists.');
  }

  const user = await User.create({
    name,
    email,
    phone: phone || '',
    password,
    city: city || 'Ado-Ekiti',
    role,
  });

  buildResponse(user, 201, res, 'Welcome to FastaPick.');
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide your email and password.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    '+password'
  );

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Those details do not match an account. Please try again.');
  }

  buildResponse(user, 200, res, `Welcome back, ${user.name.split(' ')[0]}.`);
};

exports.getRiders = async (req, res) => {
  const riders = await User.find({ role: ROLES.RIDER })
    .select('name email phone city')
    .sort({ name: 1 });

  res.status(200).json({ success: true, riders });
};

exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

exports.updateMe = async (req, res) => {
  const allowed = ['name', 'phone', 'city', 'avatar'];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(200).json({ success: true, user, message: 'Profile updated.' });
};

exports.addAddress = async (req, res) => {
  const { label, fullAddress, landmark, phone, isDefault } = req.body;
  if (!fullAddress || !phone) {
    res.status(400);
    throw new Error('An address and phone number are required.');
  }

  const user = await User.findById(req.user._id);
  if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

  user.addresses.push({
    label: label || 'Home',
    fullAddress,
    landmark: landmark || '',
    phone,
    isDefault: isDefault || user.addresses.length === 0,
  });

  await user.save();
  res.status(201).json({
    success: true,
    message: 'Delivery address saved.',
    addresses: user.addresses,
  });
};
