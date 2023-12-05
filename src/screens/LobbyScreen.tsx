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
import {
  joinSessionRoom,
  subscribeToUserJoined,
  startVoting,
  subscribeToVotingStarted,
  disconnectSocket,
} from '../services/socketService';
import {LobbyScreenNavigationProp} from '../types/NavigationStackTypes';
import {User} from '../types/UserType';
import Clipboard from '@react-native-community/clipboard';
import Background from '../reusables/Background';
import * as Font from 'expo-font';

interface LobbyScreenProps {
  navigation: LobbyScreenNavigationProp;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({navigation}) => {
  const {session, setSession, setResults} = useSession();
  const [users, setUsers] = useState<{username: string}[]>([]);
  const {username, setUsername} = useUser();
  const [fontsLoaded, setFontsLoaded] = useState(false);

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

    if (session?.users && session?.sessionCreator) {
      // Pass both session code and username of the session creator to the joinSessionRoom function
      joinSessionRoom(session.code, session.sessionCreator);

      const unsubscribeUserJoined = subscribeToUserJoined((newUser: User) => {
        setUsers(prevUsers => {
          // Check if the username is already in the list to avoid duplicates
          if (prevUsers.every(user => user.username !== newUser.username)) {
            return [...prevUsers, newUser];
          }
          return prevUsers;
        });
      });

      const unsubscribeVotingStarted = subscribeToVotingStarted(() => {
        navigation.navigate('Voting');
      });

      // Set the initial list of users when the component mounts
      setUsers(session.users);

      return () => {
        unsubscribeUserJoined();
        unsubscribeVotingStarted();
      };
    }
  }, [navigation, session]);

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
    setUsername(''); // Reset user context
    setSession(null);
    setResults(null);
    disconnectSocket();
    navigation.navigate('Session'); // Navigate back to the SessionScreen
  };

  const handleStartVoting = () => {
    if (session?.sessionCreator === username) {
      startVoting(session.code);
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
    fontFamily: 'rubikBold', // your custom font
    fontSize: 24,
    color: 'white',
    textShadowColor: 'black', // choose a darker shade for depth
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
    // Additional FlatList styles (e.g., margins, padding)
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
    // Additional item styles
  },
  listItemText: {
    fontSize: 20,
    fontFamily: 'rubik',
    // Additional text styles
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    // Additional header styles
  },
  clipboardIcon: {
    // Style for the copy icon or button
    padding: 5,
    backgroundColor: '#e7e7e7',
    borderRadius: 5,
  },
  clipboardText: {
    fontFamily: 'rubikItalic',
    // Style for the text inside the copy button
  },
  text: {
    fontFamily: 'rubik',
    fontSize: 18,
  },
  button: {
    backgroundColor: 'black',
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 30,
  },
  startButton: {
    backgroundColor: '#5dbea3',
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 13,
  },
  leaveButton: {
    backgroundColor: 'red',
    borderWidth: 3,
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
