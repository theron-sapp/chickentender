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
import React, {useEffect, useState} from 'react';
import * as Font from 'expo-font';
import {UsersArrayProvider} from './src/contexts/UsersArrayContext';
import {ActivityIndicator} from 'react-native';

const Stack = createNativeStackNavigator();

const loadFonts = async () => {
  await Font.loadAsync({
    neonsans: require('./src/assets/fonts/NeonSans.ttf'),
    beon: require('./src/assets/fonts/Beon-Regular.ttf'),
    neon: require('./src/assets/fonts/HTNeonW01Regular.ttf'),
    brush: require('./src/assets/fonts/Brush-Script.ttf'),
    hometown: require('./src/assets/fonts/Hometown-Free-Script.ttf'),
    city: require('./src/assets/fonts/NEONCITY.ttf'),
    bines: require('./src/assets/fonts/NeonBines.ttf'),
    // place holder for more fonts
  });
};

const App: React.FC = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts()
      .then(() => setFontsLoaded(true))
      .catch(error => console.error('Error loading fonts', error));
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

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
                options={{headerShown: false}}
                // options={{
                //   title: 'Chicken Tender',
                //   headerLeft: () => <View />,
                // }}
              />
              <Stack.Screen
                name="Lobby"
                component={LobbyScreen}
                options={{headerShown: false}}

                // options={{
                //   title: 'Chicken Tender',
                //   headerLeft: () => <View />,
                // }}
              />
              <Stack.Screen
                name="Voting"
                component={VotingScreen}
                options={{headerShown: false}}
                // options={{
                //   title: 'Vote!',
                //   headerLeft: () => <View />,
                // }}
              />
              <Stack.Screen
                name="Results"
                component={ResultsScreen}
                options={{headerShown: false}}
                // options={{
                //   title: 'Chicken Tender',
                //   headerLeft: () => <View />,
                // }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SessionProvider>
      </UsersArrayProvider>
    </UserProvider>
  );
};

export default App;
