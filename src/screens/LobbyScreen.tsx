// LobbyScreen.tsx
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {useSession} from '../contexts/SessionContext';
import {getSession} from '../services/apiService'; // This needs to be implemented

const LobbyScreen: React.FC = () => {
  const {session, setSession} = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (session?.code) {
        setIsLoading(true);
        try {
          const updatedSession = await getSession(session.code);
          setSession(updatedSession);
        } catch (error) {
          console.error(error);
        }
        setIsLoading(false);
      }
    };

    const interval = setInterval(fetchSessionData, 5000);

    return () => clearInterval(interval);
  }, [session?.code, setSession]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lobby</Text>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={session?.users}
          keyExtractor={item => item}
          renderItem={({item}) => <Text>{item}</Text>}
        />
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
