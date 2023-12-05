/* eslint-disable react/no-unstable-nested-components */
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
import HeaderComponent from './src/reusables/HeaderComponent'; // Import your custom header
import React from 'react';
import {UsersArrayProvider} from './src/contexts/UsersArrayContext';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <UserProvider>
      <UsersArrayProvider>
        <SessionProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: true,
              }}>
              {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
              <Stack.Screen
                name="Session"
                component={SessionScreen}
                options={{
                  header: () => <HeaderComponent title="Chicken Tender" />,
                }}
              />
              <Stack.Screen
                name="Lobby"
                component={LobbyScreen}
                options={{
                  header: () => <HeaderComponent title="Chicken Tender" />,
                }}
              />
              <Stack.Screen
                name="Voting"
                component={VotingScreen}
                options={{
                  header: () => <HeaderComponent title="Vote!" />,
                }}
              />
              <Stack.Screen
                name="Results"
                component={ResultsScreen}
                options={{
                  header: () => <HeaderComponent title="Chicken Tender" />,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SessionProvider>
      </UsersArrayProvider>
    </UserProvider>
  );
};

export default App;
