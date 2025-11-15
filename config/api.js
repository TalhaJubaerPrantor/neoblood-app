import { Platform } from 'react-native';
import Constants from 'expo-constants';

// IMPORTANT: Update this with your computer's local IP address
// Find it using: ipconfig (Windows) or ifconfig (Mac/Linux)
// Look for IPv4 Address under your active network adapter
const LOCAL_IP = '192.168.0.101'; // Replace with your computer's IP if this doesn't work

const getApiBaseUrl = () => {
  // Check if running in Expo Go (physical device) or standalone
  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  
  // For web platform, always use localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  }
  
  // For Expo Go on physical devices, use computer's local IP
  if (isExpoGo) {
    return `http://${LOCAL_IP}:4000`;
  }
  
  // For emulators/simulators
  if (Platform.OS === 'android') {
    // Android emulator uses special IP to access host machine
    return 'http://10.0.2.2:4000';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:4000';
  }
  
  // Fallback
  return `http://${LOCAL_IP}:4000`;
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to construct full API URLs
export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

