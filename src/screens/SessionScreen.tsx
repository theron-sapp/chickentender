/* eslint-disable react-native/no-inline-styles */
// SessionScreen.tsx
import React, {useState} from 'react';
import {View, TextInput, StyleSheet, Alert} from 'react-native';
import {Button} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {useSession} from '../contexts/SessionContext';
import * as Location from 'expo-location'; // Ensure to install expo-location
import {createSession, joinSession} from '../services/apiService';
import {SessionScreenNavigationProp} from '../types/NavigationStackTypes';
import {useUser} from '../contexts/UserContext';
import {useUsersArray} from '../contexts/UsersArrayContext';

const debug = true;

interface SessionScreenProps {
  navigation: SessionScreenNavigationProp;
}

const SessionScreen: React.FC<SessionScreenProps> = ({navigation}) => {
  const {setUsername, username} = useUser();
  const {addUser} = useUsersArray();
  const {setSession} = useSession();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  // const [creatingSession, setCreatingSession] = useState(false);
  // const [joiningSession, setJoiningSession] = useState(false);
  const [view, setView] = useState<
    'default' | 'join' | 'create' | 'manual' | 'location'
  >('default');

  const handleJoinSession = async () => {
    if (debug) {
      console.log('Trying to join session.');
    }
    if (sessionCodeInput.trim().length > 0 && username.trim().length > 0) {
      try {
        const session = await joinSession(sessionCodeInput, username);
        setSession(session);
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
      const radiusInMeters = 3000; // Set your default search radius
      const session = await createSession({
        username: username,
        param1: latitude ?? city,
        param2: longitude ?? state,
        radiusInMeters,
      });
      setSession(session);
      navigation.navigate('Lobby');
    } catch (error) {
      console.log(`Could not create session: ${error}`);
      Alert.alert('Error', 'Failed to create session. Please try again.');
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
  };

  const handleOnChangeText = (input: any) => {
    setUsername(input);
    addUser({username: input}); // Add the user to the users array in UsersArrayContext
  };

  return (
    <View style={styles.container}>
      {view === 'default' && (
        <>
          <Button
            title="JOIN A SESSION"
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={{fontWeight: 'bold'}}
            onPress={() => setView('join')}
            ViewComponent={LinearGradient} // Use LinearGradient instead of View for component
            linearGradientProps={{
              colors: ['#4e7d66', '#a6b599'], // Example gradient colors
              start: {x: 1, y: 0},
              end: {x: 0, y: 0},
            }}
          />
          <Button
            title="CREATE A SESSION"
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={{fontWeight: 'bold'}}
            onPress={() => setView('create')}
            ViewComponent={LinearGradient} // Use LinearGradient instead of View for component
            linearGradientProps={{
              colors: ['#9d0303', '#e7941e'], // Example gradient colors
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
            placeholder="What're you called"
            value={username}
            onChangeText={handleOnChangeText}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter session code"
            value={sessionCodeInput}
            onChangeText={setSessionCodeInput}
            autoCapitalize="none"
          />
          <Button
            title="Join Session"
            onPress={handleJoinSession}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={{fontWeight: 'bold'}}
          />
          <Button
            title="Go Back"
            onPress={() => setView('default')}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={{fontWeight: 'bold'}}
          />
        </>
      )}

      {view === 'create' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="What're you called"
            value={username}
            onChangeText={handleOnChangeText}
            autoCapitalize="none"
          />
          <Button
            title="Use Current Location"
            onPress={requestAndUseLocation}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={{fontWeight: 'bold'}}
          />
          <Button
            title="Enter Location"
            onPress={() => setView('manual')}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={{fontWeight: 'bold'}}
          />
          <Button
            title="Go Back"
            onPress={() => setView('default')}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={{fontWeight: 'bold'}}
          />
        </>
      )}
      {view === 'manual' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="What're you called"
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
            placeholder="Enter State"
            value={state}
            onChangeText={setState}
            autoCapitalize="characters"
          />
          <Button
            title="Create Session"
            onPress={() => handleCreateSession()}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={{fontWeight: 'bold'}}
          />
          <Button
            title="Go Back"
            onPress={() => setView('create')}
            buttonStyle={styles.button}
            containerStyle={styles.buttonContainer}
            titleStyle={{fontWeight: 'bold'}}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  button: {
    backgroundColor: 'black',
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 30,
  },
  buttonContainer: {
    width: 300,
    marginHorizontal: 50,
    marginVertical: 10,
  },
});

export default SessionScreen;
