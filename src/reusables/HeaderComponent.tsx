import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface HeaderComponentProps {
  title: string;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({title}) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginTop: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  placeholder: {
    width: 20, // Adjust the width as per the button size
    height: 20, // Adjust the height as per the button size
  },
});

export default HeaderComponent;
