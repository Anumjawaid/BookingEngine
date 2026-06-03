const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Establish structural defaults
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message;

  // 🔍 1. INTERCEPT MONGOOSE VALIDATION ERRORS (User Input Faults)
  if (err.name === 'ValidationError') {
    statusCode = 400; // Demote from 500 server error to a 400 Bad Request
    status = 'fail';
    
    // Loop through the fields (email, password, etc.) and join their custom schema messages
    message = Object.values(err.errors)
      .map(el => el.message)
      .join('. ');
  }

  // 2. 📝 INTERNAL METRICS LOGGING
  // We still log everything internally so you have a complete paper trail in your files
  logger.error({
    message: `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    stack: err.stack,
    requestBody: req.body ? JSON.stringify(req.body) : 'No Body'
  });

  // 3. 🛡️ CLEAN PUBLIC MESSAGING GATEWAY
  // If it's a true 500 server error, keep it hidden. Otherwise, show the human message!
  let publicMessage = message;
  if (statusCode === 500) {
    publicMessage = 'Something went wrong internally on our servers. Our engineering team has been notified.';
  }

  // 4. ENVIRONMENT RESPONSES
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status: status,
      message: message, // In dev, you see the exact human string directly
      stack: err.stack
    });
  }

  // 🚀 PRODUCTION MODE: Absolute security isolation
  return res.status(statusCode).json({
    status: status,
    message: publicMessage // In production, users see clean input tips, but server crashes stay hidden!
  });
};

module.exports = { errorHandler };