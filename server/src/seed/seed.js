require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const connectDB = require('../config/db');
const { ROLES } = require('../constants/roles');

const img = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const PHOTOS = {
  jollof: img('photo-1512058564366-18510be2db19'),
  rice: img('photo-1601050690597-df0568f70950'),
  burger: img('photo-1568901346375-23c9450c58cd'),
  pizza: img('photo-1565299624946-b28f40a0ae38'),
  salad: img('photo-1512621776951-a57141f2eefd'),
  bowl: img('photo-1546069901-ba9599a7e63c'),
  grill: img('photo-1555939594-58d7cb561ad1'),
  suya: img('photo-1529193591184-b1d58069ecdd'),
  soup: img('photo-1547592180-85f173990554'),
  fish: img('photo-1519708227418-c8fd9a32b7a2'),
  chicken: img('photo-1532550907401-a500c9a57435'),
  fries: img('photo-1573080496219-bb080dd4f877'),
  cake: img('photo-1565958011703-44f9829ba187'),
  puff: img('photo-1551024506-0bccd828d307'),
  drink: img('photo-1544145945-f90425340c7e'),
  pasta: img('photo-1473093295043-cdd812d0e601'),
  breakfast: img('photo-1482049016688-2d3e1b311543'),
  restaurant: img('photo-1517248135467-4c7edcad34c4'),
  buka: img('photo-1552566626-52f8b828add9'),
};

