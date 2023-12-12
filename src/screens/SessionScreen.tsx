/* eslint-disable react-native/no-inline-styles */
// SessionScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import {Button} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {useSession} from '../contexts/SessionContext';
import * as Location from 'expo-location'; // Ensure to install expo-location
import {createSession, joinSession} from '../services/apiService';
import {SessionScreenNavigationProp} from '../types/NavigationStackTypes';
import {useUser} from '../contexts/UserContext';
import {useUsersArray} from '../contexts/UsersArrayContext';
import {initializeSocket} from '../services/socketService';
import {useFocusEffect} from '@react-navigation/native';
import * as Font from 'expo-font';
import Background from '../reusables/Background';
import Slider from '@react-native-community/slider';
import {CodeField, Cursor} from 'react-native-confirmation-code-field';

const debug = false;

interface SessionScreenProps {
  navigation: SessionScreenNavigationProp;
}
type PriceLevelSelectorProps = {
  maxPriceLevel: number;
  setMaxPriceLevel: (value: number) => void;
};

const PriceLevelSelector: React.FC<PriceLevelSelectorProps> = ({
  maxPriceLevel,
  setMaxPriceLevel,
}) => {
  return (
    <View style={styles.priceLevelContainer}>
      {[1, 2, 3, 4].map(level => (
        <TouchableOpacity
          key={level}
          onPress={() => setMaxPriceLevel(level)}
          style={[
            styles.priceLevel,
            {
              backgroundColor:
                level <= maxPriceLevel
                  ? '#4caf50' // Active color
                  : '#e0e0e0', // Inactive color
            },
          ]}>
          <Text style={styles.priceLevelText}>$</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const SessionScreen: React.FC<SessionScreenProps> = ({navigation}) => {
  const {setUsername, username} = useUser();
  const {addUser} = useUsersArray();
  const {setSession} = useSession();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [view, setView] = useState<
    'default' | 'join' | 'create' | 'manual' | 'location'
  >('default');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [maxPriceLevel, setMaxPriceLevel] = useState<number>(1);
  const [radius, setRadius] = useState<number>(5);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          rubik: require('../assets/fonts/Rubik-Regular.ttf'),
          rubikBold: require('../assets/fonts/Rubik-Bold.ttf'),
          rubikItalic: require('../assets/fonts/Rubik-Italic.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts', error);
      }
    };

    loadFonts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setView('default');
    }, []),
  );

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const handleJoinSession = async () => {
    if (debug) {
      console.log('Trying to join session.');
    }
    if (sessionCodeInput.trim().length > 0 && username.trim().length > 0) {
      try {
        const session = await joinSession(sessionCodeInput, username);
        setSession(session);
        // initializeSocket();
        navigation.navigate('Lobby');
      } catch (error) {
        Alert.alert('Error', 'Failed to join session. Please try again.');
      }
    } else {
      Alert.alert(
        'Invalid Input',
        'Please enter a session code and a username.',
      );
    }
  };

  const handleCreateSession = async (latitude?: number, longitude?: number) => {
    if (debug) {
      console.log('Trying to create session.');
    }
    if (username.trim().length === 0) {
      Alert.alert('Invalid Input', 'Please enter a username.');
      return;
    }
    try {
      const radiusInMeters = radius * 1609.34;
      const session = await createSession({
        username: username,
        param1: latitude ?? city,
        param2: longitude ?? state,
        radiusInMeters,
        maxPriceLevel: maxPriceLevel,
      });
      setSession(session);
      initializeSocket();
      navigation.navigate('Lobby');
    } catch (error) {
      console.log(`Could not create session: ${error}`);
      Alert.alert(`Error', 'Failed to create session. ${error}`);
      setView('create'); // Reset the view back to 'create' after an error
    }
  };

  const requestAndUseLocation = async () => {
    let {status} = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Need permission to access location');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    handleCreateSession(location.coords.latitude, location.coords.longitude);
    console.log(`${location.coords.latitude}, ${location.coords.longitude}`);
  };

  const handleOnChangeText = (input: any) => {
    setUsername(input);
    addUser({username: input}); // Add the user to the users array in UsersArrayContext
  };

  return (
    <Background>
      <View style={styles.container}>
        {view === 'default' && (
          <>
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/images/chickentender.png')}
                style={styles.imagelogo}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>TNDR</Text>
            </View>
            <Button
              title="JOIN A VOTE"
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.titleStyle}
              onPress={() => setView('join')}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ['#4e7d66', '#a6b599'],
                start: {x: 1, y: 0},
                end: {x: 0, y: 0},
              }}
            />
            <Button
              title="START A VOTE"
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.titleStyle}
              onPress={() => setView('create')}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ['#9d0303', '#e7941e'],
                start: {x: 0, y: 0},
                end: {x: 1, y: 0},
              }}
            />
          </>
        )}

        {view === 'join' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={username}
              onChangeText={handleOnChangeText}
              autoCapitalize="none"
            />
            <CodeField
              value={sessionCodeInput}
              onChangeText={setSessionCodeInput}
              cellCount={6}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({index, symbol, isFocused}) => (
                <Text
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell]}>
                  {symbol || (isFocused ? <Cursor /> : null)}
                </Text>
              )}
            />
            <Button
              title="JOIN VOTE"
              onPress={handleJoinSession}
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.titleStyle}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ['#4e7d66', '#a6b599'],
                start: {x: 1, y: 0},
                end: {x: 0, y: 0},
              }}
            />
            <Button
              title="GO BACK"
              onPress={() => setView('default')}
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.titleStyle}
            />
          </>
        )}

        {view === 'create' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={username}
              onChangeText={handleOnChangeText}
              autoCapitalize="none"
            />
            <Text style={styles.priceLevelHeading}>Select Price Level:</Text>
            <PriceLevelSelector
              maxPriceLevel={maxPriceLevel}
              setMaxPriceLevel={setMaxPriceLevel}
            />
            <Slider
              style={styles.radiusLabel}
              minimumValue={1}
              maximumValue={25}
              step={1}
              value={radius}
              onValueChange={value => setRadius(value)}
              minimumTrackTintColor="#4caf50"
              maximumTrackTintColor="#000000"
            />
            <Text style={styles.radiusLabel}>
              Radius: {radius.toFixed(0)} miles
            </Text>

            <Button
              title="Use Current Location"
              onPress={requestAndUseLocation}
              buttonStyle={styles.useLocationButton}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.titleStyle}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ['#835501', '#3b0101'],
                start: {x: 1, y: 0},
                end: {x: 0, y: 0},
              }}
            />
            <Button
              title="GO BACK"
              onPress={() => setView('default')}
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.titleStyle}
            />
          </>
        )}
        {view === 'manual' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={username}
              onChangeText={handleOnChangeText}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter City"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter State (e.g. GA)"
              value={state}
              onChangeText={setState}
              autoCapitalize="characters"
            />
            <Button
              title="START VOTE"
              onPress={() => handleCreateSession()}
              buttonStyle={styles.createSessionButton}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.titleStyle}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ['#5dbea3', '#075640'],
                start: {x: 1, y: 0},
                end: {x: 0, y: 0},
              }}
            />
            <Button
              title="GO BACK"
              onPress={() => setView('create')}
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              titleStyle={styles.titleStyle}
            />
          </>
        )}
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 0.5,
    padding: 20,
    width: '60%',
    height: '60%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5.65,

    elevation: 8, // for Android
    marginBottom: 20,
  },
  imagelogo: {
    width: '90%',
    height: '90%',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'rubik',
    fontSize: 35,
    color: '#000000',
    textShadowColor: '#555555',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 1,
    padding: 5,
  },
  titleStyle: {
    fontFamily: 'rubikBold',
    fontSize: 24,
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1,
    padding: 5,
  },
  input: {
    width: '90%',
    padding: 15,
    fontSize: 18,
    fontFamily: 'rubik',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: 'black',
    borderWidth: 0,
    borderColor: 'black',
    borderRadius: 13,
    fontFamily: 'rubik',
    fontSize: 30,
  },
  enterLocationButton: {
    backgroundColor: '#dd7973',
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 13,
  },
  useLocationButton: {
    backgroundColor: '#80669d',
    borderWidth: 0,
    borderColor: 'white',
    borderRadius: 13,
  },
  createSessionButton: {
    backgroundColor: '#5dbea3',
    borderRadius: 13,
  },
  joinSessionButton: {
    fontFamily: 'rubikBold',
    fontSize: 24,
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 1,
    padding: 5,
  },
  buttonContainer: {
    width: 300,
    marginHorizontal: 50,
    marginVertical: 10,
  },
  priceLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  priceLevel: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  priceLevelText: {
    fontSize: 20,
    color: 'white',
  },
  priceLevelHeading: {
    fontFamily: 'rubikItalic',
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 5,
  },
  radiusLabel: {
    fontFamily: 'rubik',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 5,
    width: '80%',
    height: 30,
  },
  codeFieldRoot: {
    marginTop: 20,
    width: 280,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  cell: {
    backgroundColor: 'white',
    textAlignVertical: 'bottom',
    width: 35,
    height: 50,
    fontSize: 36,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 7,
    borderColor: 'black',
    marginBottom: 20,
  },
  focusCell: {
    borderColor: '#0000ff',
    textAlignVertical: 'bottom',
    verticalAlign: 'bottom',
  },
});

export default SessionScreen;
