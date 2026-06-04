// 1. Load system environmental configuration tables immediately
require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db'); // <-- Import the database module
const socketService = require('./services/socketService');
const logger = require('./config/logger');

// 🚀 CRITICAL ARCHITECTURAL STEP: Execute the database connection lifecycle
connectDB();

const server = http.createServer(app);

// Initialize Socket.io matrices
socketService.initialize(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Secure Enterprise Server fully operational on port ${PORT} [Epoch: 2026]`);
});