const restaurants = [
  {
    slug: 'ado-buka-kitchen',
    name: 'Ado Buka Kitchen',
    description:
      'The taste of home in every bite. Classic Nigerian buka meals made fresh daily in the heart of Ado-Ekiti.',
    image: PHOTOS.buka,
    coverImage: PHOTOS.restaurant,
    cuisines: ['Nigerian', 'Local', 'Buka'],
    categories: ['Rice', 'Soups & Swallows', 'Mains', 'Local foods', 'Water'],
    city: 'Ado-Ekiti',
    area: 'Ado Central',
    address: '12 Oyin Street, Ado-Ekiti, Ekiti State',
    rating: 4.8,
    reviewCount: 428,
    deliveryMin: 20,
    deliveryMax: 35,
    deliveryFee: 250,
    minimumOrder: 1000,
    isFeatured: true,
    promo: '20% off your first order',
  },
  {
    slug: 'ekiti-grill-house',
    name: 'Ekiti Grill House',
    description:
      'Smoky suya, perfectly grilled chicken and spicy pepper soup. Fire-kissed flavour, delivered hot.',
    image: PHOTOS.grill,
    coverImage: PHOTOS.suya,
    cuisines: ['Grills', 'Suya', 'Nigerian'],
    categories: ['Grills', 'Soups & Swallows', 'Mains', 'Local foods', 'Water'],
    city: 'Ado-Ekiti',
    area: 'Ijigbo',
    address: '5 Ijigbo Road, Ado-Ekiti, Ekiti State',
    rating: 4.7,
    reviewCount: 316,
    deliveryMin: 30,
    deliveryMax: 45,
    deliveryFee: 400,
    minimumOrder: 1500,
    isFeatured: true,
    promo: 'Free pepper soup over ₦5,000',
  },
  {
    slug: 'mama-ereje-place',
    name: "Mama Ereje's Place",
    description:
      'Legendary pounded yam and egusi, amala and ewedu, plus the softest puff-puff in Ekiti.',
    image: PHOTOS.soup,
    coverImage: PHOTOS.buka,
    cuisines: ['Nigerian', 'Soups', 'Local'],
    categories: ['Soups & Swallows', 'Snacks', 'Mains', 'Local foods', 'Water'],
    city: 'Ado-Ekiti',
    area: 'Irona',
    address: 'Irona Layout, Ado-Ekiti, Ekiti State',
    rating: 4.9,
    reviewCount: 612,
    deliveryMin: 25,
    deliveryMax: 40,
    deliveryFee: 200,
    minimumOrder: 800,
    isFeatured: true,
    promo: '',
  },
  {
    slug: 'fast-bites-express',
    name: 'Fast Bites Express',
    description:
      'Burgers, fries and shakes done right. When hunger cannot wait, we are your fastest pick.',
    image: PHOTOS.burger,
    coverImage: PHOTOS.fries,
    cuisines: ['Fast Food', 'Burgers', 'Continental'],
    categories: ['Burgers', 'Sides', 'Drinks', 'Water'],
    city: 'Ikere-Ekiti',
    area: 'Ikere Town',
    address: 'Oja Oba Road, Ikere-Ekiti, Ekiti State',
    rating: 4.5,
    reviewCount: 204,
    deliveryMin: 15,
    deliveryMax: 25,
    deliveryFee: 300,
    minimumOrder: 1200,
    isFeatured: false,
    promo: 'Buy 1 burger, get fries free',
  },
  {
    slug: 'spice-route-ekiti',
    name: 'Spice Route Ekiti',
    description:
      'A little spice, a lot of soul. Jollof, pasta, grilled fish and continental favourites with a Nigerian twist.',
    image: PHOTOS.pasta,
    coverImage: PHOTOS.fish,
    cuisines: ['Nigerian', 'Continental', 'Pasta'],
    categories: ['Rice', 'Pasta', 'Mains', 'Grills', 'Local foods', 'Water'],
    city: 'Oye-Ekiti',
    area: 'Oye Campus',
    address: 'Near FUOYE, Oye-Ekiti, Ekiti State',
    rating: 4.6,
    reviewCount: 189,
    deliveryMin: 30,
    deliveryMax: 50,
    deliveryFee: 350,
    minimumOrder: 1000,
    isFeatured: false,
    promo: '',
  },
  {
    slug: 'sweet-tooth-ekiti',
    name: 'Sweet Tooth Ekiti',
    description:
      'Cakes, small chops and sweet treats baked fresh every morning. Perfect for that afternoon craving.',
    image: PHOTOS.cake,
    coverImage: PHOTOS.puff,
    cuisines: ['Bakery', 'Desserts', 'Snacks'],
    categories: ['Desserts', 'Snacks', 'Drinks', 'Water'],
    city: 'Ado-Ekiti',
    area: 'Odo Ado',
    address: 'Odo Ado Market Road, Ado-Ekiti, Ekiti State',
    rating: 4.8,
    reviewCount: 274,
    deliveryMin: 20,
    deliveryMax: 30,
    deliveryFee: 250,
    minimumOrder: 500,
    isFeatured: false,
    promo: 'Free delivery on dessert boxes',
  },
  {
    slug: 'green-bowl',
    name: 'Green Bowl',
    description:
      'Fresh, light and guilt-free. Salads, grain bowls and smoothies made with locally sourced produce.',
    image: PHOTOS.salad,
    coverImage: PHOTOS.bowl,
    cuisines: ['Healthy', 'Salads', 'Continental'],
    categories: ['Healthy', 'Drinks', 'Mains', 'Water'],
    city: 'Ikole-Ekiti',
    area: 'Ikole Town',
    address: 'Government Road, Ikole-Ekiti, Ekiti State',
    rating: 4.4,
    reviewCount: 97,
    deliveryMin: 25,
    deliveryMax: 40,
    deliveryFee: 300,
    minimumOrder: 1500,
    isFeatured: false,
    promo: '',
  },
];

