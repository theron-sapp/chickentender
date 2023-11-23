import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
// At the top of your file
const ConfettiCannon: any = require('react-native-confetti-cannon').default;
import {useSession} from '../contexts/SessionContext';
import {subscribeToVotingComplete} from '../services/socketService';

const ResultsScreen: React.FC = () => {
  const {session, setResults} = useSession();
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    // Assuming subscribeToVotingComplete is a function that takes a callback
    // and returns a function to unsubscribe
    const unsubscribe = subscribeToVotingComplete(results => {
      setResults(results);
      if (confettiRef.current) {
        confettiRef.current.start();
      }
    });

    return unsubscribe;
  }, [setResults]);

  if (!session || !session.results) {
    return (
      <View style={styles.container}>
        <Text>Waiting for results...</Text>
      </View>
    );
  }

  const {results} = session;

  return (
    <View style={styles.container}>
      <ConfettiCannon count={200} ref={confettiRef} />
      <Text style={styles.title}>Results</Text>
      <View style={styles.restaurantCard}>
        <Image
          source={{uri: results.winningRestaurant.image}}
          style={styles.image}
        />
        <Text style={styles.restaurantName}>
          {results.winningRestaurant.name}
        </Text>
        <Text>{results.winningRestaurant.address}</Text>
        {/* Other details as needed */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loading: {
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restaurantCard: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default ResultsScreen;

// // ResultsScreen.tsx
// import React from 'react';
// import {View, Text, StyleSheet, Image} from 'react-native';
// import {useSession} from '../contexts/SessionContext';

// const ResultsScreen: React.FC = () => {
//   const {results} = useSession(); // Destructure results from the context

//   // Ensure there are results to display, otherwise show a loading message
//   if (!results) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.loading}>Waiting for results...</Text>
//       </View>
//     );
//   }

//   // Display the winning restaurant details
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Results</Text>
//       {results.winningRestaurant && (
//         <View style={styles.restaurantCard}>
//           <Image
//             source={{uri: results.winningRestaurant.image}}
//             style={styles.image}
//           />
//           <Text style={styles.restaurantName}>
//             {results.winningRestaurant.name}
//           </Text>
//           <Text>{results.winningRestaurant.address}</Text>
//           {/* Other details like rating, price, etc. can be displayed here */}
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loading: {
//     fontSize: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   restaurantCard: {
//     width: '100%',
//     padding: 20,
//     borderRadius: 10,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//   },
//   image: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//   },
//   restaurantName: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
// });

// export default ResultsScreen;
