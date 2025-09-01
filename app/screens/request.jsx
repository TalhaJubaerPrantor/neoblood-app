import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";

export default function requests() {
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [thana, setThana] = useState("Dhanmondi");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    if (!phone || !date || !time || !location) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    Alert.alert(
      "Request Submitted",
      `Blood Group: ${bloodGroup}\nDate: ${date}\nTime: ${time}\nPhone: ${phone}\nDistrict: ${district}\nThana: ${thana}\nLocation: ${location}`
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Request a Donor</Text>

        {/* Blood Group Dropdown */}
        <Text style={styles.label}>Blood Group</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={bloodGroup}
            onValueChange={(itemValue) => setBloodGroup(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
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

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#aaa"
          value={date}
          onChangeText={setDate}
        />

        {/* Time */}
        <Text style={styles.label}>Time</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          placeholderTextColor="#aaa"
          value={time}
          onChangeText={setTime}
        />

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          placeholderTextColor="#aaa"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        {/* District Dropdown */}
        <Text style={styles.label}>District</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={district}
            onValueChange={(itemValue) => setDistrict(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Dhaka" value="Dhaka" />
            <Picker.Item label="Chittagong" value="Chittagong" />
            <Picker.Item label="Khulna" value="Khulna" />
            <Picker.Item label="Rajshahi" value="Rajshahi" />
            <Picker.Item label="Sylhet" value="Sylhet" />
          </Picker>
        </View>

        {/* Thana Dropdown */}
        <Text style={styles.label}>Thana</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={thana}
            onValueChange={(itemValue) => setThana(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Dhanmondi" value="Dhanmondi" />
            <Picker.Item label="Uttara" value="Uttara" />
            <Picker.Item label="Mirpur" value="Mirpur" />
            <Picker.Item label="Motijheel" value="Motijheel" />
          </Picker>
        </View>

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Location"
          placeholderTextColor="#aaa"
          value={location}
          onChangeText={setLocation}
        />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E", // dark theme background
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#FF4C29", // accent
    textAlign: "center",
    marginBottom: 5,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
    marginTop: 3,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  pickerWrapper: {
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 15,
  },
  picker: {
    color: "#fff",
    height: 50,
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#FF4C29",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
