/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-catch-shadow */
// LobbyScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Button} from 'react-native-elements';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext';
import {LobbyScreenNavigationProp} from '../types/NavigationStackTypes';
import Clipboard from '@react-native-community/clipboard';
import Background from '../reusables/Background';
import * as Font from 'expo-font';
import {getSession, startVoting} from '../services/apiService';

interface LobbyScreenProps {
  navigation: LobbyScreenNavigationProp;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({navigation}) => {
  const {session, setSession, setResults} = useSession();
  const [users, setUsers] = useState<{username: string}[]>([]);
  const {username, setUsername} = useUser();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Font loading logic
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

    const fetchSessionDetails = async () => {
      if (session?.code && session?.votingComplete) {
        try {
          const updatedSession = await getSession(session.code);
          setUsers(updatedSession.users);

          // Check if voting has started and navigate to VotingScreen if true
          if (updatedSession.votingStarted) {
            navigation.navigate('Voting');
          }
          setError(null);
        } catch (error) {
          console.error('Error fetching session details:', error);
          console.log(`Session Voting status: ${session?.votingComplete}`);
          setError(
            'Failed to fetch session details. Please check your connection.',
          );
        }
      }
    };

    if (session?.users && session?.sessionCreator) {
      setUsers(session.users);
      const intervalId = setInterval(fetchSessionDetails, 3000);

      return () => clearInterval(intervalId);
    }
  }, [navigation, session]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const copyToClipboard = () => {
    if (session?.code) {
      Clipboard.setString(session.code);
      Alert.alert('Copied', 'Session code copied to clipboard!');
    }
  };

  const handleBackToSession = () => {
    setUsername('');
    setSession(null);
    setResults(null);
    navigation.navigate('Session');
  };

  const handleStartVoting = async () => {
    if (session?.sessionCreator === username) {
      try {
        // Update the session to indicate that voting has started
        await startVoting(session.code);
        navigation.navigate('Voting');
      } catch (error) {
        console.error('Error starting voting:', error);
        Alert.alert('Error', 'Failed to start voting. Please try again.');
      }
    }
  };

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.title}>Lobby</Text>
        <FlatList
          data={users}
          keyExtractor={item => item.username}
          renderItem={({item}) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>
                {item.username.toUpperCase()}
              </Text>
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.text}>Session Code: {session?.code}</Text>
              <TouchableOpacity
                onPress={copyToClipboard}
                style={styles.clipboardIcon}>
                {/* You can use an icon here */}
                <Text style={styles.clipboardText}>Copy</Text>
              </TouchableOpacity>
            </View>
          }
          style={styles.flatList}
        />
        {session?.sessionCreator === username && (
          <Button
            title="START VOTING"
            onPress={handleStartVoting}
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.startButton}
            titleStyle={styles.titleStyle}
          />
        )}
        <Button
          title="LEAVE"
          onPress={handleBackToSession}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.leaveButton}
          titleStyle={styles.titleStyle}
        />
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    fontFamily: 'rubikBold',
    fontSize: 24,
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1,
    padding: 5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  flatList: {
    width: '100%',
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
  },
  listItemText: {
    fontSize: 20,
    fontFamily: 'rubik',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  clipboardIcon: {
    padding: 5,
    backgroundColor: '#e7e7e7',
    borderRadius: 5,
  },
  clipboardText: {
    fontFamily: 'rubikItalic',
  },
  text: {
    fontFamily: 'rubik',
    fontSize: 18,
  },
  button: {
    backgroundColor: 'black',
    borderWidth: 0,
    borderColor: 'white',
    borderRadius: 30,
  },
  startButton: {
    backgroundColor: '#5dbea3',
    borderWidth: 0,
    borderColor: 'white',
    borderRadius: 13,
  },
  leaveButton: {
    backgroundColor: 'red',
    borderWidth: 0,
    borderColor: 'white',
    borderRadius: 13,
  },
  buttonContainer: {
    width: 300,
    marginHorizontal: 50,
    marginVertical: 10,
  },
});

export default LobbyScreen;
