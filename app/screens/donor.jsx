import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../../config/api';

export default function Donor() {
  const [user, setUser] = useState(null);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [donors, setDonors] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyBloodRequests();
      fetchAllUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRequest && allUsers.length > 0) {
      filterEligibleDonors();
    }
  }, [selectedRequest, allUsers]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.warn('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const fetchMyBloodRequests = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    fetch(apiUrl(`my-blood-requests/${user._id}`))
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 200) {
          // Filter only non-accepted requests
          const activeRequests = (data.bloodRequests || []).filter(req => !req.isAccepted);
          setBloodRequests(activeRequests);
          
          // Auto-select first request if available
          if (activeRequests.length > 0 && !selectedRequest) {
            setSelectedRequest(activeRequests[0]);
          }
          setLoading(false);
        } else {
          Alert.alert('Error', data.message || 'Failed to load your blood requests');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Fetch error:', err);
        setLoading(false);
        Alert.alert('Error', 'Failed to load your blood requests');
      });
  };

  const fetchAllUsers = async () => {
    setLoadingDonors(true);
    fetch(apiUrl('users'))
      .then((res) => res.json())
      .then((data) => {
        // Assume the backend returns an array of users directly
        if (Array.isArray(data)) {
          setAllUsers(data);
        } else if (data.status === 200 && Array.isArray(data.users)) {
          setAllUsers(data.users);
        } else {
          setAllUsers([]);
        }
        setLoadingDonors(false);
      })
      .catch((err) => {
        console.warn('Fetch users error:', err);
        setLoadingDonors(false);
        setAllUsers([]);
      });
  };

  const filterEligibleDonors = () => {
    if (!selectedRequest) {
      setDonors([]);
      return;
    }

    setLoadingDonors(true);
    
    // Filter all users in the frontend based on selected request
    const filteredDonors = allUsers.filter((donor) => {
      // Must match blood group
      if (donor.bloodGroup !== selectedRequest.bloodGroup) {
        return false;
      }

      // Must not be the current user
      if (donor._id === user?._id) {
        return false;
      }

      // Must be available (not unavailable)
      if (donor.availability === 'Unavailable') {
        return false;
      }

      // Must be active
      if (donor.isActive === false) {
        return false;
      }

      // Optional: Filter by location if needed (district/thana)
      // You can uncomment these if you want location-based filtering
      // if (selectedRequest.district && donor.district !== selectedRequest.district) {
      //   return false;
      // }
      // if (selectedRequest.thana && donor.thana !== selectedRequest.thana) {
      //   return false;
      // }

      return true;
    });

    // Sort by total donations (most experienced first) and then by points
    filteredDonors.sort((a, b) => {
      const donationsA = a.totalDonations || 0;
      const donationsB = b.totalDonations || 0;
      if (donationsB !== donationsA) {
        return donationsB - donationsA;
      }
      const pointsA = a.points || 0;
      const pointsB = b.points || 0;
      return pointsB - pointsA;
    });

    setDonors(filteredDonors);
    setLoadingDonors(false);
  };

  const handleSelectRequest = (request) => {
    setSelectedRequest(request);
    // filterEligibleDonors will be called automatically via useEffect
  };

  const handleContactDonor = (donor) => {
    if (!donor.phone) {
      Alert.alert('No Phone Number', 'This donor has not provided a phone number.');
      return;
    }

    Alert.alert(
      'Contact Donor',
      `Contact ${donor.name}?\n\n` +
      `Blood Group: ${donor.bloodGroup}\n` +
      `Location: ${donor.location || 'N/A'}, ${donor.district || 'N/A'}\n` +
      `Total Donations: ${donor.totalDonations || 0}\n` +
      `Phone: ${donor.phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SMS',
          onPress: () => {
            const message = `Hello ${donor.name}, I saw your profile on NeoBlood and I need ${selectedRequest?.bloodGroup || 'blood'} donation. Would you be available to help?`;
            const smsUrl = `sms:${donor.phone}?body=${encodeURIComponent(message)}`;
            Linking.openURL(smsUrl).catch((err) => {
              console.warn('SMS error:', err);
              Alert.alert('Error', 'Could not open SMS app. Please try calling instead.');
            });
          },
        },
        {
          text: 'Call',
          onPress: () => {
            const phoneUrl = `tel:${donor.phone}`;
            Linking.openURL(phoneUrl).catch((err) => {
              console.warn('Call error:', err);
              Alert.alert('Error', 'Could not make phone call. Please check your device settings.');
            });
          },
        },
      ]
    );
  };

  const handleConnectDonor = async (donor) => {
    if (!selectedRequest) {
      Alert.alert('No Request Selected', 'Please select a blood request first.');
      return;
    }

    if (!user || !user._id) {
      Alert.alert('Error', 'User data not loaded. Please try again.');
      return;
    }

    Alert.alert(
      'Send Blood Request',
      `Send a blood donation request to ${donor.name}?\n\n` +
      `Blood Group Needed: ${selectedRequest.bloodGroup}\n` +
      `Date: ${selectedRequest.date}\n` +
      `Location: ${selectedRequest.location}, ${selectedRequest.thana}, ${selectedRequest.district}\n\n` +
      `The donor will be notified about your request.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            setSendingRequest(donor._id);
            
            // Send request to donor via backend
            fetch(apiUrl('send-request-to-donor'), {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                requesterId: user._id,
                requesterName: user.name,
                donorId: donor._id,
                donorName: donor.name,
                requestId: selectedRequest._id,
                bloodGroup: selectedRequest.bloodGroup,
                date: selectedRequest.date,
                time: selectedRequest.time,
                location: selectedRequest.location,
                district: selectedRequest.district,
                thana: selectedRequest.thana,
                phone: selectedRequest.phone || user.phone,
              }),
            })
              .then(async (res) => {
                // Check if response is JSON
                const contentType = res.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                  const text = await res.text();
                  console.warn('Non-JSON response:', text.substring(0, 200));
                  throw new Error('Server returned non-JSON response. The endpoint may not exist.');
                }
                
                // Check response status
                if (!res.ok) {
                  throw new Error(`Server error: ${res.status} ${res.statusText}`);
                }
                
                return res.json();
              })
              .then((data) => {
                setSendingRequest(null);
                if (data.status === 200) {
                  Alert.alert(
                    'Request Sent! ✅',
                    `Your blood donation request has been sent to ${donor.name}. They will be notified and can contact you soon.`,
                    [{ text: 'OK' }]
                  );
                } else {
                  Alert.alert('Error', data.message || 'Failed to send request. Please try again.');
                }
              })
              .catch((err) => {
                console.warn('Send request error:', err);
                setSendingRequest(null);
                
                let errorMessage = 'Network request failed. Please check your connection and try again.';
                
                if (err.message.includes('non-JSON response') || err.message.includes('endpoint may not exist')) {
                  errorMessage = 'The server endpoint is not available. Please contact support or check if the backend is running.';
                } else if (err.message.includes('Server error')) {
                  errorMessage = `Server error: ${err.message}. Please try again later.`;
                }
                
                Alert.alert('Error', errorMessage);
              });
          },
        },
      ]
    );
  };

  const getDonationBadgeColor = (totalDonations) => {
    if (!totalDonations) return '#BDBDBD';
    if (totalDonations >= 15) return '#E53935'; // Hero Donor
    if (totalDonations >= 8) return '#FB8C00'; // Regular Donor
    return '#43A047'; // New Donor
  };

  const getDonationBadgeText = (totalDonations) => {
    if (!totalDonations) return 'New';
    if (totalDonations >= 15) return 'Hero';
    if (totalDonations >= 8) return 'Regular';
    return 'New';
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>🩸 Eligible Donors</Text>
        <Text style={styles.subHeader}>Find donors for your blood requests</Text>
      </View>

      {/* Blood Requests Selection */}
      {bloodRequests.length > 0 ? (
        <View style={styles.requestSelectorSection}>
          <Text style={styles.sectionTitle}>Select Your Blood Request:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.requestScroll}
          >
            {bloodRequests.map((req) => (
              <TouchableOpacity
                key={req._id}
                style={[
                  styles.requestChip,
                  selectedRequest?._id === req._id && styles.requestChipActive,
                ]}
                onPress={() => handleSelectRequest(req)}
              >
                <Text
                  style={[
                    styles.requestChipText,
                    selectedRequest?._id === req._id && styles.requestChipTextActive,
                  ]}
                >
                  {req.bloodGroup} • {req.district}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Selected Request Info */}
      {selectedRequest && (
        <View style={styles.selectedRequestCard}>
          <Text style={styles.selectedRequestTitle}>Selected Request:</Text>
          <Text style={styles.selectedRequestDetails}>
            Blood Group: <Text style={styles.bold}>{selectedRequest.bloodGroup}</Text>
            {' • '}
            Date: <Text style={styles.bold}>{selectedRequest.date}</Text>
            {' • '}
            Location: <Text style={styles.bold}>{selectedRequest.location}, {selectedRequest.thana}, {selectedRequest.district}</Text>
          </Text>
        </View>
      )}

      {/* Donors List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading || loadingDonors ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53935" />
            <Text style={styles.loadingText}>
              {loading ? 'Loading your requests...' : 'Finding eligible donors...'}
            </Text>
          </View>
        ) : bloodRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No active blood requests</Text>
            <Text style={styles.emptySubtext}>
              Create a blood request first to find eligible donors
            </Text>
          </View>
        ) : !selectedRequest ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👆</Text>
            <Text style={styles.emptyText}>Select a blood request above</Text>
            <Text style={styles.emptySubtext}>
              Choose one of your active requests to see eligible donors
            </Text>
          </View>
        ) : donors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No eligible donors found</Text>
            <Text style={styles.emptySubtext}>
              Try expanding your search area or check again later
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.donorsCount}>
              {donors.length} {donors.length === 1 ? 'Donor' : 'Donors'} Found
            </Text>
            {donors.map((donor) => (
              <View key={donor._id} style={styles.donorCard}>
                <View style={styles.donorHeader}>
                  <View style={styles.donorInfo}>
                    <View style={[styles.donorBadge, { backgroundColor: getDonationBadgeColor(donor.totalDonations) }]}>
                      <Text style={styles.donorBadgeText}>
                        {getDonationBadgeText(donor.totalDonations)}
                      </Text>
                    </View>
                    <View style={styles.donorNameSection}>
                      <Text style={styles.donorName}>{donor.name || 'Anonymous'}</Text>
                      <View style={styles.donorMeta}>
                        <View style={styles.bloodGroupBadge}>
                          <Text style={styles.bloodGroupText}>{donor.bloodGroup}</Text>
                        </View>
                        <Text style={styles.donorLocation}>
                          📍 {donor.location || 'N/A'}, {donor.district || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.donorDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📞 Phone:</Text>
                    <Text style={styles.detailValue}>{donor.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🎖️ Total Donations:</Text>
                    <Text style={styles.detailValue}>{donor.totalDonations || 0}</Text>
                  </View>
                  {donor.lastDonation && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📅 Last Donation:</Text>
                      <Text style={styles.detailValue}>{donor.lastDonation}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>✅ Status:</Text>
                    <Text style={[styles.detailValue, styles.available]}>
                      {donor.availability || 'Available'}
                    </Text>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.contactButton, 
                      styles.contactButtonSecondary,
                      !donor.phone && styles.buttonDisabled
                    ]}
                    onPress={() => handleContactDonor(donor)}
                    disabled={!donor.phone}
                  >
                    <Text style={[
                      styles.contactButtonText,
                      !donor.phone && styles.buttonTextDisabled
                    ]}>
                      📞 Contact
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.contactButton, 
                      styles.connectButton,
                      sendingRequest === donor._id && styles.buttonDisabled
                    ]}
                    onPress={() => handleConnectDonor(donor)}
                    disabled={sendingRequest === donor._id}
                  >
                    {sendingRequest === donor._id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.contactButtonText}>🔗 Connect</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerSection: {
    backgroundColor: '#E53935',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 14,
    color: '#FFEBEE',
    textAlign: 'center',
  },
  requestSelectorSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  requestScroll: {
    marginTop: 4,
  },
  requestChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requestChipActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  requestChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  requestChipTextActive: {
    color: '#FFFFFF',
  },
  selectedRequestCard: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  selectedRequestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 8,
  },
  selectedRequestDetails: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  donorsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  donorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  donorHeader: {
    marginBottom: 12,
  },
  donorInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  donorBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  donorBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  donorNameSection: {
    flex: 1,
  },
  donorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  donorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodGroupBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bloodGroupText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  donorLocation: {
    fontSize: 12,
    color: '#666',
  },
  donorDetails: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  available: {
    color: '#43A047',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  contactButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonSecondary: {
    backgroundColor: '#4CAF50',
  },
  connectButton: {
    backgroundColor: '#E53935',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.6,
  },
  buttonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
  bottomPadding: {
    height: 20,
  },
});

