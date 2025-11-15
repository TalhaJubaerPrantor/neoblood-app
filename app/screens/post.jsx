import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../../config/api';

export default function Post() {
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [thana, setThana] = useState("Dhanmondi");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Pre-fill phone if user has phone number
        if (parsedUser.phone && !phone) {
          setPhone(parsedUser.phone);
        }
      }
    } catch (error) {
      console.warn('Error loading user data:', error);
    }
  };

  const bloodGroups = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
  ];

  const districts = [
    "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", 
    "Barisal", "Rangpur", "Mymensingh"
  ];

  const thanasByDistrict = {
    Dhaka: ["Dhanmondi", "Uttara", "Mirpur", "Motijheel", "Gulshan", "Banani", "Mohammadpur"],
    Chittagong: ["Agrabad", "Patenga", "Halishahar", "Kotwali"],
    Khulna: ["Sonadanga", "Khalishpur", "Daulatpur"],
    Rajshahi: ["Boalia", "Motihar", "Rajpara"],
    Sylhet: ["Zindabazar", "Uposhohor", "Amberkhana"],
    Barisal: ["Kotwali", "Band Road", "Rupatali"],
    Rangpur: ["Rangpur Sadar", "Mahiganj", "Mithapukur"],
    Mymensingh: ["Mymensingh Sadar", "Muktagacha", "Trishal"],
  };

  const validateForm = () => {
    const newErrors = {};

    // Phone validation
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^01[3-9]\d{8}$/.test(phone)) {
      newErrors.phone = "Enter valid BD phone (e.g., 01712345678)";
    }

    // Date validation
    if (!date) {
      newErrors.date = "Date is required";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      newErrors.date = "Use format: YYYY-MM-DD";
    }

    // Time validation
    if (!time) {
      newErrors.time = "Time is required";
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      newErrors.time = "Use format: HH:MM (24-hour)";
    }

    // Location validation
    if (!location.trim()) {
      newErrors.location = "Location is required";
    } else if (location.trim().length < 5) {
      newErrors.location = "Location must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors and try again.");
      return;
    }

    if (!user || !user._id) {
      Alert.alert("Error", "User data not loaded. Please try again.");
      return;
    }

    setIsSubmitting(true);
    
    // Call backend API
    fetch(apiUrl('create-blood-request'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        userId: user._id,
        bloodGroup,
        date,
        time,
        phone,
        district,
        thana,
        location: location.trim(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsSubmitting(false);
        if (data.status === 200) {
          Alert.alert(
            "Success! 🎉",
            `Your blood donation request has been posted!\n\n` +
            `Blood Group: ${bloodGroup}\n` +
            `Date: ${date}\n` +
            `Time: ${time}\n` +
            `Phone: ${phone}\n` +
            `Location: ${location}, ${thana}, ${district}\n\n` +
            `Your request is now visible to all donors in the network.`,
            [
              {
                text: "OK",
                onPress: () => {
                  // Reset form
                  setDate("");
                  setTime("");
                  setLocation("");
                  setErrors({});
                  // Keep phone number if it was pre-filled from user data
                  if (!user.phone) {
                    setPhone("");
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert("Error", data.message || "Failed to create blood request. Please try again.");
        }
      })
      .catch((err) => {
        console.warn('Create request error:', err);
        setIsSubmitting(false);
        Alert.alert("Error", "Network request failed. Please check your connection and try again.");
      });
  };

  return (
    <View style={styles.safeContainer}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Request Blood Donor</Text>
          <Text style={styles.subtitle}>Fill in the details to post your blood request</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Blood Group Section */}
          <View style={styles.formSection}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={bloodGroup}
                onValueChange={(itemValue) => setBloodGroup(itemValue)}
                style={styles.picker}
                dropdownIconColor="#E53935"
              >
                {bloodGroups.map((group) => (
                  <Picker.Item 
                    key={group.value} 
                    label={group.label} 
                    value={group.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Date & Time Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelIcon}>📅</Text>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TextInput
                style={[styles.input, errors.date && styles.inputError]}
                placeholder="2024-12-31"
                placeholderTextColor="#999"
                value={date}
                onChangeText={(text) => {
                  setDate(text);
                  if (errors.date) {
                    setErrors({ ...errors, date: null });
                  }
                }}
              />
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
            </View>

            <View style={styles.halfWidth}>
              <View style={styles.labelContainer}>
                <Text style={styles.labelIcon}>⏰</Text>
                <Text style={styles.label}>Time</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TextInput
                style={[styles.input, errors.time && styles.inputError]}
                placeholder="14:30"
                placeholderTextColor="#999"
                value={time}
                onChangeText={(text) => {
                  setTime(text);
                  if (errors.time) {
                    setErrors({ ...errors, time: null });
                  }
                }}
              />
              {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
            </View>
          </View>

          {/* Phone Section */}
          <View style={styles.formSection}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>📞</Text>
              <Text style={styles.label}>Contact Phone</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="01712345678"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors({ ...errors, phone: null });
                }
              }}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* District Section */}
          <View style={styles.formSection}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>🏙️</Text>
              <Text style={styles.label}>District</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={district}
                onValueChange={(itemValue) => {
                  setDistrict(itemValue);
                  setThana(thanasByDistrict[itemValue][0]);
                }}
                style={styles.picker}
                dropdownIconColor="#E53935"
              >
                {districts.map((dist) => (
                  <Picker.Item key={dist} label={dist} value={dist} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Thana Section */}
          <View style={styles.formSection}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>📍</Text>
              <Text style={styles.label}>Thana/Upazila</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={thana}
                onValueChange={(itemValue) => setThana(itemValue)}
                style={styles.picker}
                dropdownIconColor="#E53935"
              >
                {thanasByDistrict[district].map((th) => (
                  <Picker.Item key={th} label={th} value={th} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.formSection}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>🗺️</Text>
              <Text style={styles.label}>Specific Location</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, errors.location && styles.inputError]}
              placeholder="E.g., Square Hospital, House 18, Road 2..."
              placeholderTextColor="#999"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                if (errors.location) {
                  setErrors({ ...errors, location: null });
                }
              }}
              multiline
              numberOfLines={3}
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitText}>Post Blood Request</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Your request will be visible to all donors in the network
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerSection: {
    backgroundColor: "#E53935",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#FFEBEE",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formSection: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  required: {
    color: "#E53935",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F8F8F8",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
  },
  inputError: {
    borderColor: "#E53935",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  errorText: {
    color: "#E53935",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  pickerWrapper: {
    backgroundColor: "#F8F8F8",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    color: "#333",
    height: 50,
  },
  submitButton: {
    backgroundColor: "#E53935",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#BDBDBD",
    shadowOpacity: 0.1,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  footerNote: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 15,
    fontStyle: "italic",
  },
});
