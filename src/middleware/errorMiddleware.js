const logger = require('../config/logger');

// Helper function: Converts native Mongoose Validation Errors into clean 400 bad requests
const handleMongooseValidationError = (err) => {
  // Extract the specific message from Mongoose error fields array
  const messages = Object.values(err.errors).map(el => el.message);
  
  const cleanMessage = `Invalid input data: ${messages.join(' ')}`;
  
  // Construct a standard Operational Error
  const error = new Error(cleanMessage);
  error.statusCode = 400; // Bad Request
  return error;
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // 🧠 Detect if the error came specifically from a Mongoose validation failure
  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  }

  // Log the error trace tracking metric via Winston
  logger.error(`${error.statusCode} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Send a clean, standardized JSON payload to the user
  res.status(error.statusCode).json({
    status: 'error',
    message: error.message,
    // Provide structural traces only while testing locally
    stack: process.env.NODE_ENV === 'development' ? err.stack : null
  });
};

module.exports = { errorHandler };