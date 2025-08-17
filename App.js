// import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ImageBackground,Image } from 'react-native';

// export default function App({ navigation }) {
//   return (

//     <ImageBackground
//       style={styles.background}
//       source={require('./assets/start-bg.jpg')}>
//       <View style={styles.container}>
//         <StatusBar barStyle="light-content" backgroundColor="#121212" />

//         {/* App Name */}
//         <Image 
//         source={require('./assets/logo.png')}  // local image path
//         style={styles.logo}
//       />
//         {/* <Text style={styles.logo}>NeoBlood</Text> */}

//         {/* Buttons */}
//         <TouchableOpacity
//           style={styles.buttonPrimary}
//           onPress={() => navigation.navigate('Login')}
//         >
//           <Text style={styles.buttonText}>Start</Text>
//         </TouchableOpacity>
//         {/* <Text/> */}
//         <Text style={styles.subtitle}>Connecting Donors. Saving Lives.</Text>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     resizeMode: "cover", 
//     justifyContent: "center",
//   },
//   container: {
//     flex: 0,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   logo: {
//     width: 200,
//     height: 70,
//     resizeMode: 'contain',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#bbb',
//     textAlign: 'center',
//     marginBottom: 40,
//   },
//   buttonPrimary: {
//     backgroundColor: '#000000ff',
//     borderWidth: 1,
//     borderColor: '#ffffffff',
//     paddingVertical: 10,
//     borderRadius: 20,
//     marginBottom: 15,
//     width: '80%',
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 20,
//   }
// });
