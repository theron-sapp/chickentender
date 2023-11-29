// chickentender/src/screens/ResultsScreen.tsx
// const ConfettiCannon: any = require('react-native-confetti-cannon').default;
import React, {useRef, useCallback} from 'react';
import {View, Text, StyleSheet, Image, Button} from 'react-native';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext';
import useSocket from '../services/socketService';
import {ResultsScreenNavigationProp} from '../types/NavigationStackTypes';
import {getWinningRestaurant} from '../services/apiService';

interface ResultsScreenProps {
  navigation: ResultsScreenNavigationProp;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({navigation}) => {
  const {session, setResults} = useSession();
  const {setUsername} = useUser();
  // const confettiRef = useRef<any>(null);

  const fetchResults = useCallback(async () => {
    if (session?.code) {
      const response = await getWinningRestaurant(session.code);
      setResults(response);
      // confettiRef.current?.start();
    }
  }, [session, setResults]);

  useSocket('voting complete', fetchResults);

  const handleBackToSession = () => {
    setUsername(''); // Reset user context
    navigation.navigate('Session'); // Navigate back to the SessionScreen
  };

  if (!session || !session.results) {
    return (
      <View style={styles.container}>
        <Text>Waiting for results...</Text>
        <Button title="Back to Session" onPress={handleBackToSession} />
      </View>
    );
  }

  const {results} = session;
  //console.log(session);

  return (
    <View style={styles.container}>
      {/* <ConfettiCannon count={200} ref={confettiRef} /> */}
      <Text style={styles.title}>Results</Text>
      <View style={styles.restaurantCard}>
        <Image source={{uri: results.winner.image}} style={styles.image} />
        <Text style={styles.restaurantName}>{results.winner.name}</Text>
        <Text>{results.winner.address}</Text>
        {/* Other details as needed */}
      </View>
      <Button title="Back to Session" onPress={handleBackToSession} />
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
  loading: {
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restaurantCard: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default ResultsScreen;
