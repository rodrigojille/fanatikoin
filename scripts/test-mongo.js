// scripts/test-mongo.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fanatikoin';

(async () => {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    await client.db().admin().ping();
    console.log('MongoDB connection successful:', uri);
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
})();
