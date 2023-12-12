// VotingScreen.tsx
import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext';
import {updateUserVotingStatus, voteOnRestaurant} from '../services/apiService';
// import {disconnectSocket, emitDoneVoting} from '../services/socketService'; // Import the function from your socket service
import {VotingScreenNavigationProp} from '../types/NavigationStackTypes';
import Background from '../reusables/Background';
import * as Font from 'expo-font';
import {Button} from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface VotingScreenProps {
  navigation: VotingScreenNavigationProp;
}
const VOTING_TIMEOUT_MS = 5000000; // 5 minutes timeout for voting

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
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false); // New state

  const completeVoting = useCallback(async () => {
    if (!session) {
      console.error('No session found');
      return;
    }
    try {
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
  });

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

  useEffect(() => {
    if (shouldNavigate) {
      navigation.navigate('Results');
    }
  }, [shouldNavigate, navigation]);
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

  const handleBackToSession = () => {
    setUsername('');
    setSession(null);
    setResults(null);
    navigation.navigate('Session');
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

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
              <Text style={styles.text}>{card.name}</Text>
              <Text style={styles.text}>{card.address}</Text>
              {/* <Text style={styles.text}>{card.rating}</Text> */}
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
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: 'red',
                  borderColor: 'red',
                  color: 'white',
                  borderWidth: 1,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: -20,
                },
              },
            },
            bottom: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: 'red',
                  borderColor: 'red',
                  color: 'white',
                  borderWidth: 1,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: -20,
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: 'green',
                  borderColor: 'green',
                  color: 'white',
                  borderWidth: 1,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: 20,
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
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                  marginLeft: 20,
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
        <Button
          title="LEAVE"
          onPress={handleBackToSession}
          buttonStyle={styles.leaveButton}
          titleStyle={styles.titleStyle}
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    height: 400,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center', // Center items horizontally
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  image: {
    width: '90%',
    height: '60%',
    justifyContent: 'center',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    paddingTop: 10,
  },
  restaurantName: {
    fontSize: 22,
    fontFamily: 'rubikBold',
    marginTop: 10,
  },
});

export default VotingScreen;
