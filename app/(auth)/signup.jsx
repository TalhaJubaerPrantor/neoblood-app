import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [bloodGroup, setBloodGroup] = useState('A+');

    const handleSignup = () => {
        // if (!name || !email || !password || !bloodGroup || !address) {
        //     Alert.alert('Error', 'Please fill all fields');
        //     return;
        // }
        // Add signup logic here
        // Alert.alert('Success', `Account created for ${name} with blood group ${bloodGroup}`);
        router.push('../(dashboard)/home');
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
