/* eslint-disable react-native/no-inline-styles */
// chickentender/src/screens/ResultsScreen.tsx
import React, {useRef, useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, Button} from 'react-native';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext';
import {ResultsScreenNavigationProp} from '../types/NavigationStackTypes';
import {getSession, getWinningRestaurant} from '../services/apiService';
import Background from '../reusables/Background';
import NeonSign from '../reusables/NeonSign';

const ConfettiCannon: any = require('react-native-confetti-cannon').default;

interface ResultsScreenProps {
  navigation: ResultsScreenNavigationProp;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({navigation}) => {
  const {session, setSession, setResults} = useSession();
  const {setUsername} = useUser();
  const confettiRef = useRef<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [, setSessionCodeInput] = useState('');

  const fetchResults = useCallback(async () => {
    if (session?.code && isFetching) {
      const sessionUpdate = await getSession(session.code);

      if (sessionUpdate?.votingCompleted) {
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
    }
  }, [session, setResults, isFetching]);

  useEffect(() => {
    if (isFetching) {
      const intervalId = setInterval(fetchResults, 5000); // polling every 5 seconds
      return () => clearInterval(intervalId);
    }
  }, [fetchResults, isFetching]);

  const handleBackToSession = () => {
    setSessionCodeInput('');
    setUsername('');
    setSession(null);
    setResults(null);
    navigation.navigate('Session');
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
        {/* <Text style={styles.title}>Results</Text> */}
        <NeonSign
          text="RESULTS"
          textStyle={{
            color: '#ffffff',
            fontSize: 68,
            textAlign: 'center',
            shadowColor: '#ff4aa3',
            textShadowColor: '#ff4aa3',
            textShadowOffset: {width: 0, height: 0},
            textShadowRadius: 2,
            shadowOpacity: 1,
            shadowRadius: 30,
            fontFamily: 'beon',
            fontWeight: 'bold',
          }}
        />
        {hasResults ? (
          <View style={styles.restaurantCard}>
            <Image
              source={{uri: session.results.winner.image}}
              style={styles.image}
            />
            <Text style={styles.restaurantName}>
              {session.results.winner.name}
            </Text>
            <Text style={styles.text}>{session.results.winner.address}</Text>
          </View>
        ) : (
          <Text style={styles.text}>Waiting for others to finish</Text>
        )}
        {hasResults && (
          <Button title="Back to Homepage" onPress={handleBackToSession} />
        )}
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
    fontSize: 48,
    fontFamily: 'beon',
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restaurantCard: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#636262',
    justifyContent: 'center',
    backgroundColor: '#383838',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  restaurantName: {
    fontSize: 32,
    textAlign: 'center',
    paddingTop: 10,
    fontFamily: 'beon',
    color: 'white',
    shadowColor: 'yellow',
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 10,
    fontFamily: 'beon',
    color: 'white',
    shadowColor: 'black',
    shadowRadius: 4,
    shadowOpacity: 1,
  },
});

export default ResultsScreen;
