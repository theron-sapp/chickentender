// SessionScreen.tsx
import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {useSession} from '../contexts/SessionContext';
import * as Location from 'expo-location'; // Ensure to install expo-location
import {createSession, joinSession} from '../services/apiService';
import {SessionScreenNavigationProp} from '../types/NavigationStackTypes';

interface SessionScreenProps {
  navigation: SessionScreenNavigationProp;
}

const SessionScreen: React.FC<SessionScreenProps> = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const {setSession} = useSession();
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);
  const [joiningSession, setJoiningSession] = useState(false);
  const [view, setView] = useState<
    'default' | 'join' | 'create' | 'manual' | 'location'
  >('default');

  const handleJoinSession = async () => {
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
    if (username.trim().length === 0) {
      Alert.alert('Invalid Input', 'Please enter a username.');
      return;
    }
    try {
      const radiusInMeters = 3000; // Set your default search radius
      const session = await createSession({
        username,
        param1: latitude ?? city,
        param2: longitude ?? state,
        radiusInMeters,
      });
      setSession(session);
      navigation.navigate('Lobby');
    } catch (error) {
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

  return (
    <View style={styles.container}>
      {view === 'default' && (
        <>
          <Button title="Join a Session" onPress={() => setView('join')} />
          <Button title="Create a Session" onPress={() => setView('create')} />
        </>
      )}

      {view === 'join' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter session code"
            value={sessionCodeInput}
            onChangeText={setSessionCodeInput}
            autoCapitalize="none"
          />
          <Button title="Join Session" onPress={handleJoinSession} />
          <Button title="Go Back" onPress={() => setView('default')} />
        </>
      )}

      {view === 'create' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Button
            title="Use Current Location"
            onPress={requestAndUseLocation}
          />
          <Button
            title="Enter Location Manually"
            onPress={() => setView('manual')}
          />
          <Button title="Go Back" onPress={() => setView('default')} />
        </>
      )}
      {view === 'manual' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
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
          />
          <Button title="Go Back" onPress={() => setView('create')} />
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
});

export default SessionScreen;
