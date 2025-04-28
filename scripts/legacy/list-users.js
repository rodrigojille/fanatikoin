// scripts/list-users.js
require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fanatikoin';

// Set this to the wallet address you want to update (from your profile page)
const WALLET_ADDRESS = '0xc09b02ddb3bbcc78fc47446d8d74e677ba8db3e8';
const ROLE_TO_ASSIGN = 'fan'; // Change to 'admin' or 'team' if needed

(async () => {
  try {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    await client.connect();
    const db = client.db();
    const usersCol = db.collection('users');

    // 1. Print all users
    const users = await usersCol.find({}).toArray();
    console.log('All users in DB:');
    users.forEach(u => console.log(u));

    // 2. Update the role for the user with the given wallet address
    const updateResult = await usersCol.updateOne(
      { walletAddress: WALLET_ADDRESS },
      { $set: { role: ROLE_TO_ASSIGN } }
    );
    if (updateResult.matchedCount > 0) {
      console.log(`Updated user ${WALLET_ADDRESS} with role '${ROLE_TO_ASSIGN}'.`);
    } else {
      console.log(`No user found with walletAddress ${WALLET_ADDRESS}.`);
    }

    // 3. Print the updated user
    const updatedUser = await usersCol.findOne({ walletAddress: WALLET_ADDRESS });
    console.log('Updated user:', updatedUser);

    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed to fetch/update users:', err.message);
    process.exit(1);
  }
})();
