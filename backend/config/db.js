// ---------------------------------------------------------
// config/db.js
// Establishes and exports the MongoDB Atlas connection using
// Mongoose. Fails fast with a clear error if the URI is bad
// so misconfiguration never surfaces silently in production.
// ---------------------------------------------------------

const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the URI supplied in the
 * environment. Exits the process on failure since the API
 * cannot function without a database connection.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern Mongoose (6+/8+) no longer needs useNewUrlParser / useUnifiedTopology,
      // they are defaults, but we keep autoIndex explicit for predictable behavior.
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    console.log(`[MongoDB] Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected. Attempting reconnection is handled by the driver.');
    });
  } catch (error) {
    console.error(`[MongoDB] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
