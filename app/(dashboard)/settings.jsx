import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';

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
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        {/* Change Password */}
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E', // dark theme background
  },
  container: {
    flexGrow: 1,
    padding: 20,
    // justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4C29', // accent color
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#333', // default dark button
    borderRadius: 12,
    padding: 15,
    // alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#e63946', // red button for delete
  },
  logoutButton: {
    backgroundColor: '#6c757d', // gray button for logout
    alignItems: 'center',
  },
});




