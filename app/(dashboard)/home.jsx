import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export default function Home({ navigation }) {
      const [eligibility, setEligibility] = React.useState('Eligible');
  
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>NeoBlood</Text>
        <Text style={styles.subtitle}>
          Eligibility: {eligibility}
        </Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Donate', 'Navigate to Donate Blood')}>
            <Text style={styles.cardTitle}>Donate Blood</Text>
            <Text style={styles.cardDesc}>Help others by donating blood near you.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Find Donors', 'Navigate to Find Donors')}>
            <Text style={styles.cardTitle}>Find Donors</Text>
            <Text style={styles.cardDesc}>Search for donors by blood group and location.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => Alert.alert('My Profile', 'Navigate to Profile')}>
            <Text style={styles.cardTitle}>My Profile</Text>
            <Text style={styles.cardDesc}>View your donor profile and activity.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Leaderboard', 'Navigate to Leaderboard')}>
            <Text style={styles.cardTitle}>Leaderboard</Text>
            <Text style={styles.cardDesc}>See top donors and earn rewards for your contributions.</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
                  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4C29',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  cardContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 14,
    color: '#aaa',
  },
});
