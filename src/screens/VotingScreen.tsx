/* eslint-disable react-native/no-inline-styles */
// VotingScreen.tsx
import React, {useState, useCallback, useEffect} from 'react';
import {View, Image, Text, StyleSheet, Alert} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext';
import {
  leaveSession,
  updateUserVotingStatus,
  voteOnRestaurant,
} from '../services/apiService';
// import {disconnectSocket, emitDoneVoting} from '../services/socketService'; // Import the function from your socket service
import {VotingScreenNavigationProp} from '../types/NavigationStackTypes';
import Background from '../reusables/Background';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import NeonButton from '../reusables/NeonButton';

interface VotingScreenProps {
  navigation: VotingScreenNavigationProp;
}
const VOTING_TIMEOUT_MS = 120000; // 2min

const renderStars = (rating: number) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <>
      {[...Array(fullStars)].map((_, i) => (
        <MaterialIcons
          key={`full-${i}`}
          name="star"
          size={20}
          color="#ffd700"
        />
      ))}
      {halfStar === 1 && (
        <MaterialIcons name="star-half" size={20} color="#ffd700" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <MaterialIcons
          key={`empty-${i}`}
          name="star-outline"
          size={20}
          color="#ffd700"
        />
      ))}
    </>
  );
};

const VotingScreen: React.FC<VotingScreenProps> = ({navigation}) => {
  const {session, setSession} = useSession();
  const {setResults} = useSession();
  const {username, setUsername} = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(VOTING_TIMEOUT_MS / 1000); // In seconds
  const [shouldNavigate, setShouldNavigate] = useState(false); // New state
  const [, setSessionCodeInput] = useState('');

  const completeVoting = useCallback(async () => {
    if (!session) {
      console.error('No session found');
      return;
    }
    try {
      console.log('updating user voting status');
      await updateUserVotingStatus(session.code, username);
      navigation.navigate('Results');
    } catch (error: any) {
      if (error.message.includes('Session not found')) {
        setShouldNavigate(true);
      } else {
        Alert.alert('Error', 'Failed to complete voting. Please try again.');
        console.error('Error completing voting:', error);
        navigation.navigate('Session');
      }
    }
  }, [navigation, session, username]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(time => {
        if (time <= 1 && session) {
          clearInterval(interval);
          Alert.alert('Voting Ended', 'The voting session has ended.');
          completeVoting(); // Call completeVoting when the time is up
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session, username, completeVoting]);

  // Format remaining time
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const onSwiped = useCallback(
    async (direction: 'left' | 'right', index: number) => {
      if (!session) {
        console.error('No session found');
        return;
      }

      const restaurant = session.restaurants[index];

      if (direction === 'right') {
        try {
          await voteOnRestaurant(session.code, {
            username: username,
            place_id: restaurant.id,
            vote: 'like',
            code: session.code,
          });
        } catch (error) {
          console.error('Failed to send vote:', error);
          Alert.alert('Vote Error', 'Unable to send your vote.');
        }
      }
      setCurrentIndex(index + 1);
      if (index === session.restaurants.length - 1) {
        completeVoting(); // called when last card is swiped on
      }
    },
    [session, username, completeVoting],
  );

  const handleBackToSession = async () => {
    try {
      // Call leaveSession API
      if (session?.code && username) {
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
      console.error('Error leaving session:', error);
      Alert.alert('Error', 'Failed to leave the session. Please try again.');
    }
  };

  useEffect(() => {
    if (shouldNavigate) {
      navigation.navigate('Results');
    }
  }, [shouldNavigate, navigation]);

  if (!session) {
    return (
      <View style={styles.container}>
        <Text>No session available.</Text>
      </View>
    );
  }

  return (
    <Background>
      <View style={styles.container}>
        <Swiper
          // verticalSwipe={false}
          cards={session.restaurants}
          renderCard={card => (
            <View style={styles.card}>
              <Image style={styles.image} source={{uri: card.image}} />
              <Text style={styles.restaurantName}>{card.name}</Text>
              <Text style={styles.text}>{card.address}</Text>
              <View style={styles.starContainer}>
                {renderStars(card.rating)}
              </View>
            </View>
          )}
          onSwipedLeft={index => onSwiped('left', index)}
          onSwipedBottom={index => onSwiped('left', index)}
          onSwipedRight={index => onSwiped('right', index)}
          onSwipedTop={index => onSwiped('right', index)}
          cardIndex={currentIndex}
          stackSize={2}
          infinite={false}
          animateOverlayLabelsOpacity
          backgroundColor="none"
          overlayLabels={{
            left: {
              title: '',
              style: {
                label: {
                  backgroundColor: 'red',
                  borderColor: 'red',
                  color: 'white',
                  borderWidth: 1,
                  width: '100%',
                  height: 400,
                  opacity: 0.5,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 0, // Increase margin for better coverage
                  marginLeft: 0, // Increase margin to reach the edge
                  width: '100%',
                },
              },
            },
            bottom: {
              title: '',
              style: {
                label: {
                  backgroundColor: 'red',
                  borderColor: 'red',
                  color: 'white',
                  borderWidth: 1,
                  width: '100%',
                  height: 400,
                  opacity: 0.5,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 0, // Increase margin for better coverage
                  marginLeft: 0, // Increase margin to reach the edge
                  width: '100%',
                },
              },
            },
            right: {
              title: '',
              style: {
                label: {
                  backgroundColor: 'green',
                  borderColor: 'green',
                  color: 'white',
                  borderWidth: 1,
                  width: '100%',
                  height: 400,
                  opacity: 0.5,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 0, // Increase margin for better coverage
                  marginLeft: 0, // Increase margin to reach the edge
                  width: '100%',
                },
              },
            },
            top: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: 'green',
                  borderColor: 'green',
                  color: 'white',
                  borderWidth: 1,
                  width: '100%',
                  height: 400,
                  opacity: 0.5,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 0, // Increase margin for better coverage
                  marginLeft: 0, // Increase margin to reach the edge
                  width: '100%',
                },
              },
            },
          }}
        />
        <Text style={styles.timer}>
          Time remaining: {formatTime(remainingTime)}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <NeonButton
          title="ABANDON SESSION"
          onPress={handleBackToSession}
          buttonStyle={{
            margin: 15,
            marginBottom: '7%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(52, 52, 52, 0.0)',
            padding: 1,
            width: '80%',
            borderWidth: 1,
            borderRadius: 13,
            borderColor: 'red',
            shadowColor: 'red',
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 6,
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
  container: {
    flex: 1,
    // justifyContent: 'space-between',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    // padding: 10,
  },
  titleStyle: {
    fontFamily: 'rubikBold', // your custom font
    fontSize: 24,
    color: 'white',
    textShadowColor: 'black', // choose a darker shade for depth
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 1,
    padding: 5,
  },
  leaveButton: {
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 13,
    bottom: 0,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end', // Aligns children (button) to the end of the container
    padding: 20, // Add padding for spacing from screen edges
  },

  timer: {
    color: 'white',
    fontFamily: 'beon',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    height: 400,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#636262',
    justifyContent: 'center',
    alignItems: 'center', // Center items horizontally
    backgroundColor: '#383838',
    overflow: 'hidden',
  },
  image: {
    width: '85%',
    height: '55%',
    justifyContent: 'center',
    resizeMode: 'cover',
    borderRadius: 10,
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
  restaurantName: {
    fontSize: 28,
    margin: 3,
    textAlign: 'center',
    paddingTop: 10,
    fontFamily: 'beon',
    color: 'white',
    shadowColor: 'yellow',
    shadowRadius: 4,
    shadowOpacity: 1,
  },
});

export default VotingScreen;
