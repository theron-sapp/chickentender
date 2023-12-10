// chickentender/src/services/socketService.ts
import {useEffect} from 'react';
import io, {Socket} from 'socket.io-client';
import {User} from '../types/UserType';
import {EventName} from '../types/EventNameType';
import {Platform} from 'react-native';

let socket: Socket | null = null;

let BASE_URL: string; // Declare BASE_URL as a string

const prod = false;

if (prod) {
  BASE_URL = 'https://thawing-temple-25026-f4399745428d.herokuapp.com/api';
} else {
  if (Platform.OS === 'ios') {
    BASE_URL = 'http://localhost:3000/api';
  } else {
    BASE_URL = 'http://10.0.2.2:3000/api';
  }
}

export const initializeSocket = () => {
  disconnectSocket(); // Disconnect existing socket if any
  socket = io(BASE_URL);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const useSocket = (eventName: EventName, handler: (...args: any[]) => void) => {
  useEffect(() => {
    socket?.on(eventName, handler);

    return () => {
      socket?.off(eventName, handler);
    };
  }, [eventName, handler]);
};

export const joinSessionRoom = (sessionCode: string, username: string) => {
  socket?.emit('join session', sessionCode, username);
};

export const emitDoneVoting = (sessionCode: string, username: string) => {
  socket?.emit('done voting', sessionCode, username);
};

export const startVoting = (sessionCode: string) => {
  console.log(
    `Emitting start voting for session code: ${sessionCode}\nUsing URL: ${BASE_URL}`,
  );
  socket?.emit('start voting', sessionCode);
};

export const subscribeToUserJoined = (callback: (user: User) => void) => {
  socket?.on('user joined', callback);
  return () => socket?.off('user joined', callback);
};

export const subscribeToVotingStarted = (callback: () => void) => {
  socket?.on('voting started', () => {
    console.log('Voting started event received');
    callback();
  });
  return () => socket?.off('voting started', callback);
};

// socketService.ts
export const subscribeToVotingComplete = (callback: () => void) => {
  socket?.on('voting complete', callback);
  return () => socket?.off('voting complete', callback);
};

export const subscribeToUserDisconnect = (
  callback: (username: string) => void,
) => {
  socket?.on('user disconnected', callback);
  return () => socket?.off('user disconnected', callback);
};

export default useSocket;

// // chickentender/src/services/socketService.ts
// import {useEffect} from 'react';
// import io, {Socket} from 'socket.io-client';
// import {User} from '../types/UserType';
// import {EventName} from '../types/EventNameType';

// let socket: Socket | null = null;

// const SOCKET_URL = 'http://localhost:3000'; // Update as needed

// export const initializeSocket = () => {
//   disconnectSocket(); // Disconnect existing socket if any
//   socket = io(SOCKET_URL);
// };

// export const disconnectSocket = () => {
//   if (socket) {
//     socket.disconnect();
//     socket = null;
//   }
// };

// const useSocket = (eventName: EventName, handler: (...args: any[]) => void) => {
//   useEffect(() => {
//     socket?.on(eventName, handler);

//     return () => {
//       socket?.off(eventName, handler);
//     };
//   }, [eventName, handler]);
// };

// export const joinSessionRoom = (sessionCode: string, username: string) => {
//   socket?.emit('join session', sessionCode, username);
// };

// export const emitDoneVoting = (sessionCode: string, username: string) => {
//   socket?.emit('done voting', sessionCode, username);
// };

// export const startVoting = (sessionCode: string) => {
//   console.log(`Emitting start voting for session code: ${sessionCode}`);
//   socket?.emit('start voting', sessionCode);
// };

// export const subscribeToUserJoined = (callback: (user: User) => void) => {
//   socket?.on('user joined', callback);
//   return () => socket?.off('user joined', callback);
// };

// export const subscribeToVotingStarted = (callback: () => void) => {
//   socket?.on('voting started', () => {
//     console.log('Voting started event received');
//     callback();
//   });
//   return () => socket?.off('voting started', callback);
// };

// // socketService.ts
// export const subscribeToVotingComplete = (callback: () => void) => {
//   socket?.on('voting complete', callback);
//   return () => socket?.off('voting complete', callback);
// };

// export default useSocket;
