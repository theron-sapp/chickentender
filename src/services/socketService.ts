// chickentender/src/services/socketService.ts
import {useEffect, useState, useCallback} from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; // Update as needed
const socket = io(SOCKET_URL);

const useSocket = (eventName, handler) => {
  useEffect(() => {
    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, handler]);
};

export const joinSessionRoom = (sessionCode, username) => {
  socket.emit('join session', sessionCode, username);
};

export const emitDoneVoting = (sessionCode, username) => {
  socket.emit('done voting', sessionCode, username);
};

export const startVoting = sessionCode => {
  console.log(`Emitting start voting for session code: ${sessionCode}`);
  socket.emit('start voting', sessionCode);
};

export const subscribeToUserJoined = callback => {
  socket.on('user joined', callback);
  return () => socket.off('user joined', callback);
};

export const subscribeToVotingStarted = (callback: () => void) => {
  socket.on('voting started', () => {
    console.log('Voting started event received');
    callback();
  });
  return () => socket.off('voting started', callback);
};

// socketService.ts
export const subscribeToVotingComplete = callback => {
  socket.on('voting complete', callback);
  return () => socket.off('voting complete', callback);
};

export default useSocket;
