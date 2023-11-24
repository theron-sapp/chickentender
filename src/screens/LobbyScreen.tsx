// LobbyScreen.tsx
import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, FlatList} from 'react-native';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext'; // Make sure to import useUser
import {
  joinSessionRoom,
  subscribeToUserJoined,
  unsubscribeFromUserJoined,
  startVoting, // Make sure this is imported
  subscribeToVotingStarted,
  unsubscribeFromVotingStarted,
} from '../services/socketService';
import {LobbyScreenNavigationProp} from '../types/NavigationStackTypes';

interface LobbyScreenProps {
  navigation: LobbyScreenNavigationProp;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({navigation}) => {
  const {userId} = useUser();
  const {session} = useSession();
  const [users, setUsers] = useState<string[]>(session?.users || []); // Initialize with current users in the session
  const isSessionCreator = userId === session?.sessionCreator;

  useEffect(() => {
    if (session?.code) {
      joinSessionRoom(session.code, userId);

      subscribeToUserJoined(user => {
        const newUserId = user.userId;
        setUsers(prevUsers => {
          if (newUserId && !prevUsers.includes(newUserId)) {
            return [...prevUsers, newUserId];
          }
          return prevUsers;
        });
      });

      subscribeToVotingStarted(() => {
        navigation.navigate('Voting'); // Replace 'Voting' with your actual Voting screen route name
      });
    }

    return () => {
      unsubscribeFromUserJoined();
      unsubscribeFromVotingStarted();
    };
  }, [navigation, session, userId]);

  const handleStartVoting = () => {
    if (session?.code) {
      startVoting(session.code); // Use startVoting from socketService
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lobby</Text>
      <FlatList
        data={users}
        keyExtractor={item => item}
        renderItem={({item}) => <Text>{item}</Text>}
        ListHeaderComponent={<Text>Session Code: {session?.code}</Text>}
      />
      {isSessionCreator && (
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LobbyScreen;
