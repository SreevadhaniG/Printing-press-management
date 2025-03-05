const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    return client.db('pentagon-press');
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

module.exports = { connectDB, client };