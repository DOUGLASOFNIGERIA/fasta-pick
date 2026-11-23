const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { PERMISSIONS } = require('../constants/roles');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    res.status(401);
    throw new Error('You need to sign in to do that.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    res.status(401);
    throw new Error('Your session has expired. Please sign in again.');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    res.status(401);
    throw new Error('We could not find that account. Please sign in again.');
  }

  req.user = user;
  next();
});

const authorize = (...rules) => {
  const roles = rules.flatMap((rule) => PERMISSIONS[rule] || [rule]);
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('You do not have permission to do that.');
    }
    next();
  };
};

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { protect, authorize, signToken };
