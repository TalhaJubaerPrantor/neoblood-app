import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function Login() {
  const logedInfo = async () => {
    await AsyncStorage.getItem('user').then((value) => {
      if (value !== null) {
        router.push('../(dashboard)/home');
      }
    });
  };

  logedInfo();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    fetch('https://neoblood-backend.vercel.app/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
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
          Alert.alert('Oops', data.error || 'Email or password is incorrect');
        }
      });
  };

  return (
    <View style={styles.safeContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.badge}>NB</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to access your NeoBlood dashboard</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#9e9e9e"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            placeholderTextColor="#9e9e9e"
            onChangeText={setPassword}
            secureTextEntry
          />

            <TouchableOpacity>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to NeoBlood?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.footerLink}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#000000ff',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 18,
    padding: 26,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#1f1f1f',
    color: '#ff3b30',
    fontWeight: '800',
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 14,
    letterSpacing: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#1b1b1b',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    fontSize: 15,
  },
  forgotLink: {
    color: '#f97316',
    fontSize: 13,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#ff0000ff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  footerLink: {
    color: '#f97316',
    fontSize: 15,
    fontWeight: '700',
  },
});
