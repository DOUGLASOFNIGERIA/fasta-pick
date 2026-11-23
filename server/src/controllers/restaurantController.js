const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

exports.getRestaurants = async (req, res) => {
  const { search, category, city, featured, sort } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { cuisines: { $regex: search, $options: 'i' } },
      { categories: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) query.categories = { $regex: category, $options: 'i' };
  if (city) query.city = { $regex: city, $options: 'i' };
  if (featured === 'true') query.isFeatured = true;

  let sortOption = { isFeatured: -1, rating: -1 };
  if (sort === 'fastest') sortOption = { deliveryMin: 1 };
  if (sort === 'rating') sortOption = { rating: -1 };
  if (sort === 'fee') sortOption = { deliveryFee: 1 };

  const restaurants = await Restaurant.find(query).sort(sortOption).lean();

  const counts = await MenuItem.aggregate([
    { $match: { restaurant: { $in: restaurants.map((r) => r._id) } } },
    { $group: { _id: '$restaurant', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  res.status(200).json({
    success: true,
    count: restaurants.length,
    restaurants: restaurants.map((r) => ({
      ...r,
      menuCount: countMap[String(r._id)] || 0,
    })),
  });
};

exports.getRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id).lean();
  if (!restaurant) {
    res.status(404);
    throw new Error('We could not find that restaurant.');
  }
  const menu = await MenuItem.find({ restaurant: restaurant._id }).lean();
  const categories = [...new Set(menu.map((item) => item.category))];

  res.status(200).json({
    success: true,
    restaurant: { ...restaurant, menu, categories },
  });
};

exports.getMenu = async (req, res) => {
  const menu = await MenuItem.find({ restaurant: req.params.id }).sort({
    popular: -1,
    name: 1,
  });
  res.status(200).json({ success: true, count: menu.length, menu });
};

exports.getCategories = async (req, res) => {
  const restaurants = await Restaurant.find().select('cuisines categories');
  const all = new Set();
  restaurants.forEach((r) => {
    [...r.cuisines, ...r.categories].forEach((c) => all.add(c));
  });
  res.status(200).json({ success: true, categories: [...all].sort() });
};

exports.getCities = async (req, res) => {
  const cities = await Restaurant.distinct('city');
  res.status(200).json({ success: true, cities: cities.sort() });
};
