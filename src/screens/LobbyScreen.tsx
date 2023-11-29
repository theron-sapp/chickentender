// LobbyScreen.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, Button, StyleSheet, FlatList} from 'react-native';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext';
import {
  joinSessionRoom,
  subscribeToUserJoined,
  startVoting,
  subscribeToVotingStarted,
} from '../services/socketService';
import {LobbyScreenNavigationProp} from '../types/NavigationStackTypes';

interface LobbyScreenProps {
  navigation: LobbyScreenNavigationProp;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({navigation}) => {
  const {session} = useSession();
  const [users, setUsers] = useState<{username: string}[]>([]);
  const {username} = useUser();

  useEffect(() => {
    if (session?.users && session?.sessionCreator) {
      // Pass both session code and username of the session creator to the joinSessionRoom function
      joinSessionRoom(session.code, session.sessionCreator);

      const unsubscribeUserJoined = subscribeToUserJoined(newUser => {
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

  const handleStartVoting = () => {
    if (session?.sessionCreator === username) {
      startVoting(session.code);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lobby</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.username}
        renderItem={({item}) => <Text>{item.username}</Text>}
        ListHeaderComponent={<Text>Session Code: {session?.code}</Text>}
      />
      {session?.sessionCreator === username && (
        <Button title="Start Voting" onPress={handleStartVoting} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default LobbyScreen;
