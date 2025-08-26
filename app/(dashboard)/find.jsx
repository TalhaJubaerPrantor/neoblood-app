import React from 'react';
import MapView ,{ PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

export default function find() {
  const [mapRegion, setMapRegion] = React.useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  return (
     <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE} // 👈 important
        style={styles.map}
        initialRegion={{
          latitude: 23.8103,   // Dhaka example
          longitude: 90.4125,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});