import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function Donate() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [area, setArea] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    // Dummy results for now
    const dummyResults = [
      { id: "1", name: "Rahim", blood: "A+", district: "Dhaka", thana: "Mirpur", area: "Block C" },
      { id: "2", name: "Karim", blood: "O+", district: "Dhaka", thana: "Uttara", area: "Sector 10" },
    ];
    setResults(dummyResults);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for Blood</Text>

      {/* Blood Group Dropdown */}
      <Text style={styles.label}>Select Blood Group</Text>
      <Picker
        selectedValue={bloodGroup}
        onValueChange={(value) => setBloodGroup(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select Blood Group" value="" />
        <Picker.Item label="A+" value="A+" />
        <Picker.Item label="A-" value="A-" />
        <Picker.Item label="B+" value="B+" />
        <Picker.Item label="B-" value="B-" />
        <Picker.Item label="O+" value="O+" />
        <Picker.Item label="O-" value="O-" />
        <Picker.Item label="AB+" value="AB+" />
        <Picker.Item label="AB-" value="AB-" />
      </Picker>

      {/* District Dropdown */}
      <Text style={styles.label}>Select District</Text>
      <Picker
        selectedValue={district}
        onValueChange={(value) => setDistrict(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select District" value="" />
        <Picker.Item label="Dhaka" value="Dhaka" />
        <Picker.Item label="Chittagong" value="Chittagong" />
        <Picker.Item label="Rajshahi" value="Rajshahi" />
      </Picker>

      {/* Thana Dropdown */}
      <Text style={styles.label}>Select Thana</Text>
      <Picker
        selectedValue={thana}
        onValueChange={(value) => setThana(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select Thana" value="" />
        <Picker.Item label="Mirpur" value="Mirpur" />
        <Picker.Item label="Uttara" value="Uttara" />
        <Picker.Item label="Gulshan" value="Gulshan" />
      </Picker>

      {/* Area Dropdown */}
      <Text style={styles.label}>Select Area</Text>
      <Picker
        selectedValue={area}
        onValueChange={(value) => setArea(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select Area" value="" />
        <Picker.Item label="Block A" value="Block A" />
        <Picker.Item label="Block B" value="Block B" />
        <Picker.Item label="Block C" value="Block C" />
        <Picker.Item label="Sector 9" value="Sector 9" />
        <Picker.Item label="Sector 10" value="Sector 10" />
      </Picker>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {/* Results List */}
      <Text style={styles.resultTitle}>Results:</Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>
              {item.name} - {item.blood}
            </Text>
            <Text style={styles.resultSub}>
              {item.district}, {item.thana}, {item.area}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "red",
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  resultCard: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  resultText: {
    fontWeight: "bold",
  },
  resultSub: {
    color: "gray",
  },
});
