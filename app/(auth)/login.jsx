import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';




export default function Login() {




  const logedInfo = async () => {
    await AsyncStorage.getItem('user').then((value) => {
      if (value !== null) {
        router.push('../(dashboard)/home');
      }
    })
  }

  logedInfo();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {

    fetch('https://neoblood-backend.vercel.app/login', {
      method: 'POST',
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
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
      })
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>LOGIN</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#fff"
        keyboardType="email-address"
        autoCapitalize="none"

      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        placeholderTextColor="#fff"
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.forgot}>Click here to register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#000000ff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#333',
    color: '#ffffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ff0000ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgot: {
    color: '#ffffffff',
    textAlign: 'center',
    marginTop: 20,
  },
});
