const mongoose = require('mongoose');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const bcrypt= require('bcryptjs');

const signToken = (id) => {
  // 🛡️ Fail-fast guard clause
  console.log('🔐 Attempting to sign JWT token for user ID:', id, "token", process.env.JWT_SECRET);
  if (!process.env.JWT_SECRET) {
    throw new Error('CRITICAL CONFIGURATION ERROR: JWT_SECRET environment variable is not defined.');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

class AuthService {
  async registerUser(userData) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // 1. Stage user creation inside the session wrapper
      const newUsers = await User.create([userData], { session });
      const user = newUsers[0];
      // 🚀 THE FIX: Explicitly remove the password from the object instance memory output
      // converting it to a plain object or setting it to undefined prevents it from serializing to JSON
      user.password = undefined;

      // 2. Generate security signature parameters
      const token = signToken(user._id);

      // 🚀 THE CRITICAL FIXED LAYER: Only commit if the transaction state is still active
      if (session.inTransaction()) {
        await session.commitTransaction();
      } else {
        throw new Error('Transaction was internally aborted by the database engine prior to commit execution.');
      }

      return { user, token };

    } catch (error) {
      // Emergency brake handles rolling back gracefully if active
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      session.endSession();
    }
  }


  async loginUser(email, password) {
    // 1. Validate input presence immediately (Early Guard Clause)
    if (!email || !password) {
      const error = new Error('Please provide both an email address and a password.');
      error.statusCode = 400;
      error.status = 'fail';
      throw error;
    }

    // 2. Fetch the user and explicitly pull the hidden password hash using '.select("+password")'
    const user = await User.findOne({ email }).select('+password');

    // 3. Security Blind Check: If user doesn't exist, OR password check fails, return the EXACT same error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      const error = new Error('Invalid email or password configuration.');
      error.statusCode = 401; // 401 Unauthorized status code
      error.status = 'fail';
      throw error;
    }

    // 4. Generate the access token
    const token = signToken(user._id);

    // 5. Explicitly strip the password hash from the object instance before sending it to the controller
    user.password = undefined;

    return { user, token };
  }
}

module.exports = new AuthService();