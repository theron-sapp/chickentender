import React from 'react';
import {ImageBackground, StyleSheet, SafeAreaView} from 'react-native';

interface BackgroundProviderProps {
  children: React.ReactElement | React.ReactElement[]; // This implementation is so there can be multiple view children in a component
}

const Background: React.FC<BackgroundProviderProps> = ({children}) => {
  return (
    <ImageBackground
      source={require('../assets/images/Diner-Background-Image01.png')}
      style={styles.background}>
      <SafeAreaView style={styles.container}>{children}</SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
});

export default Background;
