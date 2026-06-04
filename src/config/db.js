const mongoose = require('mongoose');
const logger = require('./logger');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from your system environmental variables.');
    }
    // 🚀 Toggle on raw query streaming to see exact hidden errors in your terminal
    mongoose.set('debug', true);
    const options = {
      serverSelectionTimeoutMS: 10000, // Give your network a full 10 seconds to authenticate
      heartbeatFrequencyMS: 2000       // Frequently ping the cluster to keep the pipe open
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    isConnected = true;
    logger.info(`🍃 MongoDB Database Connection Established: Host Cluster [${conn.connection.host || 'Atlas Cloud'}]`);
  } catch (error) {
    logger.error(`❌ CRITICAL DATABASE INITIALIZATION FAILURE: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;