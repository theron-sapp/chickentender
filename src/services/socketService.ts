// services/socketService.ts
import io from 'socket.io-client';

// Initialize the socket connection (update the URL to match your server's location)
const SOCKET_URL = 'http://localhost:3000';
const socket = io(SOCKET_URL);

export const joinSessionRoom = (sessionCode: string, userId: string) => {
  socket.emit('join session', sessionCode, userId);
};

export const subscribeToUserJoined = (
  callback: (user: {userId: string}) => void,
) => {
  socket.on('user joined', callback);
};

export const unsubscribeFromUserJoined = () => {
  socket.off('user joined'); // This should match the subscription event key
};

export const startVoting = (sessionCode: string) => {
  socket.emit('start voting', sessionCode);
};

export const subscribeToVotingStarted = (callback: () => void) => {
  socket.on('voting started', callback);
};

export const unsubscribeFromVotingStarted = () => {
  socket.off('voting started');
};

export const subscribeToVotingComplete = (callback: (results: any) => void) => {
  socket.on('voting complete', callback);

  // Return a function to unsubscribe from the event
  return () => {
    socket.off('voting complete', callback);
  };
};

export const unsubscribeFromVotingComplete = () => {
  socket.off('voting complete');
};

export const subscribeToResults = (callback: (results: any) => void) => {
  socket.on('results', callback);
};

export const unsubscribeFromResults = () => {
  socket.off('results');
};

export const emitDoneVoting = ({
  sessionCode,
  userId,
}: {
  sessionCode: string;
  userId: string;
}) => {
  socket.emit('done voting', {sessionCode, userId});
};

export default socket;
