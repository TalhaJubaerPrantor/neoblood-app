import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '../../config/api';

export default function MyPosts() {
  const [user, setUser] = useState(null);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingRequestId, setDeletingRequestId] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyBloodRequests();
    }
  }, [user]);

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
          // Filter only active (non-accepted) requests
          const activeRequests = (data.bloodRequests || []).filter(req => !req.isAccepted);
          // Sort by creation date (newest first)
          activeRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setBloodRequests(activeRequests);
        } else {
          Alert.alert('Error', data.message || 'Failed to load your blood requests');
          setBloodRequests([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Fetch error:', err);
        setLoading(false);
        Alert.alert('Error', 'Failed to load your blood requests');
        setBloodRequests([]);
      });
  };

  const handleRefresh = () => {
    fetchMyBloodRequests();
  };

  const handleDeleteRequest = async (request) => {
    if (!user?._id) {
      Alert.alert('Error', 'User data not loaded. Please try again.');
      return;
    }

    Alert.alert(
      'Delete Blood Request',
      `Are you sure you want to delete this blood request?\n\n` +
      `Blood Group: ${request.bloodGroup}\n` +
      `Date: ${request.date}\n` +
      `Location: ${request.location}, ${request.thana}, ${request.district}\n\n` +
      `This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingRequestId(request._id);
            
            // Call backend to delete request
            fetch(apiUrl('delete-blood-request'), {
              method: 'DELETE',
              headers: {
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                userId: user._id,
                requestId: request._id,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                setDeletingRequestId(null);
                if (data.status === 200) {
                  // Remove deleted request from list
                  setBloodRequests((prev) => 
                    prev.filter((req) => req._id !== request._id)
                  );
                  Alert.alert('Success', 'Blood request deleted successfully.');
                } else {
                  Alert.alert('Error', data.message || 'Failed to delete blood request');
                }
              })
              .catch((err) => {
                console.warn('Delete request error:', err);
                setDeletingRequestId(null);
                Alert.alert('Error', 'Network request failed. Please check your connection and try again.');
              });
          },
        },
      ]
    );
  };

  const getStatusBadge = (request) => {
    if (request.isAccepted) {
      return {
        text: '✅ Accepted',
        style: styles.statusAccepted,
      };
    }
    return {
      text: '⏳ Pending',
      style: styles.statusPending,
    };
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>📋 My Active Posts</Text>
        <Text style={styles.subHeader}>Your blood donation requests</Text>
        {bloodRequests.length > 0 && (
          <Text style={styles.countText}>
            {bloodRequests.length} {bloodRequests.length === 1 ? 'Active Request' : 'Active Requests'}
          </Text>
        )}
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53935" />
            <Text style={styles.loadingText}>Loading your posts...</Text>
          </View>
        ) : bloodRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No active posts</Text>
            <Text style={styles.emptySubtext}>
              You haven't created any active blood requests yet.{'\n'}
              Create a new request to find eligible donors.
            </Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>

            {bloodRequests.map((request) => {
              const status = getStatusBadge(request);
              return (
                <View key={request._id} style={styles.requestCard}>
                  {/* Header with Blood Group and Status */}
                  <View style={styles.cardHeader}>
                    <View style={styles.bloodGroupBadge}>
                      <Text style={styles.bloodGroupText}>{request.bloodGroup}</Text>
                    </View>
                    <View style={[styles.statusBadge, status.style]}>
                      <Text style={styles.statusText}>{status.text}</Text>
                    </View>
                  </View>

                  {/* Request Details */}
                  <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📅</Text>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{request.date}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>⏰</Text>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{request.time}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📞</Text>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Contact Phone</Text>
                        <Text style={styles.detailValue}>{request.phone}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>
                          {request.location}, {request.thana}, {request.district}
                        </Text>
                      </View>
                    </View>

                    {request.createdAt && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>🕐</Text>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Posted</Text>
                          <Text style={styles.detailValue}>
                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>
                    )}

                    {request.acceptedBy && request.acceptedByName && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailIcon}>✅</Text>
                        <View style={styles.detailContent}>
                          <Text style={styles.detailLabel}>Accepted By</Text>
                          <Text style={styles.detailValue}>{request.acceptedByName}</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Action Note */}
                  <View style={styles.actionNote}>
                    <Text style={styles.actionNoteText}>
                      💡 This request is visible to all eligible donors in the network
                    </Text>
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      deletingRequestId === request._id && styles.deleteButtonDisabled,
                    ]}
                    onPress={() => handleDeleteRequest(request)}
                    disabled={deletingRequestId === request._id}
                  >
                    {deletingRequestId === request._id ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.deleteButtonText}>🗑️ Delete Request</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
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
    marginBottom: 8,
  },
  countText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
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
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-end',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  refreshButtonText: {
    color: '#E53935',
    fontSize: 14,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bloodGroupBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bloodGroupText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusAccepted: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
    width: 24,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  actionNote: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  actionNoteText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 20,
  },
});