const menuBySlug = {
  'ado-buka-kitchen': [
    ['Party Jollof Rice', 'Smoky party-style jollof with a rich tomato and pepper base.', 1800, 'Rice', PHOTOS.jollof, true, 2, ['Bestseller']],
    ['Jollof & Chicken', 'Our famous jollof paired with a juicy grilled chicken thigh.', 2800, 'Rice', PHOTOS.chicken, true, 2, ['Combo']],
    ['Fried Rice & Turkey', 'Golden fried rice with tender peppered turkey.', 3200, 'Rice', PHOTOS.rice, false, 1, []],
    ['Pounded Yam & Egusi', 'Smooth pounded yam with a rich, thick egusi soup.', 2200, 'Soups & Swallows', PHOTOS.soup, true, 1, ['Bestseller']],
    ['Amala & Ewedu', 'Soft amala with ewedu and gbegiri, served with shaki.', 1800, 'Soups & Swallows', PHOTOS.soup, false, 1, []],
    ['Efo Riro & Rice', 'Nigerian spinach stew packed with fish and pepper.', 2000, 'Soups & Swallows', PHOTOS.bowl, false, 2, []],
    ['Pepper Soup', 'Fiery catfish pepper soup with local spices.', 1500, 'Mains', PHOTOS.fish, false, 3, ['Spicy']],
    ['Zobo Drink', 'Chilled homemade hibiscus drink, lightly sweetened.', 400, 'Drinks', PHOTOS.drink, false, 0, []],
    ['Yam Pottage', 'Local yam pottage with palm oil, pepper and smoked fish.', 1600, 'Local foods', PHOTOS.bowl, false, 1, ['Local']],
    ['Chilled Bottled Water', 'Cold bottled water, served chilled.', 300, 'Water', PHOTOS.drink, false, 0, []],
  ],
  'ekiti-grill-house': [
    ['Beef Suya', 'Thinly sliced beef coated in our signature yaji spice.', 2000, 'Grills', PHOTOS.suya, true, 3, ['Bestseller', 'Spicy']],
    ['Grilled Chicken', 'Whole chicken marinated overnight and grilled to perfection.', 3500, 'Grills', PHOTOS.chicken, true, 2, []],
    ['Peppered Fish', 'Fresh catfish smothered in a fiery pepper sauce.', 3800, 'Grills', PHOTOS.fish, false, 3, ['Spicy']],
    ['Chicken Pepper Soup', 'A warming bowl of pepper soup with tender chicken.', 1800, 'Soups & Swallows', PHOTOS.soup, false, 2, []],
    ['Suya Wrap', 'Suya, fresh vegetables and house sauce in a soft wrap.', 1600, 'Mains', PHOTOS.suya, false, 2, []],
    ['Jollof & Suya', 'The best of both worlds: party jollof with spicy suya.', 2900, 'Mains', PHOTOS.jollof, false, 3, ['Combo']],
    ['Puff-Puff', 'Golden, fluffy puff-puff dusted with sugar.', 600, 'Snacks', PHOTOS.puff, false, 0, []],
    ['Chapman', 'A classic Nigerian chapman, chilled and refreshing.', 700, 'Drinks', PHOTOS.drink, false, 0, []],
    ['Local Pepper Soup', 'A spicy local pepper soup with fresh catfish.', 1800, 'Local foods', PHOTOS.soup, false, 3, ['Local', 'Spicy']],
    ['Chilled Bottled Water', 'Cold bottled water, served chilled.', 300, 'Water', PHOTOS.drink, false, 0, []],
  ],
  'mama-ereje-place': [
    ['Pounded Yam & Egusi', 'The house special. Pounded yam served with thick, flavourful egusi.', 2400, 'Soups & Swallows', PHOTOS.soup, true, 0, ['Bestseller']],
    ['Amala & Ewedu', 'Fresh amala with ewedu and gbegiri plus assorted meat.', 1800, 'Soups & Swallows', PHOTOS.soup, true, 0, []],
    ['Eba & Okra', 'Eba served with a rich, slimy okra soup and dried fish.', 1600, 'Soups & Swallows', PHOTOS.bowl, false, 1, []],
    ['Moi Moi', 'Steamed bean pudding with fish and pepper.', 800, 'Snacks', PHOTOS.breakfast, false, 1, []],
    ['Puff-Puff & Tea', 'Warm puff-puff with a cup of Nigerian tea.', 900, 'Snacks', PHOTOS.puff, false, 0, ['Combo']],
    ['Jollof Rice', 'Mama’s slow-cooked jollof with a deep smoky flavour.', 1800, 'Mains', PHOTOS.jollof, false, 1, []],
    ['Kunu', 'Chilled millet drink, slightly sweet and creamy.', 400, 'Drinks', PHOTOS.drink, false, 0, []],
    ['Local Rice & Beans', 'Potter-style rice and beans cooked with local spices.', 1500, 'Local foods', PHOTOS.rice, false, 1, ['Local']],
    ['Chilled Bottled Water', 'Cold bottled water, served chilled.', 300, 'Water', PHOTOS.drink, false, 0, []],
  ],
  'fast-bites-express': [
    ['Classic Beef Burger', 'Juicy beef patty, lettuce, tomato and our special sauce.', 2200, 'Burgers', PHOTOS.burger, true, 0, ['Bestseller']],
    ['Double Cheese Burger', 'Two patties, double cheese and crispy onions.', 2900, 'Burgers', PHOTOS.burger, false, 0, []],
    ['Chicken Burger', 'Crispy chicken fillet with coleslaw and mayo.', 2000, 'Burgers', PHOTOS.chicken, false, 1, []],
    ['Large Fries', 'Golden, crispy and perfectly salted.', 900, 'Sides', PHOTOS.fries, false, 0, []],
    ['Chicken Wings', 'Six spicy wings with a side of garlic dip.', 1900, 'Sides', PHOTOS.chicken, false, 2, ['Spicy']],
    ['Chocolate Shake', 'Thick, creamy chocolate milkshake.', 1200, 'Drinks', PHOTOS.drink, false, 0, []],
    ['Pepperoni Pizza', 'A personal pizza loaded with pepperoni and cheese.', 2800, 'Mains', PHOTOS.pizza, false, 1, []],
    ['Chilled Bottled Water', 'Cold bottled water, served chilled.', 300, 'Water', PHOTOS.drink, false, 0, []],
  ],
  'spice-route-ekiti': [
    ['Party Jollof Rice', 'Smoky, rich and cooked the traditional way.', 1900, 'Rice', PHOTOS.jollof, true, 2, ['Bestseller']],
    ['Coconut Rice', 'Fragrant rice cooked in coconut milk with a hint of pepper.', 2000, 'Rice', PHOTOS.rice, false, 1, []],
    ['Chicken Alfredo', 'Creamy pasta with grilled chicken and parmesan.', 2800, 'Pasta', PHOTOS.pasta, true, 0, []],
    ['Pepperoni Pasta', 'Tomato-based pasta with spicy pepperoni and herbs.', 2600, 'Pasta', PHOTOS.pasta, false, 2, ['Spicy']],
    ['Grilled Tilapia', 'Whole tilapia grilled with onions and pepper sauce.', 3600, 'Grills', PHOTOS.fish, false, 2, []],
    ['Suya Chicken', 'Chicken skewers coated in our house yaji.', 2400, 'Grills', PHOTOS.suya, false, 3, ['Spicy']],
    ['Fresh Lemonade', 'Homemade lemonade, sweet and tangy.', 600, 'Drinks', PHOTOS.drink, false, 0, []],
    ['Ekiti Jollof & Moi Moi', 'Smoky local jollof served with steamed moi moi.', 2300, 'Local foods', PHOTOS.jollof, false, 1, ['Local']],
    ['Chilled Bottled Water', 'Cold bottled water, served chilled.', 300, 'Water', PHOTOS.drink, false, 0, []],
  ],
  'sweet-tooth-ekiti': [
    ['Chocolate Cake Slice', 'Rich, moist chocolate cake with ganache.', 1200, 'Desserts', PHOTOS.cake, true, 0, ['Bestseller']],
    ['Vanilla Cupcake', 'Light vanilla cupcake with buttercream frosting.', 800, 'Desserts', PHOTOS.cake, false, 0, []],
    ['Puff-Puff (10 pcs)', 'A dozen golden, sugar-dusted puff-puff.', 1000, 'Snacks', PHOTOS.puff, true, 0, []],
    ['Meat Pie', 'Flaky pastry filled with seasoned beef and potato.', 900, 'Snacks', PHOTOS.breakfast, false, 1, []],
    ['Cinnamon Roll', 'Soft roll with a sweet cinnamon swirl.', 1100, 'Desserts', PHOTOS.cake, false, 0, []],
    ['Iced Coffee', 'Chilled coffee with cream and a touch of vanilla.', 900, 'Drinks', PHOTOS.drink, false, 0, []],
    ['Chilled Bottled Water', 'Cold bottled water, served chilled.', 300, 'Water', PHOTOS.drink, false, 0, []],
  ],
  'green-bowl': [
    ['Chicken Caesar Bowl', 'Grilled chicken, romaine, parmesan and light caesar dressing.', 2900, 'Healthy', PHOTOS.salad, true, 0, ['Bestseller']],
    ['Rainbow Veggie Bowl', 'A colourful mix of fresh vegetables, quinoa and avocado.', 2500, 'Healthy', PHOTOS.bowl, false, 0, []],
    ['Grilled Salmon Bowl', 'Salmon, brown rice and steamed greens.', 3900, 'Healthy', PHOTOS.fish, false, 0, []],
    ['Fruit Smoothie', 'Blended seasonal fruits, no added sugar.', 1300, 'Drinks', PHOTOS.drink, false, 0, []],
    ['Green Detox Juice', 'Spinach, cucumber, apple and ginger.', 1400, 'Drinks', PHOTOS.drink, false, 0, []],
    ['Yam & Egg Bowl', 'Boiled yam, boiled egg and fresh vegetables.', 2100, 'Mains', PHOTOS.breakfast, false, 0, []],
    ['Chilled Bottled Water', 'Cold bottled water, served chilled.', 300, 'Water', PHOTOS.drink, false, 0, []],
  ],
};

