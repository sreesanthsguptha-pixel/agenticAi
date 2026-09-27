const { Server } = require('socket.io');

let io = null;

const initSocket = (server, clientUrl) => {
  io = new Server(server, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('joinExecution', (executionId) => {
      socket.join(`execution_${executionId}`);
      console.log(`[Socket.IO] Client ${socket.id} joined room execution_${executionId}`);
    });

    socket.on('leaveExecution', (executionId) => {
      socket.leave(`execution_${executionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => io;

const emitExecutionEvent = (executionId, payload) => {
  if (io) {
    io.to(`execution_${executionId}`).emit('agentEvent', payload);
    io.emit('globalExecutionUpdate', payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitExecutionEvent
};
