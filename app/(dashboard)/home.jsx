import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);
  const [eligibility, setEligibility] = useState('Eligible');
  const [eligibilityDate, setEligibilityDate] = useState(null);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        calculateEligibility(parsedUser);
      }
    } catch (error) {
      console.warn('Error loading user data:', error);
    }
  };

  const calculateEligibility = (userData) => {
    if (!userData) return;

    // Check availability status
    if (userData.availability === 'Unavailable') {
      // Check if eligibilityDate exists and is in the future
      if (userData.eligibilityDate) {
        const eligibilityDateObj = new Date(userData.eligibilityDate);
        const now = new Date();
        
        if (eligibilityDateObj > now) {
          // User is ineligible until eligibilityDate
          const daysRemaining = Math.ceil((eligibilityDateObj - now) / (1000 * 60 * 60 * 24));
          setEligibility(`Ineligible (${daysRemaining} days remaining)`);
          setEligibilityDate(userData.eligibilityDate);
        } else {
          // Eligibility date has passed, user is eligible again
          setEligibility('Eligible');
          setEligibilityDate(null);
        }
      } else {
        // No eligibility date but marked as unavailable
        setEligibility('Unavailable');
        setEligibilityDate(null);
      }
    } else {
      // User is available
      setEligibility('Eligible');
      setEligibilityDate(null);
    }
  };

  return (
    <View style={styles.safeContainer}>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logoBadge}>NB</Text>
        </View>
        <Text style={styles.title}>Wellcome</Text>
        <Text style={styles.subtitle}>
          Eligibility: <Text style={[
            styles.eligibilityHighlight,
            eligibility.includes('Ineligible') || eligibility === 'Unavailable' 
              ? styles.eligibilityHighlightIneligible 
              : null
          ]}>{eligibility}</Text>
        </Text>
        {eligibilityDate && (
          <Text style={styles.eligibilityDate}>
            Eligible again: {new Date(eligibilityDate).toLocaleDateString()}
          </Text>
        )}

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
  eligibilityHighlightIneligible: {
    color: '#EF4444',
  },
  eligibilityDate: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
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
