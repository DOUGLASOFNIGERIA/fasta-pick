const app = require('./app');
const env = require('./config/env');

const PORT = env.port;

if (require.main === module) {
  const connectDB = require('./config/db');
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`FastaPick API running on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Could not connect to MongoDB:', error.message);
      process.exit(1);
    });
}

module.exports = app;
