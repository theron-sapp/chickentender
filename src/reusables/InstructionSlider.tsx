/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef} from 'react';
import {
  ScrollView,
  View,
  Image,
  Text,
  Button,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const instructions = {
  default: require('../assets/images/FirstScreen.png'),
  join: require('../assets/images/JoinSessionScreen.png'),
  create: require('../assets/images/CreateSessionScreen.png'),
  options: require('../assets/images/CreateSessionScreen.png'),
  Lobby: require('../assets/images/LobbyScreen.png'),
  VoteLike: require('../assets/images/VotingScreenLike.png'),
  VoteDislike: require('../assets/images/VotingScreenDislike.png'),
  Results: require('../assets/images/ResultsScreen.png'),
};

const instructionLabels: {[K in keyof typeof instructions]: string} = {
  default: 'Instructions for Session',
  join: 'Instructions for Joining a Session',
  create: 'Instructions for Creating a Session',
  options: 'Instructions for Creating a Session',
  Lobby: 'Instructions for Lobby',
  VoteLike: 'Instructions for Voting - Like',
  VoteDislike: 'Instructions for Voting - Dislike',
  Results: 'Instructions for Results',
};

const {width, height} = Dimensions.get('window');

type InstructionSliderProps = {
  screen?: keyof typeof instructions;
  allSlides?: boolean;
  onClose: () => void;
};

const InstructionSlider: React.FC<InstructionSliderProps> = ({
  screen,
  allSlides,
  onClose,
}) => {
  const handleDontShowAgain = async () => {
    try {
      await AsyncStorage.setItem('@ShowInstructions', 'false');
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to update preferences.');
    }
  };
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);

  // Determine the total number of slides
  const totalSlides = allSlides ? Object.keys(instructions).length : 1;

  // Handle scroll event to update current slide
  const handleScroll = (event: {
    nativeEvent: {layoutMeasurement: {width: any}; contentOffset: {x: number}};
  }) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentSlide(roundIndex);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={scrollViewRef}>
        {allSlides
          ? // Render all slides
            Object.entries(instructions).map(([key, source]) => (
              <View
                key={key}
                style={{
                  marginTop: 80,
                  width: width,
                  height: height - 240,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={styles.text}>
                  {instructionLabels[key as keyof typeof instructions]}
                </Text>

                <Image
                  source={source}
                  style={{
                    width: width,
                    height: height - 240,
                    resizeMode: 'contain',
                    margin: 20,
                  }}
                />
              </View>
            ))
          : screen && (
              // Render only the specified slide
              <View
                style={{
                  marginTop: 80,
                  width: width,
                  height: height - 240,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={styles.text}>{instructionLabels[screen]}</Text>

                <Image
                  source={instructions[screen]}
                  style={{
                    width: width,
                    height: height - 240,
                    resizeMode: 'contain',
                    margin: 20,
                  }}
                />
              </View>
            )}
      </ScrollView>
      {allSlides && (
        <View style={styles.pagination}>
          {Array.from({length: totalSlides}).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlide === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      )}
      <View style={styles.fixToText}>
        <Button title="Close" onPress={onClose} />
        <Button title="Don't Show Again" onPress={handleDontShowAgain} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
    // marginTop: -20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    // marginBottom: -20,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    marginBottom: 40,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'gray',
  },
  text: {
    color: 'white',
    fontSize: 20,
  },
  fixToText: {
    backgroundColor: 'rgba(0, 0, 0, .1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default InstructionSlider;
