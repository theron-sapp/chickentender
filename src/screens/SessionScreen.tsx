/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
// SessionScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  // Animated,
} from 'react-native';
import {useSession} from '../contexts/SessionContext';
import * as Location from 'expo-location'; // Ensure to install expo-location
import {createSession, joinSession} from '../services/apiService';
import {SessionScreenNavigationProp} from '../types/NavigationStackTypes';
import {useUser} from '../contexts/UserContext';
import {useUsersArray} from '../contexts/UsersArrayContext';
import {initializeSocket} from '../services/socketService';
import {useFocusEffect} from '@react-navigation/native';
import Background from '../reusables/Background';
import Slider from '@react-native-community/slider';
import NeonButton from '../reusables/NeonButton';
import NeonSign from '../reusables/NeonSign';

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
  // Emoji mapping for each price level
  const priceLevelEmojis: {[key: string]: string} = {
    '1': '💵',
    '2': '💸',
    '3': '💰',
    '4': '💯',
  };

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
          <Text style={styles.priceLevelText}>
            {priceLevelEmojis[level.toString()]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const neonSignContainerStyle = {
  marginBottom: 1,
};

const SessionScreen: React.FC<SessionScreenProps> = ({navigation}) => {
  const {setUsername, username} = useUser();
  const {addUser} = useUsersArray();
  const {setSession} = useSession();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [view, setView] = useState<
    'default' | 'join' | 'create' | 'options' | 'location'
  >('default');
  const [maxPriceLevel, setMaxPriceLevel] = useState<number>(1);
  const [radius, setRadius] = useState<number>(5);

  useFocusEffect(
    React.useCallback(() => {
      setView('default');
      setSessionCodeInput('');
    }, []),
  );

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
      // initializeSocket();
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
    addUser({
      username: input,
    }); // Add the user to the users array in UsersArrayContext
  };

  return (
    <Background>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={50} // You can adjust this value as needed
      >
        <View style={styles.container}>
          <View style={styles.container}>
            <NeonSign
              text="Feast"
              containerStyle={neonSignContainerStyle}
              textStyle={{
                color: '#ffffff',
                fontSize: 76,
                textAlign: 'center',
                shadowColor: '#36fff4',
                textShadowColor: '#36fff4',
                textShadowOffset: {width: 0, height: 0},
                textShadowRadius: 2,
                padding: 1,
                shadowOpacity: 1,
                shadowRadius: 30,
                fontFamily: 'beon',
                fontWeight: 'bold',
                margin: -10,
                marginTop: 10,
              }}
            />
            <NeonSign
              text="Finder"
              containerStyle={neonSignContainerStyle}
              textStyle={{
                color: '#ffffff',
                fontSize: 68,
                shadowRadius: 30,
                shadowColor: '#8ef372',
                shadowOpacity: 1,
                textAlign: 'center',
                textShadowColor: '#8ef372',
                textShadowOffset: {width: 0, height: 0},
                textShadowRadius: 2,
                padding: 1,
                fontFamily: 'beon',
                fontWeight: 'bold',
              }}
            />
          </View>
          {view === 'default' && (
            <>
              {/* <View style={styles.imageContainer}>
              <Image
                source={require('../assets/images/Diner-Icon-NoBackground.png')}
                style={styles.imagelogo}
                resizeMode="contain"
              />
            </View> */}
              <NeonButton
                title="JOIN A SESSION"
                onPress={() => setView('join')}
                buttonStyle={{
                  margin: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(52, 52, 52, 0.0)',
                  padding: 1,
                  width: '80%',
                  borderWidth: 1,
                  borderRadius: 13,
                  borderColor: 'white',
                  shadowColor: '#0307fc',
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6, // Elevation for Android
                }}
                textStyle={{
                  color: '#ffffff',
                  fontSize: 26,
                  textAlign: 'center',
                  textShadowColor: '#0307fc',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: 10,
                  fontFamily: 'beon',
                  fontWeight: 'bold',
                }}
              />

              <NeonButton
                title="START A SESSION"
                onPress={() => setView('create')}
                buttonStyle={{
                  margin: 10,
                  marginBottom: 50,
                  // marginBottom: '7%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(52, 52, 52, 0.0)',
                  padding: 1,
                  width: '80%',
                  borderWidth: 1,
                  borderRadius: 13,
                  borderColor: 'white',
                  shadowColor: '#3adb00',
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                textStyle={{
                  color: '#ffffff',
                  fontSize: 26,
                  textAlign: 'center',
                  textShadowColor: '#3adb00',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: 10,
                  fontFamily: 'beon',
                  fontWeight: 'bold',
                }}
              />
            </>
          )}
          {view === 'join' && (
            <>
              <TextInput
                style={{...styles.input, marginTop: 20}}
                placeholder="Name"
                value={username}
                onChangeText={handleOnChangeText}
                autoCapitalize="none"
                keyboardType="default"
                returnKeyType="done"
              />
              <TextInput
                style={styles.input}
                placeholder="Session Code"
                value={sessionCodeInput}
                onChangeText={setSessionCodeInput}
                autoCapitalize="none"
                keyboardType="number-pad"
                returnKeyType="done"
              />
              <NeonButton
                title="JOIN SESSION"
                onPress={handleJoinSession}
                buttonStyle={{
                  margin: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(52, 52, 52, 0.0)',
                  padding: 1,
                  width: '80%',
                  borderWidth: 1,
                  borderRadius: 13,
                  borderColor: 'white',
                  shadowColor: '#0307fc',
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                textStyle={{
                  color: '#ffffff',
                  fontSize: 26,
                  textAlign: 'center',
                  textShadowColor: '#0307fc',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: 10,
                  fontFamily: 'beon',
                  fontWeight: 'bold',
                }}
              />
              <NeonButton
                title="GO BACK"
                onPress={() => setView('default')}
                buttonStyle={{
                  margin: 10,
                  marginBottom: 50,
                  // marginBottom: '7%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(52, 52, 52, 0.0)',
                  padding: 1,
                  width: '80%',
                  borderWidth: 1,
                  borderRadius: 13,
                  borderColor: 'white',
                  shadowColor: 'black',
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                textStyle={{
                  color: '#ffffff',
                  fontSize: 26,
                  textAlign: 'center',
                  textShadowColor: 'black',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: 10,
                  fontFamily: 'beon',
                  fontWeight: 'bold',
                }}
              />
            </>
          )}
          {view === 'create' && (
            <>
              <TextInput
                style={{...styles.input, marginTop: 20}}
                placeholder="Name"
                value={username}
                onChangeText={handleOnChangeText}
                autoCapitalize="none"
                keyboardType="default"
                returnKeyType="done"
              />
              <NeonButton
                title="CONTINUE"
                onPress={() => {
                  if (username.trim().length > 0) {
                    setView('options');
                  } else {
                    Alert.alert(
                      'Username Required',
                      'Please enter a username to proceed.',
                    );
                  }
                }}
                buttonStyle={{
                  margin: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(52, 52, 52, 0.0)',
                  padding: 1,
                  width: '80%',
                  borderWidth: 1,
                  borderRadius: 13,
                  borderColor: 'white',
                  shadowColor: '#3adb00',
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                textStyle={{
                  color: '#ffffff',
                  fontSize: 26,
                  textAlign: 'center',
                  textShadowColor: '#3adb00',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: 10,
                  fontFamily: 'beon',
                  fontWeight: 'bold',
                }}
              />
              <NeonButton
                title="GO BACK"
                onPress={() => setView('default')}
                buttonStyle={{
                  margin: 10,
                  marginBottom: 50,
                  // marginBottom: '7%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(52, 52, 52, 0.0)',
                  padding: 1,
                  width: '80%',
                  borderWidth: 1,
                  borderRadius: 13,
                  borderColor: 'white',
                  shadowColor: 'black',
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                textStyle={{
                  color: '#ffffff',
                  fontSize: 26,
                  textAlign: 'center',
                  textShadowColor: 'black',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: 10,
                  fontFamily: 'beon',
                  fontWeight: 'bold',
                }}
              />
            </>
          )}
          {view === 'options' && (
            <>
              <Text style={styles.priceLevelHeading}>Select Price Level:</Text>
              <PriceLevelSelector
                maxPriceLevel={maxPriceLevel}
                setMaxPriceLevel={setMaxPriceLevel}
              />
              <Text style={styles.priceLevelSubheader}>
                From least to most expensive
              </Text>
              <Slider
                style={{
                  ...styles.radiusLabel,
                  shadowColor: '#3adb00',
                  shadowRadius: 10,
                  shadowOpacity: 1,
                }}
                minimumValue={1}
                maximumValue={25}
                step={1}
                value={radius}
                onValueChange={value => setRadius(value)}
                minimumTrackTintColor="white"
                maximumTrackTintColor="#000000"
              />
              <Text style={styles.radiusLabel}>
                Search Radius: {radius.toFixed(0)} miles
              </Text>

              {/* <Button
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
              /> */}
              <NeonButton
                title="START SESSION"
                onPress={requestAndUseLocation}
                buttonStyle={{
                  margin: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(52, 52, 52, 0.0)',
                  padding: 1,
                  width: '80%',
                  borderWidth: 1,
                  borderRadius: 13,
                  borderColor: 'white',
                  shadowColor: '#3adb00',
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                textStyle={{
                  color: '#ffffff',
                  fontSize: 26,
                  textAlign: 'center',
                  textShadowColor: '#3adb00',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: 10,
                  fontFamily: 'beon',
                  fontWeight: 'bold',
                }}
              />
              <NeonButton
                title="GO BACK"
                onPress={() => setView('default')}
                buttonStyle={{
                  margin: 10,
                  marginBottom: 50,
                  // marginBottom: '7%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(52, 52, 52, 0.0)',
                  padding: 1,
                  width: '80%',
                  borderWidth: 1,
                  borderRadius: 13,
                  borderColor: 'white',
                  shadowColor: 'black',
                  shadowOffset: {width: 0, height: 0},
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }}
                textStyle={{
                  color: '#ffffff',
                  fontSize: 26,
                  textAlign: 'center',
                  textShadowColor: 'black',
                  textShadowOffset: {width: 0, height: 0},
                  textShadowRadius: 10,
                  fontFamily: 'beon',
                  fontWeight: 'bold',
                }}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
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
    padding: 0,
    width: '90%',
    height: '90%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: '#000125',
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
    width: '100%',
    height: '100%',
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
    textAlign: 'center',
    width: '80%',
    padding: 10,
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'beon',
    color: 'white',
    textShadowColor: 'black',
    textShadowRadius: 1,
    textDecorationColor: '#0307fc',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(125, 124, 124, 1)',
    borderRadius: 5,
    backgroundColor: 'rgba(125, 124, 124, 0.88)', // Semi-transparent white
    // Adding a subtle shadow for depth
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 1,
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
    padding: 6,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  priceLevelText: {
    fontSize: 14,
    color: 'white',
  },
  priceLevelHeading: {
    fontFamily: 'beon',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginVertical: 5,
  },
  priceLevelSubheader: {
    fontFamily: 'beon',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginVertical: 5,
  },
  radiusLabel: {
    fontFamily: 'beon',
    fontSize: 18,
    color: 'white',
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
