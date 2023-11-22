// Inside ResultsScreen.tsx

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import socket from '../services/socketService';
import {useSession} from '../contexts/SessionContext';

const ResultsScreen = () => {
  const [winner, setWinner] = useState(null);
  const {session} = useSession();

  useEffect(() => {
    socket.on('results', results => {
      setWinner(results.winningRestaurant);
    });

    return () => {
      socket.off('results');
    };
  }, []);

  return (
    <View style={styles.container}>
      {winner ? (
        <Text style={styles.winnerText}>Winning restaurant: {winner.name}</Text>
      ) : (
        <Text>Waiting for all votes...</Text>
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
  winnerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ResultsScreen;
