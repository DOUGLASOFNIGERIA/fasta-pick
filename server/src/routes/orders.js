const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  getIncomingOrders,
  getAvailableOrders,
  getAssignedOrders,
  updateOrderStatus,
  assignRider,
  riderAccept,
  riderPickup,
  riderDeliver,
  updateLocation,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

router.use(protect);

router.post('/', asyncHandler(createOrder));
router.get('/', asyncHandler(getMyOrders));
router.get('/incoming', authorize('vendor', 'admin'), asyncHandler(getIncomingOrders));
router.get('/available', authorize('rider', 'admin'), asyncHandler(getAvailableOrders));
router.get('/assigned', authorize('rider'), asyncHandler(getAssignedOrders));
router.patch('/:id/assign', authorize('vendor', 'admin'), asyncHandler(assignRider));
router.patch('/:id/accept', authorize('rider'), asyncHandler(riderAccept));
router.patch('/:id/pickup', authorize('rider'), asyncHandler(riderPickup));
router.patch('/:id/deliver', authorize('rider'), asyncHandler(riderDeliver));
router.post('/:id/location', authorize('rider'), asyncHandler(updateLocation));
router.get('/:id', asyncHandler(getOrder));
router.patch('/:id/status', authorize('vendor', 'admin'), asyncHandler(updateOrderStatus));

module.exports = router;
