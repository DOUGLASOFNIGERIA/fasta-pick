const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDb,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 20,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true,
  });
  return conn;
};

module.exports = connectDB;
