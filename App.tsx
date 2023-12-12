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
// import HeaderComponent from './src/reusables/HeaderComponent';
import React from 'react';
import {UsersArrayProvider} from './src/contexts/UsersArrayContext';
import {View} from 'react-native';

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
                  title: 'Chicken Tender',
                  headerLeft: () => <View />,
                }}
              />
              <Stack.Screen
                name="Lobby"
                component={LobbyScreen}
                options={{
                  title: 'Chicken Tender',
                  headerLeft: () => <View />,
                }}
              />
              <Stack.Screen
                name="Voting"
                component={VotingScreen}
                options={{
                  title: 'Vote!',
                  headerLeft: () => <View />,
                }}
              />
              <Stack.Screen
                name="Results"
                component={ResultsScreen}
                options={{
                  title: 'Chicken Tender',
                  headerLeft: () => <View />,
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