const seed = async () => {
  try {
    await connectDB();
    await MenuItem.deleteMany({});
    await Restaurant.deleteMany({});

    const demoUsers = [
      {
        name: 'Ada Vendor',
        email: 'vendor@fastapick.test',
        phone: '0803 000 0101',
        password: 'password123',
        role: ROLES.VENDOR,
        city: 'Ado-Ekiti',
      },
      {
        name: 'Tunde Rider',
        email: 'rider@fastapick.test',
        phone: '0803 000 0102',
        password: 'password123',
        role: ROLES.RIDER,
        city: 'Ado-Ekiti',
      },
      {
        name: 'Fasta Admin',
        email: 'admin@fastapick.test',
        phone: '0803 000 0103',
        password: 'password123',
        role: ROLES.ADMIN,
        city: 'Ado-Ekiti',
      },
    ];

    const demoAccounts = {};
    for (const details of demoUsers) {
      let user = await User.findOne({ email: details.email });
      if (!user) user = await User.create(details);
      demoAccounts[details.role] = user;
    }

    const created = await Restaurant.insertMany(
      restaurants.map((restaurant) => ({
        ...restaurant,
        owner: demoAccounts.vendor._id,
      }))
    );
    const bySlug = Object.fromEntries(created.map((r) => [r.slug, r]));

    const menuDocs = [];
    Object.entries(menuBySlug).forEach(([slug, items]) => {
      items.forEach(
        ([name, description, price, category, image, popular, spiceLevel, tags]) => {
          menuDocs.push({
            restaurant: bySlug[slug]._id,
            name,
            description,
            price,
            category,
            image,
            popular,
            available: true,
            prepTime: 10 + Math.floor(Math.random() * 15),
            spiceLevel,
            tags,
          });
        }
      );
    });

    await MenuItem.insertMany(menuDocs);

    console.log(`Seeded ${created.length} restaurants and ${menuDocs.length} menu items.`);
    console.log(
      'Demo staff: vendor@fastapick.test / rider@fastapick.test / admin@fastapick.test (password123)'
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
