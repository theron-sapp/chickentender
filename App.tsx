// App.tsx or Navigation.tsx
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import LoginScreen from './src/screens/LoginScreen';
import SessionScreen from './src/screens/SessionScreen';
import LobbyScreen from './src/screens/LobbyScreen';
import VotingScreen from './src/screens/VotingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import {UserProvider} from './src/contexts/UserContext';
import {SessionProvider} from './src/contexts/SessionContext';

import React from 'react';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <UserProvider>
      <SessionProvider>
        <NavigationContainer>
          <Stack.Navigator>
            {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
            <Stack.Screen name="Session" component={SessionScreen} />
            <Stack.Screen name="Lobby" component={LobbyScreen} />
            <Stack.Screen name="Voting" component={VotingScreen} />
            <Stack.Screen name="Results" component={ResultsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SessionProvider>
    </UserProvider>
  );
};

export default App;
