import React, {useState, useEffect} from 'react';
import * as Font from 'expo-font';
import {View} from 'react-native';

interface RubikFontProviderProps {
  children: React.ReactElement;
}

const RubikFontProvider: React.FC<RubikFontProviderProps> = ({children}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        rubik: require('../assets/fonts/Rubik-Regular.ttf'),
        rubikBold: require('../assets/fonts/Rubik-Bold.ttf'),
        rubikItalic: require('../assets/fonts/Rubik-Italic.ttf'),
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

export default RubikFontProvider;
