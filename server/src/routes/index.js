const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'FastaPick API',
    tagline: 'Good food, fast. Right here in Ekiti.',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/restaurants',
      '/api/orders',
    ],
  });
});

module.exports = router;
