// src/types/NavigationStackTypes.ts
import {StackNavigationProp} from '@react-navigation/stack';

// Define the parameters for all the screens in the stack
export type RootStackParamList = {
  Login: undefined; // No parameters expected to be passed to this route
  Session: undefined;
  Lobby: undefined;
  // Add other screen parameters as needed, e.g.:
  // Profile: { userId: string };
};

// Define navigation prop types for each screen
export type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

export type SessionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Session'
>;

export type LobbyScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Lobby'
>;

// ...and so on for other screens
