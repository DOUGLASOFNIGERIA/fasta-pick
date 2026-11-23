const express = require('express');
const {
  getRestaurants,
  getRestaurant,
  getMenu,
  getCategories,
  getCities,
} = require('../controllers/restaurantController');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

router.get('/', asyncHandler(getRestaurants));
router.get('/categories', asyncHandler(getCategories));
router.get('/cities', asyncHandler(getCities));
router.get('/:id/menu', asyncHandler(getMenu));
router.get('/:id', asyncHandler(getRestaurant));

module.exports = router;
