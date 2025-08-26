import React, { use, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function Leaderboard() {
  

  const [users,setUsers] = useState([]);

  useEffect(() => {
    fetch("http://192.168.0.104:3000/users")
    .then(res=>res.json())
    .then(data=>setUsers(data))
  }, [users]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top Contibuters of the Month</Text>

        {users.sort((a, b) => b.points - a.points).map((user, index) => (
          <View key={user._id} style={styles.card}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.details}>Blood Group: {user.bloodGroup}</Text>
            </View>
            <Text style={styles.donations}>{user.points}</Text>
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
