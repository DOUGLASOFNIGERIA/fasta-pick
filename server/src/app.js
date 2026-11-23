const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error');
const routes = require('./routes');

const app = express();
let dbReady = null;

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
      origin:
      env.clientUrl && env.clientUrl !== '*'
        ? env.clientUrl.split(',')
        : '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' },
  })
);

app.use(async (req, res, next) => {
  if (!dbReady) {
    dbReady = connectDB().catch((error) => {
      dbReady = null;
      throw error;
    });
  }
  try {
    await dbReady;
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api', routes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
