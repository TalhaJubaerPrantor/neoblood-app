import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function Profile() {
  const [name, setName] = useState('Talha Jubaer Prantor');
  const [email, setEmail] = useState('talhajubaer3121@gmail.com');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [rating, setRating] = useState(5);
  const handleUpdate = () => {
    if (!name || !email || !bloodGroup || !location) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert('Success', 'Profile updated successfully');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{name}</Text>
        <Text style={{ color:'#fff' ,fontSize:20}}>{email}</Text>
        <Text style={{ color:'#fff' ,fontSize:20}}>Blood Group: {bloodGroup}</Text>
        <Text style={{ color:'#fff' ,fontSize:20}}>Location: {location}</Text>
        <Text style={{ color:'#fff' ,fontSize:20}}>Rating: {rating}</Text>
      </View>
        
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    paddingTop: 50,
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
    // textAlign: 'center',
    // paddingLeft: 20,
    // paddingTop: 20,
    // marginBottom: 30,
  },
  email: {
    color: '#fff',
  },
  
});
