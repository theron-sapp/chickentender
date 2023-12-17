import React, {useRef, useEffect} from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  Text,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface NeonButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const NeonButton: React.FC<NeonButtonProps> = ({
  onPress,
  title,
  buttonStyle,
  textStyle,
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowStyle = {
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 20],
    }),
  };

  return (
    <Animated.View
      style={[styles.neonButton, styles.shadow, glowStyle, buttonStyle]}>
      <TouchableOpacity onPress={onPress} style={styles.buttonContent}>
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  neonButton: {
    padding: 3,
    backgroundColor: 'rgba(52, 52, 52, 0.0)',
    borderRadius: 12,
    elevation: 6, // For Android shadow
  },
  shadow: {
    shadowColor: '#ff4aa3', // Default shadow color
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  buttonContent: {
    padding: 10,
  },
  text: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    textShadowColor: '#ff4aa3',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
    fontFamily: 'sansNeon',
    fontWeight: 'bold',
  },
});

export default NeonButton;
