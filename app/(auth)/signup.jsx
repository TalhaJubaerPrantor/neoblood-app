import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../../config/api';

export default function Signup() {
  const logedInfo = async () => {
    await AsyncStorage.getItem('user').then((value) => {
      if (value !== null) {
        router.push('../(dashboard)/home');
      }
    });
  };

  logedInfo();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');

  const handleSignup = () => {
    fetch(apiUrl('register'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        address,
        bloodGroup,
        age,
        phone,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          try {
            AsyncStorage.setItem('user', JSON.stringify(data.user));
          } catch (e) {
            alert(e);
          }

          router.push('../(dashboard)/home');
        } else {
          Alert.alert('Oops', data.error || 'User already exists with this email');
        }
      })
      .catch((err) => {
        console.warn('Signup error:', err);
        Alert.alert('Error', 'Network request failed. Please check your connection.');
      });
  };

  return (
    <View style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.headerSection}>
            <Text style={styles.badge}>NB</Text>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>Join the NeoBlood community</Text>
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#a3a3a3"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#a3a3a3"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#a3a3a3"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#a3a3a3"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="sentences"
            />
          </View>

          <View style={[styles.row, styles.rowSpacing]}>
            <View style={[styles.rowItem, styles.rowItemGroup]}>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={bloodGroup}
                  style={styles.picker}
                  dropdownIconColor="#ff0000"
                  onValueChange={(itemValue) => setBloodGroup(itemValue)}
                >
                  <Picker.Item label="A+" value="A+" />
                  <Picker.Item label="A-" value="A-" />
                  <Picker.Item label="B+" value="B+" />
                  <Picker.Item label="B-" value="B-" />
                  <Picker.Item label="AB+" value="AB+" />
                  <Picker.Item label="AB-" value="AB-" />
                  <Picker.Item label="O+" value="O+" />
                  <Picker.Item label="O-" value="O-" />
                </Picker>
              </View>
            </View>
            <View style={[styles.rowItem, styles.rowItemGroup]}>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#a3a3a3"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, styles.finalInputGroup]}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#a3a3a3"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  inputGroup: {
    marginBottom: 14,
  },
  finalInputGroup: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#444',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  rowSpacing: {
    marginBottom: 8,
  },
  rowItem: {
    flex: 1,
  },
  rowItemGroup: {
    marginBottom: 0,
  },
  pickerWrapper: {
    backgroundColor: '#333',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  picker: {
    height: 50,
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#ff0000ff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#1f1f1f',
    color: '#ff3b30',
    fontWeight: '800',
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    letterSpacing: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: '#bcbcbc',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
    gap: 6,
  },
  footerLink: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '700',
  },
});
