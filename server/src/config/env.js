require('dotenv').config();

const readNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: readNumber(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI,
  mongoDb: process.env.MONGO_DB || 'fastapick',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  clientUrl: process.env.CLIENT_URL || '*',
};

if (!env.mongoUri) {
  throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
}

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
}

module.exports = env;
