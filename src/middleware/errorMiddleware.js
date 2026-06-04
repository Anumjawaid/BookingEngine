const logger = require('../config/logger');

// 🚀 RULE 1: Helper functions must be defined BEFORE the main middleware function reads them
const handleDuplicateKeyError = (err) => {
  // Graceful fallback if keyValue parsing fails unexpectedly
  if (!err.keyValue) {
    return {
      statusCode: 400,
      status: 'fail',
      message: 'This record already exists in our system.'
    };
  }

  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  
  const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
  const customMessage = `${capitalizedField} '${value}' is already registered in our system. Please use another one or log in.`;
  
  return {
    statusCode: 400,
    status: 'fail',
    message: customMessage
  };
};

// 🏛️ Centralized Error Handler Middleware Gateway
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message || 'An unexpected server error occurred.';

  // 🔍 1. Intercept Mongoose Schema Validation Failures
  if (err.name === 'ValidationError') {
    statusCode = 400;
    status = 'fail';
    message = Object.values(err.errors).map(el => el.message).join('. ');
  }

  // 🔍 2. Intercept MongoDB Unique Index Duplications (Error Code 11000)
  if (err.code === 11000) {
    const formattedErr = handleDuplicateKeyError(err);
    statusCode = formattedErr.statusCode;
    status = formattedErr.status;
    message = formattedErr.message;
  }

  // 📝 3. Stream Comprehensive Diagnostic Metrics into Winston Logs
  logger.error({
    message: `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
    stack: err.stack,
    requestBody: req.body ? JSON.stringify(req.body) : 'No Body'
  });

  // 🛡️ 4. Public Security Messaging Guard
  let publicMessage = message;
  if (statusCode === 500) {
    publicMessage = 'Something went wrong internally on our servers. Our engineering team has been notified.';
  }

  // 🚀 5. Dynamic Environment Structuring Output
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      status: status,
      message: message,
      stack: err.stack
    });
  }

  // Production Mode (Absolute isolation from stack details)
  return res.status(statusCode).json({
    status: status,
    message: publicMessage
  });
};

module.exports = { errorHandler };