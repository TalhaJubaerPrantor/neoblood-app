import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Insight() {
  // Dummy data (replace with backend values)
  const myDonations = 5;
  const topDonation = 20;
  const eligible = true;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Donation Report</Text>

      {/* Cards Section */}
      <View style={styles.card}>
        <Ionicons name="water-outline" size={32} color="#FF4C4C" />
        <Text style={styles.cardTitle}>My Donations</Text>
        <Text style={styles.cardValue}>{myDonations}</Text>
      </View>

      <View style={styles.card}>
        <Ionicons name="trophy-outline" size={32} color="#FFD700" />
        <Text style={styles.cardTitle}>Top Donation</Text>
        <Text style={styles.cardValue}>{topDonation}</Text>
      </View>

      <View style={styles.card}>
        <Ionicons
          name={eligible ? "checkmark-circle" : "close-circle"}
          size={32}
          color={eligible ? "#4CAF50" : "#F44336"}
        />
        <Text style={styles.cardTitle}>Eligibility</Text>
        <Text
          style={[
            styles.cardValue,
            { color: eligible ? "#4CAF50" : "#F44336" },
          ]}
        >
          {eligible ? "Eligible" : "Not Eligible"}
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
  },
  button: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 12,
    borderRadius: 25,
    width: "70%",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
