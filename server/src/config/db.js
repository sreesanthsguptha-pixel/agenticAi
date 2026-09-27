const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');
const inMemoryStore = require('./inMemoryStore');

let isConnected = false;
let isInMemory = false;

const connectDB = async () => {
  try {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsErr) {
      // Ignore if setServers fails in restrictive network environments
    }
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('[Database] Connected to MongoDB successfully.');
  } catch (error) {
    isInMemory = true;
    console.log(`[Database] MongoDB connection failed: ${error.message}`);
    console.log('[Database] Operating in IN-MEMORY STORAGE mode.');
  }
};

const getDBState = () => ({
  isConnected,
  isInMemory
});

module.exports = {
  connectDB,
  getDBState
};
