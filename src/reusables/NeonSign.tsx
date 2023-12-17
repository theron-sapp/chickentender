import React, {useRef, useEffect, useCallback} from 'react';
import {Animated, View, TextStyle, ViewStyle, StyleSheet} from 'react-native';

interface NeonSignProps {
  text: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const NeonSign: React.FC<NeonSignProps> = ({
  text,
  containerStyle,
  textStyle,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isFlickeringRef = useRef(true);
  const flickerTimeout = useRef<NodeJS.Timeout | null>(null);

  const flicker = useCallback(() => {
    if (!isFlickeringRef.current) {
      return;
    }

    const toValue = Math.random() < 0.1 ? 0.8 : 1;
    const randomDuration = 5 + Math.random() * 100;

    Animated.timing(fadeAnim, {
      toValue,
      duration: randomDuration,
      useNativeDriver: true,
    }).start(() => {
      if (flickerTimeout.current) {
        clearTimeout(flickerTimeout.current);
      }
      flickerTimeout.current = setTimeout(flicker, randomDuration);
    });
  }, [fadeAnim]);

  useEffect(() => {
    flicker();

    const flickerControl = setInterval(() => {
      isFlickeringRef.current = !isFlickeringRef.current;
      if (isFlickeringRef.current) {
        flicker();
      }
    }, 20 * 1000);

    return () => {
      fadeAnim.stopAnimation();
      clearInterval(flickerControl);
      if (flickerTimeout.current) {
        clearTimeout(flickerTimeout.current);
      }
    };
  }, [fadeAnim, flicker]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.Text style={[styles.text, {opacity: fadeAnim}, textStyle]}>
        {text}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 34,
    textAlign: 'center',
    textShadowColor: '#ff4aa3',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
    fontFamily: 'sansNeon',
    fontWeight: 'bold',
  },
});

export default NeonSign;
