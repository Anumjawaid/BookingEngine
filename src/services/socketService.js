const { Server } = require('socket.io');
const logger = require('../config/logger');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // 🧠 Maps UserID ➔ SocketID so we can find individuals instantly
  }

  /**
   * Initializes the Socket.io server layer
   * @param {Object} httpServer - The native Node.js HTTP server instance
   */
  initialize(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*', // In production, restrict this to your specific frontend domain
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`📡 New real-time connection established: Socket ID [${socket.id}]`);

      // Register active user when they log into the socket network
      socket.on('register_user', (userId) => {
        this.connectedUsers.set(userId, socket.id);
        logger.info(`👤 User [${userId}] linked to Socket [${socket.id}]. Active users: ${this.connectedUsers.size}`);
      });

      // Handle disconnects cleanly to avoid sending messages into dead sockets
      socket.on('disconnect', () => {
        for (const [userId, socketId] of this.connectedUsers.entries()) {
          if (socketId === socket.id) {
            this.connectedUsers.delete(userId);
            logger.info(`🔌 User [${userId}] disconnected from real-time layer.`);
            break;
          }
        }
      });
    });
  }

  /**
   * Universal messaging utility to alert a specific active user
   * @param {string} userId - Target database User ID
   * @param {string} eventName - Socket channel identifier (e.g., 'booking_confirmed')
   * @param {Object} data - Payload matrix object
   */
  sendToUser(userId, eventName, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(eventName, data);
      logger.info(`⚡ Live update fired to User [${userId}] via channel [${eventName}]`);
      return true;
    }
    logger.warn(`⚠️ Attempted to send live alert to User [${userId}], but they are currently offline.`);
    return false;
  }
}

module.exports = new SocketService();