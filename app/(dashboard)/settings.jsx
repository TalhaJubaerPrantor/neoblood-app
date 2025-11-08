import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

export default function Setting() {
  const handleChangePassword = () => {
    Alert.alert("Change Password", "Navigate to Change Password screen.");
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account?");
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user').then(() => {
        router.push('../(auth)/login');
      });

    } catch (e) {
      alert(e);
    }
  };

  return (
    <View style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.sectionDescription}>Manage your personal information and security preferences.</Text>
        </View>

        <TouchableOpacity style={styles.cardButton} onPress={handleChangePassword}>
          <View style={styles.cardContent}>
            <View style={[styles.iconBadge, styles.iconPrimary]}>
              <Text style={styles.iconText}>🔐</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Change Password</Text>
              <Text style={styles.cardSubtitle}>Update your password to keep the account secure.</Text>
            </View>
          </View>
          <View style={styles.chevron}>
            <Text style={styles.chevronText}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.cardButton, styles.cardDanger]} onPress={handleDeleteAccount}>
          <View style={styles.cardContent}>
            <View style={[styles.iconBadge, styles.iconDanger]}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Delete Account</Text>
              <Text style={styles.cardSubtitle}>Remove your profile and all associated data.</Text>
            </View>
          </View>
          <View style={styles.chevron}>
            <Text style={styles.chevronText}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.cardButton, styles.cardMuted]} onPress={handleLogout}>
          <View style={styles.cardContent}>
            <View style={[styles.iconBadge, styles.iconMuted]}>
              <Text style={styles.iconText}>🚪</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Logout</Text>
              <Text style={styles.cardSubtitle}>Sign out and return to the login screen.</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E', // dark theme background
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF4C29',
    textAlign: 'left',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionDescription: {
    marginTop: 6,
    fontSize: 13,
    color: '#B0B0B0',
    lineHeight: 18,
  },
  cardButton: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDanger: {
    backgroundColor: '#3B1F1F',
    borderColor: '#E63946',
  },
  cardMuted: {
    backgroundColor: '#2F3033',
    borderColor: '#6c757d',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPrimary: {
    backgroundColor: 'rgba(255, 76, 41, 0.12)',
  },
  iconDanger: {
    backgroundColor: 'rgba(230, 57, 70, 0.18)',
  },
  iconMuted: {
    backgroundColor: 'rgba(108, 117, 125, 0.18)',
  },
  iconText: {
    fontSize: 20,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#B0B0B0',
  },
  chevron: {
    marginLeft: 12,
  },
  chevronText: {
    fontSize: 24,
    color: '#6C6C6C',
  },
});




