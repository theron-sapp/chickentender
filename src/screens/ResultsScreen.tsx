import React from 'react';
import {Text} from 'react-native';
import {ResultsScreenNavigationProp} from '../types/NavigationStackTypes';

interface ResultsScreenProps {
  navigation: ResultsScreenNavigationProp;
}

const VotingScreen: React.FC<ResultsScreenProps> = () => {
  return <Text>Results Screen</Text>;
};

export default VotingScreen;
