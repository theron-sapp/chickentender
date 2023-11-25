// VotingScreen.tsx
import React, {useState, useCallback} from 'react';
import {View, Image, Text, StyleSheet, Alert} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import {useSession} from '../contexts/SessionContext';
import {useUser} from '../contexts/UserContext';
import {voteOnRestaurant} from '../services/apiService';
import {emitDoneVoting} from '../services/socketService'; // Import the function from your socket service
import {VotingScreenNavigationProp} from '../types/NavigationStackTypes';

interface VotingScreenProps {
  navigation: VotingScreenNavigationProp;
}

const VotingScreen: React.FC<VotingScreenProps> = ({navigation}) => {
  const {session} = useSession();
  const {username} = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);

  const onSwiped = useCallback(
    async (direction: 'left' | 'right', index: number) => {
      if (!session) {
        console.error('No session found');
        return;
      }

      const restaurant = session.restaurants[index];

      if (direction === 'right') {
        try {
          await voteOnRestaurant(session.code, {
            username: username,
            yelpBusinessId: restaurant.id,
            vote: 'like',
            code: session.code,
          });
        } catch (error) {
          console.error('Failed to send vote:', error);
          Alert.alert('Vote Error', 'Unable to send your vote.');
        }
      }

      // If the user has swiped on the last restaurant
      if (index === session.restaurants.length - 1) {
        emitDoneVoting({sessionCode: session.code, userId: username});
        navigation.navigate('Results'); // Navigate to the results screen
      }

      setCurrentIndex(index + 1);
    },
    [session, username, navigation],
  );

  if (!session) {
    return (
      <View style={styles.container}>
        <Text>No session available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Swiper
        cards={session.restaurants}
        renderCard={card => (
          <View style={styles.card}>
            <Image style={styles.image} source={{uri: card.image}} />
            <Text style={styles.text}>{card.name}</Text>
            <Text style={styles.text}>{card.address}</Text>
          </View>
        )}
        onSwipedLeft={index => onSwiped('left', index)}
        onSwipedRight={index => onSwiped('right', index)}
        cardIndex={currentIndex}
        stackSize={2}
        infinite={false}
        backgroundColor={'#4FD0E9'}
        animateOverlayLabelsOpacity
        overlayLabels={{
          left: {
            title: 'NOPE',
            style: {
              label: {
                backgroundColor: 'red',
                borderColor: 'red',
                color: 'white',
                borderWidth: 1,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 20,
                marginLeft: -20,
              },
            },
          },
          right: {
            title: 'LIKE',
            style: {
              label: {
                backgroundColor: 'green',
                borderColor: 'green',
                color: 'white',
                borderWidth: 1,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 20,
                marginLeft: 20,
              },
            },
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    height: 300,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '75%',
    resizeMode: 'cover',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    paddingTop: 10,
  },
});

export default VotingScreen;

// import React, {useState, useCallback, useEffect} from 'react';
// import {View, Image, Text, StyleSheet, Alert} from 'react-native';
// import Swiper from 'react-native-deck-swiper';
// import {useSession} from '../contexts/SessionContext';
// import {useUser} from '../contexts/UserContext';
// import {voteOnRestaurant} from '../services/apiService';
// import {
//   subscribeToResults,
//   unsubscribeFromResults,
//   emitDoneVoting, // You would need to create this function in your socketService
// } from '../services/socketService';
// import {VotingScreenNavigationProp} from '../types/NavigationStackTypes';

// interface VotingScreenProps {
//   navigation: VotingScreenNavigationProp;
// }

// const VotingScreen: React.FC<VotingScreenProps> = ({navigation}) => {
//   const {session, setResults} = useSession(); // Destructure setResults from the context
//   const {userId} = useUser();
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     subscribeToResults(receivedResults => {
//       setResults(receivedResults); // Use the setResults method from the context
//       navigation.navigate('Results'); // Navigate without parameters
//     });

//     return () => {
//       unsubscribeFromResults();
//     };
//   }, [navigation, setResults]);

//   const onSwiped = useCallback(
//     async (direction: 'left' | 'right', index: number) => {
//       if (!session) {
//         console.error('No session found');
//         return;
//       }

//       const restaurant = session.restaurants[index];

//       if (direction === 'right') {
//         try {
//           await voteOnRestaurant(session.code, {
//             userId,
//             yelpBusinessId: restaurant.id,
//             vote: 'like',
//             code: session.code,
//           });
//         } catch (error) {
//           console.error('Failed to send vote:', error);
//           Alert.alert('Vote Error', 'Unable to send your vote.');
//         }
//       }

//       if (index === session.restaurants.length - 1) {
//         emitDoneVoting({sessionCode: session.code, userId: userId}); // Pass both sessionCode and userId
//       }

//       setCurrentIndex(index + 1);
//     },
//     [session, userId],
//   );

//   if (!session) {
//     return (
//       <View style={styles.container}>
//         <Text>No session available.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Swiper
//         cards={session.restaurants}
//         renderCard={card => (
//           <View style={styles.card}>
//             <Image style={styles.image} source={{uri: card.image}} />
//             <Text style={styles.text}>{card.name}</Text>
//             <Text style={styles.text}>{card.address}</Text>
//           </View>
//         )}
//         onSwipedLeft={index => onSwiped('left', index)}
//         onSwipedRight={index => onSwiped('right', index)}
//         cardIndex={currentIndex}
//         stackSize={2}
//         infinite={false}
//         backgroundColor={'#4FD0E9'}
//         animateOverlayLabelsOpacity
//         overlayLabels={{
//           left: {
//             title: 'NOPE',
//             style: {
//               label: {
//                 backgroundColor: 'red',
//                 borderColor: 'red',
//                 color: 'white',
//                 borderWidth: 1,
//               },
//               wrapper: {
//                 flexDirection: 'column',
//                 alignItems: 'flex-end',
//                 justifyContent: 'flex-start',
//                 marginTop: 20,
//                 marginLeft: -20,
//               },
//             },
//           },
//           right: {
//             title: 'LIKE',
//             style: {
//               label: {
//                 backgroundColor: 'green',
//                 borderColor: 'green',
//                 color: 'white',
//                 borderWidth: 1,
//               },
//               wrapper: {
//                 flexDirection: 'column',
//                 alignItems: 'flex-start',
//                 justifyContent: 'flex-start',
//                 marginTop: 20,
//                 marginLeft: 20,
//               },
//             },
//           },
//         }}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   card: {
//     height: 300,
//     borderRadius: 4,
//     borderWidth: 2,
//     borderColor: '#E8E8E8',
//     justifyContent: 'center',
//     backgroundColor: 'white',
//     overflow: 'hidden',
//   },
//   image: {
//     width: '100%',
//     height: '75%',
//     resizeMode: 'cover',
//   },
//   text: {
//     fontSize: 20,
//     textAlign: 'center',
//     paddingTop: 10,
//   },
// });

// export default VotingScreen;
