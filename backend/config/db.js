const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seedDB } = require('../seed');
const User = require('../models/User');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jeevan';
    
    try {
      console.log(`Connecting to MongoDB at ${mongoUri}...`);
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      console.log(`Local MongoDB connection failed (${err.message}). Starting In-Memory MongoDB Server...`);
      mongoMemoryServer = await MongoMemoryServer.create({
        binary: {
          version: '4.4.18'
        }
      });
      const inMemoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
    }

    // Auto-seed and sync mock donors on startup
    console.log('Syncing mock donors...');
    await seedDB(true);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
