import React, {useState, useEffect} from 'react';
import * as Font from 'expo-font';
import {View} from 'react-native';

interface FontProviderProps {
  children: React.ReactElement;
}

const FontProvider: React.FC<FontProviderProps> = ({children}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        rubik: require('../assets/fonts/Rubik-Regular.ttf'),
        rubikBold: require('../assets/fonts/Rubik-Bold.ttf'),
        rubikItalic: require('../assets/fonts/Rubik-Italic.ttf'),
        sansNeon: require('../assets/fonts/NeonSans.ttf'),
        beon: require('../assets/fonts/Beon-Regular.ttf'),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return <View>{children}</View>;
};

export default FontProvider;
