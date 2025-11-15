import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../../config/api';

export default function Requests() {
  const [user, setUser] = useState(null);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending'); // 'pending', 'accepted', 'rejected', 'all'
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchConnectionRequests();
    }
  }, [user, filterStatus]);

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

  const fetchConnectionRequests = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const response = await fetch(apiUrl(`connection-requests/${user._id}${statusParam}`));
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (data.status === 200) {
        setConnectionRequests(data.connectionRequests || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to load connection requests');
        setConnectionRequests([]);
      }
    } catch (error) {
      console.warn('Fetch connection requests error:', error);
      Alert.alert('Error', 'Failed to load connection requests. Please check your connection.');
      setConnectionRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!user?._id) {
      Alert.alert('Error', 'User data not loaded. Please try again.');
      return;
    }

    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this blood donation request?\n\n' +
      'By accepting:\n' +
      '• You will earn 50 points\n' +
      '• The requester will be added to your circle\n' +
      '• You will be ineligible to donate for 4 months\n\n' +
      'This ineligibility period is a safety measure to protect your health.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setProcessingRequest(requestId);
            
            try {
              const response = await fetch(apiUrl('accept-connection-request'), {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user._id,
                  requestId: requestId,
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
                Alert.alert(
                  'Request Accepted! ✅',
                  `You've accepted the blood donation request.\n\n` +
                  `🎉 You earned ${data.donor?.points || 50} points!\n\n` +
                  `⚠️ You will be ineligible to donate blood for 4 months from today. This is a safety measure to protect your health.`,
                  [{ text: 'OK', onPress: () => fetchConnectionRequests() }]
                );
                
                // Update user points and eligibility if available
                if (data.donor) {
                  const updatedUser = { 
                    ...user, 
                    points: data.donor.points, 
                    totalDonations: data.donor.totalDonations,
                    availability: data.donor.availability || user.availability,
                    eligibilityDate: data.donor.eligibilityDate || user.eligibilityDate
                  };
                  await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                  setUser(updatedUser);
                }
              } else {
                Alert.alert('Error', data.message || 'Failed to accept request');
              }
            } catch (error) {
              console.warn('Accept request error:', error);
              Alert.alert('Error', 'Network request failed. Please check your connection and try again.');
            } finally {
              setProcessingRequest(null);
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = async (requestId) => {
    if (!user?._id) {
      Alert.alert('Error', 'User data not loaded. Please try again.');
      return;
    }

    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this blood donation request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequest(requestId);
            
            try {
              const response = await fetch(apiUrl('reject-connection-request'), {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user._id,
                  requestId: requestId,
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
                Alert.alert('Request Rejected', 'The connection request has been rejected.', [
                  { text: 'OK', onPress: () => fetchConnectionRequests() }
                ]);
              } else {
                Alert.alert('Error', data.message || 'Failed to reject request');
              }
            } catch (error) {
              console.warn('Reject request error:', error);
              Alert.alert('Error', 'Network request failed. Please check your connection and try again.');
            } finally {
              setProcessingRequest(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>🩸 Connection Requests</Text>
        <Text style={styles.subHeader}>Blood donation requests sent to you</Text>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {['all', 'pending', 'accepted', 'rejected'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && styles.filterChipActive,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterStatus === status && styles.filterChipTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Requests List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53935" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : connectionRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {filterStatus === 'pending' ? '📭' : filterStatus === 'accepted' ? '✅' : filterStatus === 'rejected' ? '❌' : '📋'}
            </Text>
            <Text style={styles.emptyText}>
              {filterStatus === 'pending' 
                ? 'No pending requests' 
                : filterStatus === 'accepted'
                ? 'No accepted requests'
                : filterStatus === 'rejected'
                ? 'No rejected requests'
                : 'No connection requests'}
            </Text>
            <Text style={styles.emptySubtext}>
              {filterStatus === 'pending' 
                ? 'You don\'t have any pending blood donation requests at the moment.'
                : filterStatus === 'all'
                ? 'You haven\'t received any connection requests yet.'
                : `You don't have any ${filterStatus} requests.`}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.requestsCount}>
              {connectionRequests.length} {connectionRequests.length === 1 ? 'Request' : 'Requests'} Found
            </Text>
            {connectionRequests.map((request) => (
              <View key={request._id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestHeaderLeft}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                      <Text style={styles.statusBadgeText}>
                        {getStatusText(request.status)}
                      </Text>
                    </View>
                    <View style={styles.requesterInfo}>
                      <Text style={styles.requesterName}>{request.requesterName || 'Unknown'}</Text>
                      <Text style={styles.requestDate}>
                        📅 {formatDate(request.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🩸 Blood Group:</Text>
                    <View style={styles.bloodGroupBadge}>
                      <Text style={styles.bloodGroupText}>{request.bloodGroup}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📅 Date Needed:</Text>
                    <Text style={styles.detailValue}>{request.date || 'N/A'}</Text>
                  </View>
                  
                  {request.time && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>⏰ Time:</Text>
                      <Text style={styles.detailValue}>{request.time}</Text>
                    </View>
                  )}
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Location:</Text>
                    <Text style={styles.detailValue}>
                      {request.location || 'N/A'}, {request.thana || 'N/A'}, {request.district || 'N/A'}
                    </Text>
                  </View>
                  
                  {request.requesterPhone && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📞 Contact:</Text>
                      <Text style={styles.detailValue}>{request.requesterPhone}</Text>
                    </View>
                  )}
                  
                  {request.phone && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📱 Request Phone:</Text>
                      <Text style={styles.detailValue}>{request.phone}</Text>
                    </View>
                  )}
                </View>

                {request.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectRequest(request._id)}
                      disabled={processingRequest === request._id}
                    >
                      {processingRequest === request._id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.actionButtonText}>❌ Reject</Text>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptRequest(request._id)}
                      disabled={processingRequest === request._id}
                    >
                      {processingRequest === request._id ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.actionButtonText}>✅ Accept</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {request.status === 'accepted' && (
                  <View style={styles.acceptedBadge}>
                    <Text style={styles.acceptedText}>✅ You accepted this request</Text>
                  </View>
                )}

                {request.status === 'rejected' && (
                  <View style={styles.rejectedBadge}>
                    <Text style={styles.rejectedText}>❌ You rejected this request</Text>
                  </View>
                )}
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
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  filterScroll: {
    marginTop: 4,
  },
  filterChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
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
  requestsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },
  requestCard: {
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
  requestHeader: {
    marginBottom: 12,
  },
  requestHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  requesterInfo: {
    flex: 1,
  },
  requesterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#666',
  },
  requestDetails: {
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
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  acceptedBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  acceptedText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectedBadge: {
    backgroundColor: '#FFEBEE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  rejectedText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});

