// LoginScreen.tsx
import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {useUser} from '../contexts/UserContext';
//import {useNavigation} from '@react-navigation/native'; // Import useNavigation hook
import {LoginScreenNavigationProp} from '../types/NavigationStackTypes';

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [input, setInput] = useState('');
  const {setUsername} = useUser();
  //const navigation = useNavigation(); // Use the useNavigation hook

  const handleLogin = () => {
    if (input.trim().length > 0) {
      setUsername(input.trim());
      navigation.navigate('Session'); // Use the navigate function from navigation
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid user ID.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your user ID"
        value={input}
        onChangeText={setInput}
        autoCapitalize="none"
      />
      <Button title="Enter" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
});

export default LoginScreen;
