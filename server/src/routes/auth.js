const express = require('express');
const {
  register,
  login,
  getMe,
  updateMe,
  addAddress,
  getRiders,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));
router.put('/me', protect, asyncHandler(updateMe));
router.post('/addresses', protect, asyncHandler(addAddress));
router.get('/riders', protect, authorize('vendor', 'admin'), asyncHandler(getRiders));

module.exports = router;
