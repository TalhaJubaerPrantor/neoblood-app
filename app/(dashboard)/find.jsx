import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, Callout } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import { FontAwesome } from '@expo/vector-icons';

// Mock users with location data
const allUsers = [
  // A+ Blood Group
  { id: "1", name: "Rahim Uddin", bloodGroup: "A+", phone: "01712345678", location: { latitude: 23.8103, longitude: 90.4125, name: "Dhanmondi, Dhaka" }, locationEnabled: true, totalDonations: 12 },
  { id: "2", name: "Ayesha Siddika", bloodGroup: "A+", phone: "01978901234", location: { latitude: 23.7808, longitude: 90.4217, name: "Gulshan, Dhaka" }, locationEnabled: true, totalDonations: 6 },
  { id: "3", name: "Hasina Begum", bloodGroup: "A+", phone: "01856789012", location: { latitude: 23.8223, longitude: 90.3654, name: "Mirpur, Dhaka" }, locationEnabled: true, totalDonations: 8 },
  
  // B+ Blood Group
  { id: "4", name: "Tanvir Hossain", bloodGroup: "B+", phone: "01689012345", location: { latitude: 23.8069, longitude: 90.3687, name: "Mirpur 10, Dhaka" }, locationEnabled: true, totalDonations: 10 },
  { id: "5", name: "Nasir Ahmed", bloodGroup: "B+", phone: "01534567890", location: { latitude: 23.7515, longitude: 90.3773, name: "Motijheel, Dhaka" }, locationEnabled: true, totalDonations: 15 },
  
  // O+ Blood Group
  { id: "6", name: "Fatema Khatun", bloodGroup: "O+", phone: "01934567890", location: { latitude: 23.8759, longitude: 90.3795, name: "Uttara, Dhaka" }, locationEnabled: true, totalDonations: 5 },
  { id: "7", name: "Jahangir Alam", bloodGroup: "O+", phone: "01590123456", location: { latitude: 23.7461, longitude: 90.3742, name: "Motijheel, Dhaka" }, locationEnabled: true, totalDonations: 18 },
  { id: "8", name: "Rumana Akter", bloodGroup: "O+", phone: "01445678901", location: { latitude: 23.8488, longitude: 90.3968, name: "Banani, Dhaka" }, locationEnabled: true, totalDonations: 9 },
  
  // AB+ Blood Group
  { id: "9", name: "Sumon Ali", bloodGroup: "AB+", phone: "01645678901", location: { latitude: 23.7272, longitude: 90.4093, name: "Old Dhaka" }, locationEnabled: true, totalDonations: 4 },
  
  // A- Blood Group
  { id: "10", name: "Nasrin Akter", bloodGroup: "A-", phone: "01756789012", location: { latitude: 23.7939, longitude: 90.4066, name: "Baridhara, Dhaka" }, locationEnabled: true, totalDonations: 7 },
  
  // B- Blood Group
  { id: "11", name: "Karim Ahmed", bloodGroup: "B-", phone: "01823456789", location: { latitude: 23.8103, longitude: 90.4125, name: "Dhanmondi, Dhaka" }, locationEnabled: true, totalDonations: 8 },
  
  // O- Blood Group
  { id: "12", name: "Habibur Rahman", bloodGroup: "O-", phone: "01867890123", location: { latitude: 23.8607, longitude: 90.3938, name: "Uttara Sector 7, Dhaka" }, locationEnabled: true, totalDonations: 20 },
  
  // AB- Blood Group
  { id: "13", name: "Sharmin Akter", bloodGroup: "AB-", phone: "01401234567", location: { latitude: 23.7644, longitude: 90.3787, name: "Paltan, Dhaka" }, locationEnabled: true, totalDonations: 4 },
];

export default function FindDonorsMap() {
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [mapError, setMapError] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef(null);

  const bloodGroups = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSearch = () => {
    const users = selectedGroup === "All" 
      ? allUsers.filter(u => u.locationEnabled)
      : allUsers.filter(u => u.bloodGroup === selectedGroup && u.locationEnabled);
    
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

    Alert.alert(
      "Search Results",
      `Found ${users.length} ${users.length === 1 ? 'donor' : 'donors'} with ${selectedGroup === "All" ? "all blood groups" : `blood group ${selectedGroup}`}`
    );
  };

  const handleMapReady = () => {
    setMapLoading(false);
  };

  const handleMapError = (error) => {
    console.log("Map error:", error);
    setMapError(true);
    setMapLoading(false);
  };

  const handleMarkerPress = (user) => {
    Alert.alert(
      `${user.name} (${user.bloodGroup})`,
      `📍 Location: ${user.location.name}\n` +
      `📞 Phone: ${user.phone}\n` +
      `🎖️ Total Donations: ${user.totalDonations}`,
      [
        { text: "Close", style: "cancel" },
        { 
          text: "Call", 
          onPress: () => Alert.alert("Calling...", `Contacting ${user.phone}`)
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
              {showResults && filteredUsers.map((user) => (
                <Marker
                  key={user.id}
                  coordinate={{
                    latitude: user.location.latitude,
                    longitude: user.location.longitude,
                  }}
                  pinColor={getMarkerColor(user.bloodGroup)}
                  onPress={() => handleMarkerPress(user)}
                >
                  <View style={[styles.customMarker, { backgroundColor: getMarkerColor(user.bloodGroup) }]}>
                    <Text style={styles.markerText}>{user.bloodGroup}</Text>
                  </View>
                  <Callout>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutName}>{user.name}</Text>
                      <Text style={styles.calloutBloodGroup}>{user.bloodGroup}</Text>
                      <Text style={styles.calloutLocation}>{user.location.name}</Text>
                      <Text style={styles.calloutDonations}>🎖️ {user.totalDonations} donations</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
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
          </>
        )}
      </View>

      {/* Search Panel */}
      <View style={styles.searchPanel}>
        <View style={styles.searchHeader}>
          <Text style={styles.searchTitle}>🔍 Find Blood Donors</Text>
          <Text style={styles.searchSubtitle}>Select blood group to see donors on map</Text>
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
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <FontAwesome name="search" size={16} color="#fff" />
          <Text style={styles.searchButtonText}>Search on Map</Text>
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
});
