import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Picker } from "@react-native-picker/picker"; // dropdown picker

export default function HalfMapScreen() {
  const [selectedGroup, setSelectedGroup] = useState("A+");

  const handleSearch = () => {
    alert("Searching donors for group: " + selectedGroup);
  };

  return (
    <View style={styles.container}>
      {/* Map takes half screen */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 23.8103, // Dhaka example
            longitude: 90.4125,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{ latitude: 23.8103, longitude: 90.4125 }}
            title="Marker"
            description="This is an example marker"
          />
        </MapView>
      </View>

      {/* Other content takes other half */}
      <View style={styles.contentContainer}>
        <Text style={styles.label}>Find Blood Donors</Text>
        <Text style={styles.label}>Select group</Text>

        {/* Dropdown */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedGroup}
            onValueChange={(itemValue) => setSelectedGroup(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="A+" value="A+" />
            <Picker.Item label="A-" value="A-" />
            <Picker.Item label="B+" value="B+" />
            <Picker.Item label="B-" value="B-" />
            <Picker.Item label="O+" value="O+" />
            <Picker.Item label="O-" value="O-" />
            <Picker.Item label="AB+" value="AB+" />
            <Picker.Item label="AB-" value="AB-" />
          </Picker>
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column", // top-bottom layout
    backgroundColor: "#1E1E1E",

  },
  map: {
    flex: 1,

  },
  mapContainer: {
    flex: 0.7, // 70% of the screen
    padding: 5,
    
  },
  contentContainer: {
    flex: 0.3, // 30% of the screen
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 20,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 5,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "white",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: "80%",
    marginBottom: 20,
    backgroundColor: "white",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#e63946",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
