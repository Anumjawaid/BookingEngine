const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });
};

class AuthService {
  async registerUser(userData) {
    // Structural Rule: Force role to 'user' to block malicious admin sign-ups
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: 'user'
    });

    logger.info(`New user registered successfully: ${newUser.email}`);
    
    const token = signToken(newUser._id, newUser.role);
    newUser.password = undefined; // Strip from memory output
    return { token, user: newUser };
  }

  async loginUser(email, password) {
    // Fetch user and explicitly pull hidden password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      logger.warn(`Failed login attempt flagged for email: ${email}`);
      const error = new Error('Incorrect email address or password configuration.');
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    logger.info(`User authenticated: ${user.email} [Privilege: ${user.role}]`);

    const token = signToken(user._id, user.role);
    user.password = undefined;
    return { token, user };
  }
}

module.exports = new AuthService();