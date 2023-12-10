// chickentender/src/screens/ResultsScreen.tsx
import React, {useRef, useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, Button} from 'react-native';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext';
import {ResultsScreenNavigationProp} from '../types/NavigationStackTypes';
import {getWinningRestaurant} from '../services/apiService';
import Background from '../reusables/Background';

const ConfettiCannon: any = require('react-native-confetti-cannon').default;

interface ResultsScreenProps {
  navigation: ResultsScreenNavigationProp;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({navigation}) => {
  const {session, setSession, setResults} = useSession();
  const {setUsername} = useUser();
  const confettiRef = useRef<any>(null);
  const [isFetching, setIsFetching] = useState(true);

  const fetchResults = useCallback(async () => {
    if (session?.code && isFetching) {
      try {
        const response = await getWinningRestaurant(session.code);
        console.log('Fetched results:', response); // Debugging log
        if (response && response.winner) {
          setResults(response);
          setIsFetching(false);
          confettiRef.current?.start();
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      }
    }
  }, [session, setResults, isFetching]);

  useEffect(() => {
    if (isFetching) {
      const intervalId = setInterval(fetchResults, 5000); // polling every 5 seconds
      return () => clearInterval(intervalId);
    }
  }, [fetchResults, isFetching]);

  const handleBackToSession = () => {
    setUsername(''); // Reset user context
    setSession(null);
    setResults(null);
    navigation.navigate('Session'); // Navigate back to the SessionScreen
  };

  const hasResults = session?.results && session.results.winner;

  return (
    <Background>
      <View style={styles.container}>
        {hasResults && (
          <ConfettiCannon
            count={400}
            origin={{x: -10, y: 0}}
            ref={confettiRef}
          />
        )}
        <Text style={styles.title}>Results</Text>
        {hasResults ? (
          <View style={styles.restaurantCard}>
            <Image
              source={{uri: session.results.winner.image}}
              style={styles.image}
            />
            <Text style={styles.restaurantName}>
              {session.results.winner.name}
            </Text>
            <Text>{session.results.winner.address}</Text>
            {/* Other details as needed */}
          </View>
        ) : (
          <Text>Waiting for results...</Text>
        )}
        <Button title="Back to Session" onPress={handleBackToSession} />
      </View>
    </Background>
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
