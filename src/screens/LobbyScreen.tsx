/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
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
  Share,
} from 'react-native';
// import {Button} from 'react-native-elements';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext';
import {LobbyScreenNavigationProp} from '../types/NavigationStackTypes';
import Background from '../reusables/Background';
import {
  deleteSession,
  getSession,
  leaveSession,
  startVoting,
} from '../services/apiService';
import NeonSign from '../reusables/NeonSign';
import NeonButton from '../reusables/NeonButton';

const shadowColors = [
  '#c20404',
  '#f08c0a',
  '#e8e409',
  '#36e809',
  '#09e8d9',
  '#253df5',
  '#f125f5',
  '#f5256e',
];

// Function to get a random color
const getRandomColor = () => {
  return shadowColors[Math.floor(Math.random() * shadowColors.length)];
};

interface LobbyScreenProps {
  navigation: LobbyScreenNavigationProp;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({navigation}) => {
  const {session, setSession, setResults} = useSession();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [users, setUsers] = useState<{username: string}[]>([]);
  const {username, setUsername} = useUser();
  const [error, setError] = useState<string | null>(null);
  const [, setSessionCodeInput] = useState('');

  useEffect(() => {
    // Font loading logic

    let intervalId: string | number | NodeJS.Timeout | undefined;

    const handleSessionNotFound = () => {
      Alert.alert(
        'Session No Longer Active',
        'The session has been deleted or is no longer available.',
        [
          {
            text: 'OK',
            onPress: () => {
              setSessionCodeInput('');
              setUsername('');
              setSession(null);
              setResults(null);
              navigation.navigate('Session');
            },
          },
        ],
      );
    };

    const fetchAndUpdateSession = async () => {
      if (session?.code) {
        try {
          const updatedSession = await getSession(session.code);
          setSession(updatedSession);
          setUsers(updatedSession.users);

          if (!updatedSession.lobbyOpen) {
            clearInterval(intervalId);
            navigation.navigate('Voting');
          }
          setError(null);
        } catch (error: any) {
          console.error('Error fetching session details:', error);
          if (error.message.includes('Session not found')) {
            handleSessionNotFound(); // Handle the scenario when the session is not found
          } else {
            setError(
              'Failed to fetch session details. Please check your connection.',
            );
          }
        }
      }
    };

    intervalId = setInterval(fetchAndUpdateSession, 3000);

    return () => clearInterval(intervalId); // Clean up
  }, [session?.code, navigation, setSession]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const shareSessionCode = () => {
    if (session?.code) {
      Share.share({
        message: `Join our session with this code: ${session.code}`,
      })
        .then(result => console.log(result))
        .catch(error => console.log('Error sharing', error));
    }
  };

  const handleBackToSession = async () => {
    try {
      if (session?.sessionCreator === username) {
        // If user is the session creator, delete the session
        await deleteSession(session.code, username);
      } else if (session?.code && username) {
        // If user is not the session creator, just leave the session
        await leaveSession(session.code, username);
      }

      // Clear local state
      setSessionCodeInput('');
      setUsername('');
      setSession(null);
      setResults(null);

      // Navigate back to the session screen
      navigation.navigate('Session');
    } catch (error) {
      console.error('Error handling session:', error);
      Alert.alert('Error', 'Failed to handle the session. Please try again.');
    }
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
        <FlatList
          data={session?.users}
          keyExtractor={item => item.username}
          renderItem={({item}) => {
            const randomColor = getRandomColor(); // Get a random color for each item
            return (
              <View style={styles.listItem}>
                <NeonSign
                  text={item.username.toUpperCase()}
                  textStyle={{
                    color: '#ffffff',
                    fontSize: 18,
                    textAlign: 'center',
                    shadowColor: randomColor,
                    textShadowColor: randomColor,
                    textShadowOffset: {width: 0, height: 0},
                    textShadowRadius: 2,
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    fontFamily: 'beon',
                    fontWeight: 'bold',
                  }}
                />
              </View>
            );
          }}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.text}>Session Code: {session?.code}</Text>
              <TouchableOpacity onPress={shareSessionCode}>
                <Text style={styles.clipboardText}>
                  <NeonSign
                    text="SHARE"
                    textStyle={{
                      color: '#ffffff',
                      fontSize: 18,
                      textAlign: 'center',
                      shadowColor: '#2571f5',
                      textShadowColor: '#2571f5',
                      textShadowOffset: {width: 0, height: 0},
                      textShadowRadius: 2,
                      shadowOpacity: 1,
                      shadowRadius: 10,
                      fontFamily: 'beon',
                      fontWeight: 'bold',
                    }}
                  />
                </Text>
              </TouchableOpacity>
            </View>
          }
          style={styles.flatList}
        />
        {session?.sessionCreator === username && (
          <NeonButton
            title="START VOTING"
            onPress={handleStartVoting}
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
              shadowColor: '#25f57c',
              shadowOffset: {width: 0, height: 0},
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 6, // Elevation for Android
            }}
            textStyle={{
              color: '#ffffff',
              fontSize: 26,
              textAlign: 'center',
              textShadowColor: '#25f57c',
              textShadowOffset: {width: 0, height: 0},
              textShadowRadius: 10,
              fontFamily: 'beon',
              fontWeight: 'bold',
            }}
          />
        )}
        {/* <Button
          title="LEAVE"
          onPress={handleBackToSession}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.leaveButton}
          titleStyle={styles.titleStyle}
        /> */}
        <NeonButton
          title="ABANDON SESSION"
          onPress={handleBackToSession}
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
            shadowColor: 'red',
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6, // Elevation for Android
          }}
          textStyle={{
            color: '#ffffff',
            fontSize: 26,
            textAlign: 'center',
            textShadowColor: 'red',
            textShadowOffset: {width: 0, height: 0},
            textShadowRadius: 10,
            fontFamily: 'beon',
            fontWeight: 'bold',
          }}
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
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
    alignItems: 'flex-start',
    // backgroundColor: 'white',
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
    fontFamily: 'beon',
    color: 'white',
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
  usersList: {
    width: '100%',
    // Add any additional styling needed for the users list
  },
});

export default LobbyScreen;
