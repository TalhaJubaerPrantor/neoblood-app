import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Signup() {

    const logedInfo = async () => {
        await AsyncStorage.getItem('user').then((value) => {
            if (value !== null) {
                router.push('../(dashboard)/home');
            }
        })
    }
    
    logedInfo();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [bloodGroup, setBloodGroup] = useState('A+');
    const [age, setAge] = useState('');


    const handleSignup = () => {
        fetch('https://neoblood-backend.vercel.app/register', {
            method: 'POST',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                address,
                bloodGroup,
                age
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
                    Alert.alert('Oops', data.error || 'User already exists with this email');
                }
            })

    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled"> */}
            <Text style={styles.title}>REGISTER</Text>

            <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#ffffffff"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#ffffffff"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor="#ffffffff"
                value={address}
                onChangeText={setAddress}
                keyboardType="address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#ffffffff"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={bloodGroup}
                    style={styles.picker}
                    onValueChange={(itemValue) => setBloodGroup(itemValue)}>
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

            <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#ffffffff"
                value={age}
                onChangeText={setAge}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.forgot}>Click here to login</Text>
            </TouchableOpacity>

            {/* </ScrollView> */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#000000ff',
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
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
    pickerContainer: {
        backgroundColor: '#333',
        borderRadius: 10,
        marginBottom: 20,
    },
    picker: {
        color: '#fff',
        height: 50,
        width: '100%',
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
        marginTop: 30,
    },
});
