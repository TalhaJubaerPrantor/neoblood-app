import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfilePage() {

  const [history] = useState([
    { id: 1, name: 'John Doe', bloodGroup: 'A+', donations: 12 },
    { id: 2, name: 'Sarah Khan', bloodGroup: 'O-', donations: 10 },
    { id: 3, name: 'Michael Lee', bloodGroup: 'B+', donations: 8 },
    { id: 4, name: 'Priya Sharma', bloodGroup: 'AB+', donations: 7 },
    { id: 5, name: 'David Smith', bloodGroup: 'O+', donations: 6 },
    { id: 6, name: 'John Doe', bloodGroup: 'A+', donations: 12 },
    { id: 7, name: 'Michael Lee', bloodGroup: 'B+', donations: 8 },
    { id: 8, name: 'Priya Sharma', bloodGroup: 'AB+', donations: 7 },
    { id: 9, name: 'David Smith', bloodGroup: 'O+', donations: 6 },
    { id: 10, name: 'Sarah Khan', bloodGroup: 'O-', donations: 10 },

  ]);



  const [user, setUsers] = useState({});
  useEffect(() => {
    AsyncStorage.getItem('user')
      .then((value) => {
        setUsers(JSON.parse(value));
      }).catch((error) => {
        alert(error);
      })
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Text>{"\n"}</Text>
        {/* <Image source={{ uri: user.avatar }} style={styles.avatar} /> */}
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userLocation}>{user.address}</Text>
      </View>

      {/* Info Section */}
      <View style={styles.card}>
        {/* Age */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={24} color="red" />
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{user.age}</Text>
        </View>

        {/* Blood Group */}
        <View style={styles.infoRow}>
          <Ionicons name="water" size={24} color="red" />
          <Text style={styles.label}>Blood Group</Text>
          <Text style={styles.value}>{user.bloodGroup}</Text>
        </View>

        {/* Rating */}
        <View style={styles.infoRow}>
          <Ionicons name="star" size={24} color="gold" />
          <Text style={styles.label}>Rating</Text>
          <Text style={styles.value}>{user.points}</Text>
        </View>

        {/* Donations */}
        <View style={styles.infoRow}>
          <Ionicons name="heart" size={24} color="red" />
          <Text style={styles.label}>Donations</Text>
          <Text style={styles.value}>{user.totalDonations}</Text>
        </View>
      </View>

      {/* History */}
      <ScrollView contentContainerStyle={styles.scrollHistory}>
        <Text style={styles.title}>History</Text>
        {history.map((user) => (
          <View key={user.id} style={styles.histoyCard}>
            <View style={styles.info}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.details}>Blood Group: {user.bloodGroup}</Text>
            </View>
            <Text style={styles.donations}>{user.points}</Text>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  header: {
    alignItems: "center",

    paddingVertical: 30,
    backgroundColor: "#333",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "red",
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "red",
  },
  userEmail: {
    fontSize: 16,
    color: "#ffffffff",
    marginTop: 5,
  },
  userLocation: {
    fontSize: 15,
    color: "#ffffffff",
    marginTop: 6,
    marginHorizontal: 20,
    textAlign: "center", // center align for long addresses
  },
  card: {
    backgroundColor: "#333",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffffff",
    marginLeft: 10,
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4C29',
    textAlign: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  details: {
    fontSize: 14,
    color: '#aaa',
  },
  scrollHistory: {
    flexGrow: 1,
    padding: 20,
  },
  histoyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
});
