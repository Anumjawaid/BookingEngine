const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // 🚀 Senior Step: Log the complete error trace with details cleanly to files/terminal
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: err.stack
  });

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

module.exports = { errorHandler };