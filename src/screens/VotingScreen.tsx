import React from 'react';
import {Text} from 'react-native';
import {VotingScreenNavigationProp} from '../types/NavigationStackTypes';

interface VotingScreenProps {
  navigation: VotingScreenNavigationProp;
}

const VotingScreen: React.FC<VotingScreenProps> = () => {
  return <Text>Voting Screen</Text>;
};

export default VotingScreen;
