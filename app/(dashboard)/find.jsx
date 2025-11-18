import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Linking, Platform } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Callout } from "react-native-maps";
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { apiUrl } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FindDonorsMap() {
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [mapError, setMapError] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [user, setUser] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    loadUserData();
    fetchUsersWithLocation();
  }, []);

  useEffect(() => {
    if (user?._id) {
      // Check if user has location enabled
      const isEnabled = user?.locationGeo?.isEnabled === true;
      setLocationEnabled(isEnabled);
      
      // If location is enabled, set the location from user data
      if (isEnabled && user.locationGeo?.latitude && user.locationGeo?.longitude) {
        setUserLocation({
          latitude: user.locationGeo.latitude,
          longitude: user.locationGeo.longitude,
          name: user.locationGeo.name || 'My Location'
        });
      } else {
        setUserLocation(null);
      }
    }
  }, [user?._id, user?.locationGeo?.isEnabled]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setLocationEnabled(parsedUser?.locationGeo?.isEnabled === true);
      }
    } catch (error) {
      console.warn('Error loading user data:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to share your location on the map. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.warn('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission.');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address name
      let locationName = 'My Location';
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (address) {
          const parts = [];
          if (address.street) parts.push(address.street);
          if (address.district) parts.push(address.district);
          if (address.city) parts.push(address.city);
          if (address.region) parts.push(address.region);
          locationName = parts.join(', ') || 'My Location';
        }
      } catch (geocodeError) {
        console.warn('Geocoding error:', geocodeError);
        // Use default name if geocoding fails
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        name: locationName,
      };
    } catch (error) {
      console.warn('Error getting current location:', error);
      throw error;
    }
  };

  const requestLocationAndUpdate = async () => {
    if (!user?._id) return;

    setUpdatingLocation(true);
    try {
      // Request permission first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setUpdatingLocation(false);
        return;
      }

      // Get current location
      const locationData = await getCurrentLocation();
      setUserLocation(locationData);

      // Send to backend
      const response = await fetch(apiUrl('update-user-location'), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          locationGeo: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            name: locationData.name,
            isEnabled: true,
          },
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (data.status === 200) {
        // Update user data
        const updatedUser = data.user || {
          ...user,
          locationGeo: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            name: locationData.name,
            isEnabled: true,
          },
        };
        setUser(updatedUser);
        setLocationEnabled(true);
        setUserLocation(locationData);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Refresh users list to include yourself with updated location
        // Use setTimeout to ensure user state is updated first
        setTimeout(() => {
          fetchUsersWithLocation();
        }, 100);
        
        Alert.alert('Location Updated', 'Your location has been shared on the map.');
      } else {
        Alert.alert('Error', data.message || 'Failed to update location');
      }
    } catch (error) {
      console.warn('Error updating location:', error);
      Alert.alert('Error', 'Failed to update your location. Please try again.');
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleToggleLocation = async () => {
    if (!user?._id) {
      Alert.alert('Error', 'User data not loaded. Please try again.');
      return;
    }

    if (locationEnabled) {
      // Disable location
      Alert.alert(
        'Disable Location Sharing',
        'Are you sure you want to disable location sharing? You will no longer appear on the map.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              setUpdatingLocation(true);
              try {
                const response = await fetch(apiUrl('update-user-location'), {
                  method: 'POST',
                  headers: {
                    'content-type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: user._id,
                    locationGeo: {
                      isEnabled: false,
                    },
                  }),
                });

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                  throw new Error('Server returned non-JSON response');
                }

                const data = await response.json();
                
                if (data.status === 200) {
                  const updatedUser = data.user || {
                    ...user,
                    locationGeo: {
                      ...user.locationGeo,
                      isEnabled: false,
                    },
                  };
                  setUser(updatedUser);
                  setLocationEnabled(false);
                  setUserLocation(null);
                  await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                  
                  // Refresh users list to reflect disabled location
                  // Use setTimeout to ensure user state is updated first
                  setTimeout(() => {
                    fetchUsersWithLocation();
                  }, 100);
                  
                  Alert.alert('Location Disabled', 'Your location is no longer shared on the map.');
                } else {
                  Alert.alert('Error', data.message || 'Failed to disable location');
                }
              } catch (error) {
                console.warn('Error disabling location:', error);
                Alert.alert('Error', 'Failed to disable location. Please try again.');
              } finally {
                setUpdatingLocation(false);
              }
            },
          },
        ]
      );
    } else {
      // Enable location
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        return;
      }

      await requestLocationAndUpdate();
    }
  };

  const fetchUsersWithLocation = async () => {
    setLoadingUsers(true);
    try {
      // Use the new backend endpoint that returns users with location (both enabled and disabled)
      const response = await fetch(apiUrl('users-with-location'));
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Non-JSON response:', text.substring(0, 200));
        setLoadingUsers(false);
        return;
      }

      const data = await response.json();
      
      // Backend returns { status: 200, users: [...], count: ... }
      if (data.status === 200 && Array.isArray(data.users)) {
        // Backend already filters eligible users and formats the data
        // Each user has: { _id, name, bloodGroup, phone, totalDonations, points, location: { latitude, longitude, name }, locationEnabled }
        const formattedUsers = data.users.map(u => ({
          id: u._id,
          _id: u._id,
          name: u.name || 'Unknown',
          bloodGroup: u.bloodGroup || '—',
          phone: u.phone || '',
          totalDonations: u.totalDonations || 0,
          points: u.points || 0,
          location: u.location, // Backend already formats this as { latitude, longitude, name }
          locationEnabled: u.locationEnabled === true // true = current location, false = last known location
        }));

        console.log(`Loaded ${formattedUsers.length} users with location data`);
        
        // Add current user to the list if they have location data
        if (user?._id && user?.locationGeo) {
          const userLocationData = user.locationGeo;
          if (userLocationData.latitude && userLocationData.longitude) {
            // Check if user is already in the list (from backend)
            const userInList = formattedUsers.find(u => u._id === user._id);
            if (!userInList) {
              // Add current user to the list
              formattedUsers.push({
                id: user._id,
                _id: user._id,
                name: user.name || 'You',
                bloodGroup: user.bloodGroup || '—',
                phone: user.phone || '',
                totalDonations: user.totalDonations || 0,
                points: user.points || 0,
                location: {
                  latitude: userLocationData.latitude,
                  longitude: userLocationData.longitude,
                  name: userLocationData.name || user.location || user.address || 'My Location'
                },
                locationEnabled: userLocationData.isEnabled === true,
                isCurrentUser: true // Flag to identify current user
              });
            } else {
              // Mark existing user as current user
              userInList.isCurrentUser = true;
            }
          }
        }
        
        setAllUsers(formattedUsers);
        
        // Automatically show all users on the map when data is loaded
        if (formattedUsers.length > 0) {
          setFilteredUsers(formattedUsers);
          setShowResults(true);
          
          // Fit map to show all markers after a short delay to ensure map is ready
          setTimeout(() => {
            if (mapRef.current && formattedUsers.length > 0) {
              const coordinates = formattedUsers
                .filter(u => u.location && u.location.latitude && u.location.longitude)
                .map(u => ({
                  latitude: u.location.latitude,
                  longitude: u.location.longitude,
                }));
              
              if (coordinates.length > 0) {
                mapRef.current.fitToCoordinates(coordinates, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                });
              }
            }
          }, 1000);
        }
      } else {
        console.warn('Unexpected response format:', data);
        setAllUsers([]);
      }
    } catch (error) {
      console.warn('Error fetching users with location:', error);
      console.warn('API URL attempted:', apiUrl('users-with-location'));
      Alert.alert('Error', 'Failed to load users. Please check your connection and ensure the backend is running.');
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const bloodGroups = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSearch = () => {
    if (loadingUsers) {
      Alert.alert('Loading', 'Please wait while we load users...');
      return;
    }

    if (allUsers.length === 0) {
      Alert.alert('No Users', 'No users with location data found. Please try again later.');
      return;
    }

    // Filter by blood group (if not "All"), but include both enabled and disabled locations
    const users = selectedGroup === "All" 
      ? allUsers
      : allUsers.filter(u => u.bloodGroup === selectedGroup);
    
    if (users.length === 0) {
      Alert.alert(
        'No Results',
        `No donors found with blood group ${selectedGroup}.`
      );
      return;
    }

    setFilteredUsers(users);
    setShowResults(true);

    // Fit map to show all markers
    if (users.length > 0 && mapRef.current) {
      const coordinates = users.map(u => ({
        latitude: u.location.latitude,
        longitude: u.location.longitude,
      }));
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const handleMapReady = () => {
    setMapLoading(false);
  };

  const handleMapError = (error) => {
    console.log("Map error:", error);
    setMapError(true);
    setMapLoading(false);
  };

  const handleMarkerPress = (userData) => {
    const locationStatus = userData.locationEnabled 
      ? '📍 Current Location' 
      : '📍 Last Known Location';
    
    if (!userData.phone) {
      Alert.alert(
        `${userData.name} (${userData.bloodGroup})`,
        `${locationStatus}: ${userData.location.name}\n` +
        `🎖️ Total Donations: ${userData.totalDonations}\n` +
        `${!userData.locationEnabled ? '\n⚠️ This is their last known location. Location sharing is currently disabled.' : ''}\n\n` +
        `Phone number not available`,
        [{ text: "Close", style: "cancel" }]
      );
      return;
    }

    Alert.alert(
      `${userData.name} (${userData.bloodGroup})`,
      `${locationStatus}: ${userData.location.name}\n` +
      `📞 Phone: ${userData.phone}\n` +
      `🎖️ Total Donations: ${userData.totalDonations}` +
      `${!userData.locationEnabled ? '\n\n⚠️ This is their last known location. Location sharing is currently disabled.' : ''}`,
      [
        { text: "Close", style: "cancel" },
        { 
          text: "Call", 
          onPress: () => {
            const phoneUrl = `tel:${userData.phone}`;
            Linking.openURL(phoneUrl).catch((err) => {
              console.warn('Call error:', err);
              Alert.alert('Error', 'Could not make phone call. Please check your device settings.');
            });
          }
        }
      ]
    );
  };

  const getMarkerColor = (bloodGroup) => {
    const colors = {
      "A+": "#E53935",
      "A-": "#D32F2F",
      "B+": "#FB8C00",
      "B-": "#F57C00",
      "AB+": "#7B1FA2",
      "AB-": "#6A1B9A",
      "O+": "#43A047",
      "O-": "#388E3C",
    };
    return colors[bloodGroup] || "#E53935";
  };

  return (
    <View style={styles.container}>
      {/* Map takes most of the screen */}
      <View style={styles.mapContainer}>
        {mapError ? (
          <View style={[styles.map, styles.mapErrorContainer]}>
            <Text style={styles.mapErrorText}>Map unavailable</Text>
            <Text style={styles.mapErrorSubtext}>Using default location</Text>
          </View>
        ) : (
          <>
            {mapLoading && (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color="#E53935" />
                <Text style={styles.loadingText}>Loading map...</Text>
              </View>
            )}
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: 23.8103,
                longitude: 90.4125,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
              }}
              onMapReady={handleMapReady}
              onError={handleMapError}
              loadingEnabled={true}
              loadingIndicatorColor="#E53935"
              loadingBackgroundColor="#F5F5F5"
            >
              {/* All users' markers (including current user) */}
              {showResults && filteredUsers
                .filter(u => {
                  // Ensure location data exists and is valid
                  if (!u.location || !u.location.latitude || !u.location.longitude) {
                    console.warn('Invalid location data for user:', u.name, u.location);
                    return false;
                  }
                  return true;
                })
                .map((userData) => {
                  // Check if this is the current user
                  const isCurrentUser = userData.isCurrentUser || userData._id === user?._id;
                  
                  return (
                <Marker
                  key={userData._id || userData.id}
                  coordinate={{
                    latitude: userData.location.latitude,
                    longitude: userData.location.longitude,
                  }}
                  pinColor={isCurrentUser ? "#4CAF50" : getMarkerColor(userData.bloodGroup)}
                  onPress={() => isCurrentUser ? null : handleMarkerPress(userData)}
                >
                  <View style={[
                    styles.customMarker, 
                    { 
                      backgroundColor: isCurrentUser ? "#4CAF50" : getMarkerColor(userData.bloodGroup),
                      opacity: userData.locationEnabled ? 1.0 : 0.7, // Dimmed for last known location
                      borderWidth: isCurrentUser ? 3 : 2,
                      borderColor: isCurrentUser ? "#FFFFFF" : "#FFFFFF",
                    }
                  ]}>
                    <Text style={styles.markerText}>
                      {isCurrentUser ? 'You' : userData.bloodGroup}
                    </Text>
                    {!userData.locationEnabled && !isCurrentUser && (
                      <View style={styles.lastLocationIndicator}>
                        <Text style={styles.lastLocationText}>⏱</Text>
                      </View>
                    )}
                  </View>
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutName}>
                        {isCurrentUser ? `${userData.name} (You)` : userData.name}
                      </Text>
                      <Text style={styles.calloutBloodGroup}>{userData.bloodGroup}</Text>
                      <Text style={styles.calloutLocation}>
                        {userData.locationEnabled ? '📍 Current Location' : '📍 Last Known Location'}
                        {': '}{userData.location.name}
                      </Text>
                      {!userData.locationEnabled && !isCurrentUser && (
                        <Text style={styles.calloutWarning}>
                          ⚠️ Location sharing disabled
                        </Text>
                      )}
                      {isCurrentUser && (
                        <Text style={styles.calloutCurrentUser}>
                          👤 This is your location
                        </Text>
                      )}
                      <Text style={styles.calloutDonations}>🎖️ {userData.totalDonations} donations</Text>
                    </View>
                  </Callout>
                </Marker>
                  );
                })}
            </MapView>

            {/* Results Counter Badge */}
            {showResults && (
              <View style={styles.resultsBadge}>
                <FontAwesome name="map-marker" size={16} color="#E53935" />
                <Text style={styles.resultsBadgeText}>
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'Donor' : 'Donors'}
                </Text>
              </View>
            )}

            {/* Location Toggle Button */}
            {user && (
              <View style={styles.locationToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.locationToggleButton,
                    locationEnabled && styles.locationToggleButtonActive,
                    updatingLocation && styles.locationToggleButtonDisabled
                  ]}
                  onPress={handleToggleLocation}
                  disabled={updatingLocation}
                >
                  {updatingLocation ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <FontAwesome 
                        name={locationEnabled ? "map-marker" : "map-marker"} 
                        size={14} 
                        color="#FFFFFF" 
                      />
                      <Text style={styles.locationToggleText}>
                        {locationEnabled ? 'Location On' : 'Share Location'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Search Panel */}
      <View style={styles.searchPanel}>
        <View style={styles.searchHeader}>
          <Text style={styles.searchTitle}>🔍 Find Blood Donors</Text>
          <Text style={styles.searchSubtitle}>
            {loadingUsers 
              ? 'Loading users...' 
              : `${allUsers.length} donors with location data`}
          </Text>
        </View>

        {/* Blood Group Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.bloodGroupScroll}
        >
          {bloodGroups.map((group) => (
            <TouchableOpacity
              key={group}
              style={[
                styles.bloodGroupChip,
                selectedGroup === group && styles.bloodGroupChipActive,
              ]}
              onPress={() => setSelectedGroup(group)}
            >
              <Text
                style={[
                  styles.bloodGroupChipText,
                  selectedGroup === group && styles.bloodGroupChipTextActive,
                ]}
              >
                {group}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search Button */}
        <TouchableOpacity 
          style={[styles.searchButton, loadingUsers && styles.searchButtonDisabled]} 
          onPress={handleSearch}
          disabled={loadingUsers}
        >
          {loadingUsers ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <FontAwesome name="search" size={16} color="#fff" />
              <Text style={styles.searchButtonText}>Search on Map</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Legend */}
        {showResults && (
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>Map Legend:</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: "#E53935" }]} />
              <Text style={styles.legendText}>A+/A-</Text>
              <View style={[styles.legendDot, { backgroundColor: "#FB8C00" }]} />
              <Text style={styles.legendText}>B+/B-</Text>
              <View style={[styles.legendDot, { backgroundColor: "#43A047" }]} />
              <Text style={styles.legendText}>O+/O-</Text>
              <View style={[styles.legendDot, { backgroundColor: "#7B1FA2" }]} />
              <Text style={styles.legendText}>AB+/AB-</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  mapContainer: {
    flex: 0.65,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  searchPanel: {
    flex: 0.35,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  searchHeader: {
    marginBottom: 15,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
    marginBottom: 4,
  },
  searchSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  bloodGroupScroll: {
    marginBottom: 15,
  },
  bloodGroupChip: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  bloodGroupChipActive: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  bloodGroupChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },
  bloodGroupChipTextActive: {
    color: "#FFFFFF",
  },
  searchButton: {
    backgroundColor: "#E53935",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 12,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  legendContainer: {
    backgroundColor: "#F8F8F8",
    padding: 10,
    borderRadius: 10,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    marginLeft: 8,
  },
  legendText: {
    fontSize: 11,
    color: "#666",
    marginRight: 4,
  },
  customMarker: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  calloutContainer: {
    padding: 10,
    minWidth: 150,
  },
  calloutName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  calloutBloodGroup: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E53935",
    marginBottom: 4,
  },
  calloutLocation: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  calloutDonations: {
    fontSize: 12,
    color: "#43A047",
    fontWeight: "600",
  },
  calloutCurrentUser: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 4,
  },
  calloutWarning: {
    fontSize: 11,
    color: "#FF9800",
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 4,
    fontStyle: "italic",
  },
  lastLocationIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF9800",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  lastLocationText: {
    fontSize: 8,
    color: "#FFFFFF",
  },
  resultsBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    gap: 8,
  },
  resultsBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  mapLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  mapErrorContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  mapErrorText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
  },
  mapErrorSubtext: {
    color: "#999",
    fontSize: 14,
  },
  locationToggleContainer: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
    alignItems: "center",
  },
  locationToggleButton: {
    backgroundColor: "#666",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  locationToggleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  locationToggleButtonDisabled: {
    opacity: 0.6,
  },
  locationToggleText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
