require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    
    const db = client.db('fanatikoin');
    console.log('Connected to database: fanatikoin');
    
    // Test write operation
    const collection = db.collection('test');
    await collection.insertOne({ test: true, timestamp: new Date() });
    console.log('Successfully wrote test document');
    
    // Test read operation
    const doc = await collection.findOne({ test: true });
    console.log('Successfully read test document:', doc);
    
    // Clean up
    await collection.deleteOne({ test: true });
    console.log('Successfully cleaned up test document');
    
    await client.close();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
