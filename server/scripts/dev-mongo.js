const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbPath = path.join(__dirname, '..', '.data', 'mongo');
const port = Number(process.env.MONGO_PORT || 27017);
const dbName = process.env.MONGO_DB || 'fastapick';

fs.mkdirSync(dbPath, { recursive: true });

const start = async () => {
  const server = await MongoMemoryServer.create({
    instance: { port, dbName, dbPath, storageEngine: 'wiredTiger' },
    binary: process.env.MONGOMS_VERSION
      ? { version: process.env.MONGOMS_VERSION }
      : undefined,
  });

  console.log(`FastaPick durable dev MongoDB running at ${server.getUri()}`);
  console.log(`Data directory: ${dbPath}`);

  const shutdown = async () => {
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start().catch((error) => {
  console.error('Could not start dev MongoDB:', error.message);
  process.exit(1);
});
