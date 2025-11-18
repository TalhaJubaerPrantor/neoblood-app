import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

// Set to true when using production/hosted backend, false for local development
const USE_PRODUCTION = false; // Change to true when deploying

// Production backend URL (update this with your hosted backend URL)
// Examples:
// - 'https://api.yourapp.com'
// - 'https://your-backend.herokuapp.com'
// - 'https://your-backend.vercel.app'
const PRODUCTION_URL = 'https://neoblood-backend.vercel.app/';

// Development settings
// IMPORTANT: Update this with your computer's local IP address
// Find it using: ipconfig (Windows) or ifconfig (Mac/Linux)
// Look for IPv4 Address under your active network adapter
const LOCAL_IP = '192.168.0.101'; // Replace with your computer's IP if this doesn't work
const DEV_PORT = 4000; // Your local backend port

// ============================================
// API URL Configuration
// ============================================

const getApiBaseUrl = () => {
  // If production mode is enabled, use production URL
  if (USE_PRODUCTION) {
    return PRODUCTION_URL;
  }

  // Development mode - use local backend
  // Check if running in Expo Go (physical device) or standalone
  const isExpoGo = Constants.executionEnvironment === 'storeClient';
  
  // For web platform, always use localhost
  if (Platform.OS === 'web') {
    return `http://localhost:${DEV_PORT}`;
  }
  
  // For Expo Go on physical devices, use computer's local IP
  if (isExpoGo) {
    return `http://${LOCAL_IP}:${DEV_PORT}`;
  }
  
  // For emulators/simulators
  if (Platform.OS === 'android') {
    // Android emulator uses special IP to access host machine
    return `http://10.0.2.2:${DEV_PORT}`;
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return `http://localhost:${DEV_PORT}`;
  }
  
  // Fallback
  return `http://${LOCAL_IP}:${DEV_PORT}`;
};

export const API_BASE_URL = getApiBaseUrl();

// Helper function to construct full API URLs
export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Export for debugging
export const API_CONFIG = {
  isProduction: USE_PRODUCTION,
  baseUrl: API_BASE_URL,
  productionUrl: PRODUCTION_URL,
};

