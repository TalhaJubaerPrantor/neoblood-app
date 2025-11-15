import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function Home({ navigation }) {
  const [eligibility, setEligibility] = React.useState('Eligible');

  return (
    <View style={styles.safeContainer}>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logoBadge}>NB</Text>
        </View>
        <Text style={styles.title}>Wellcome</Text>
        <Text style={styles.subtitle}>
          Eligibility: <Text style={styles.eligibilityHighlight}>{eligibility}</Text>
        </Text>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={[styles.card, styles.cardPrimary]} onPress={() => { router.push('../screens/donate') }}>
            <Text style={styles.cardTitle}>Donate Blood</Text>
            <Text style={styles.cardDesc}>Help others by donating blood near you.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('../screens/post')}>
            <Text style={styles.cardTitle}>Post for blood</Text>
            <Text style={styles.cardDesc}>Request for blood</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('../screens/donor')}>
            <Text style={styles.cardTitle}>Find Donors</Text>
            <Text style={styles.cardDesc}>Find the nearest available donors</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('../screens/requests')}>
            <Text style={styles.cardTitle}>Requests</Text>
            <Text style={styles.cardDesc}>People who requested for blood </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('../screens/circle')}>
            <Text style={styles.cardTitle}>My circle</Text>
            <Text style={styles.cardDesc}>My connections to the people</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => router.push('../screens/myposts')}>
            <Text style={styles.cardTitle}>My Posts</Text>
            <Text style={styles.cardDesc}>See the posts I have created</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

    </View>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
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
    marginBottom: 24,
    lineHeight: 22,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoBadge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF4C29',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF4C29',
    letterSpacing: 1,
  },
  eligibilityHighlight: {
    color: '#10B981',
    fontWeight: '700',
  },
  cardContainer: {
    flexDirection: 'column',
    gap: 14,
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4C29',
  },
  cardPrimary: {
    borderLeftColor: '#F97316',
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
