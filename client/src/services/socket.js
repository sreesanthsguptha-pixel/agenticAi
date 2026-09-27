import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true
    });
  }
  return socket;
};

export const subscribeToExecution = (executionId, callback) => {
  const s = getSocket();
  if (s) {
    s.emit('joinExecution', executionId);
    s.on('agentEvent', callback);
  }
  return () => {
    if (s) {
      s.emit('leaveExecution', executionId);
      s.off('agentEvent', callback);
    }
  };
};
