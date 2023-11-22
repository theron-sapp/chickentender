// src/types/NavigationStackTypes.ts
import {StackNavigationProp} from '@react-navigation/stack';

// Define the parameters for all the screens in the stack
export type RootStackParamList = {
  Login: undefined; // No parameters expected to be passed to this route
  Session: undefined;
  Lobby: undefined;
  Voting: undefined;
  Results: undefined;
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

export type VotingScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Voting'
>;

export type ResultsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Results'
>;

// ...and so on for other screens
