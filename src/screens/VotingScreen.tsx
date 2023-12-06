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
import {voteOnRestaurant} from '../services/apiService';
import {disconnectSocket, emitDoneVoting} from '../services/socketService'; // Import the function from your socket service
import {VotingScreenNavigationProp} from '../types/NavigationStackTypes';
import Background from '../reusables/Background';
import * as Font from 'expo-font';
import {Button} from 'react-native-elements';

interface VotingScreenProps {
  navigation: VotingScreenNavigationProp;
}
const VOTING_TIMEOUT_MS = 300000; // 5 minutes timeout for voting

const VotingScreen: React.FC<VotingScreenProps> = ({navigation}) => {
  const {session, setSession} = useSession();
  const {setResults} = useSession();
  const {username, setUsername} = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(VOTING_TIMEOUT_MS / 1000); // In seconds
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false); // New state

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
        // Check if the time is up
        if (time <= 1 && session) {
          clearInterval(interval);
          emitDoneVoting(session.code, username);
          setShouldNavigate(true); // Set flag to navigate
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [session, username, navigation]);

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
        emitDoneVoting(session.code, username);
        navigation.navigate('Results');
      }
    },
    [session, username, navigation],
  );

  const handleBackToSession = () => {
    setUsername(''); // Reset user context
    setSession(null);
    setResults(null);
    disconnectSocket();
    navigation.navigate('Session'); // Navigate back to the SessionScreen
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
              <Text style={styles.text}>{card.rating}</Text>
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
    width: '90%',
  },
  buttonContainer: {
    width: 300,
    marginHorizontal: 50,
    marginVertical: 20,
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
});

export default VotingScreen;
