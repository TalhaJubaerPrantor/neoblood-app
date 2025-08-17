import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function Leaderboard() {
  const [leaders] = useState([
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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top Contibuters of the Month</Text>

        {leaders.map((leader, index) => (
          <View key={leader.id} style={styles.card}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{leader.name}</Text>
              <Text style={styles.details}>Blood Group: {leader.bloodGroup}</Text>
            </View>
            <Text style={styles.donations}>{leader.donations} Donations</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingTop: 50,

  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4C29',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4C29',
    marginRight: 15,
  },
  info: {
    flex: 1,
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
  donations: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
