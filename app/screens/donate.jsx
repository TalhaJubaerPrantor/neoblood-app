import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';

const Donate = ({ userBloodGroup = 'A+', currentUserId = "68f24f5d10d3e6cca83a6dd3" }) => {
  const [bloodPost, setBloodPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterBloodGroup, setFilterBloodGroup] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchBloodRequests();
  }, []);

  const fetchBloodRequests = () => {
    setLoading(true);
    fetch('https://neoblood-backend.vercel.app/users')
      .then((res) => res.json())
      .then((data) => {
        setBloodPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Fetch error:', err);
        setLoading(false);
        Alert.alert('Error', 'Failed to load blood requests');
      });
  };

  // Filter posts by current user and non-empty bloodRequests
  const filteredPosts = bloodPost.filter(
    (p) => p._id !== currentUserId && Array.isArray(p.bloodRequests) && p.bloodRequests.length > 0
  );

  // Apply blood group filter and location search
  const displayedPosts = filteredPosts.filter((post) => {
    return post.bloodRequests.some((req) => {
      const matchesBloodGroup = filterBloodGroup === 'All' || req.bloodGroup === filterBloodGroup;
      const matchesLocation = searchLocation === '' || 
        req.district?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        req.thana?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        req.location?.toLowerCase().includes(searchLocation.toLowerCase());
      return matchesBloodGroup && matchesLocation;
    });
  });

  // Count total requests
  const totalRequests = displayedPosts.reduce((sum, post) => {
    return sum + post.bloodRequests.filter((req) => {
      const matchesBloodGroup = filterBloodGroup === 'All' || req.bloodGroup === filterBloodGroup;
      const matchesLocation = searchLocation === '' || 
        req.district?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        req.thana?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        req.location?.toLowerCase().includes(searchLocation.toLowerCase());
      return matchesBloodGroup && matchesLocation;
    }).length;
  }, 0);

  const acceptRequest = async (postId, reqIndex) => {
    const postIndex = bloodPost.findIndex((p) => p._id === postId);
    const post = bloodPost[postIndex];
    const request = post?.bloodRequests?.[reqIndex];
    if (!request) return;

    if (request.isAccepted) {
      Alert.alert('Already Accepted', 'This blood request has already been accepted.');
      return;
    }

    if (request.bloodGroup !== userBloodGroup) {
      Alert.alert(
        'Blood Group Mismatch', 
        `Your blood group (${userBloodGroup}) doesn't match the required blood group (${request.bloodGroup}).`
      );
      return;
    }

    Alert.alert(
      'Confirm Donation',
      `Are you sure you want to accept this blood donation request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            // Optimistic update
            setBloodPost((prev) =>
              prev.map((p) =>
                p._id === postId
                  ? {
                      ...p,
                      bloodRequests: p.bloodRequests.map((r, i) =>
                        i === reqIndex ? { ...r, isAccepted: true, acceptedBy: 'You' } : r
                      ),
                    }
                  : p
              )
            );
            Alert.alert('Success', 'Thank you for accepting this blood donation request!');
            // TODO: call backend to persist accept (patch endpoint)
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>🩸 Blood Wanted</Text>
        <Text style={styles.subHeader}>Help save lives by donating blood</Text>
        <Text style={styles.yourBloodGroup}>Your Blood Group: <Text style={styles.highlight}>{userBloodGroup}</Text></Text>
      </View>

      {/* Search and Filter Section */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by location, district, or thana..."
          value={searchLocation}
          onChangeText={setSearchLocation}
          placeholderTextColor="#999"
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bloodGroupFilter}>
          {bloodGroups.map((group) => (
            <TouchableOpacity
              key={group}
              style={[
                styles.filterButton,
                filterBloodGroup === group && styles.filterButtonActive,
              ]}
              onPress={() => setFilterBloodGroup(group)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterBloodGroup === group && styles.filterButtonTextActive,
                ]}
              >
                {group}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <Text style={styles.resultCount}>
        {totalRequests} {totalRequests === 1 ? 'Request' : 'Requests'} Found
      </Text>

      {/* Blood Requests List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53935" />
            <Text style={styles.loadingText}>Loading blood requests...</Text>
          </View>
        ) : displayedPosts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.noRequest}>No blood requests found</Text>
            <Text style={styles.noRequestSub}>
              {filteredPosts.length === 0
                ? 'There are no active blood requests at the moment.'
                : 'Try adjusting your filters to see more results.'}
            </Text>
          </View>
        ) : (
          displayedPosts.map((post) => (
            <View key={post._id ?? `post-${post.name ?? Math.random()}`} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Text style={styles.postName}>👤 {post.name ?? 'Unknown User'}</Text>
              </View>

              {post.bloodRequests
                .filter((req) => {
                  const matchesBloodGroup = filterBloodGroup === 'All' || req.bloodGroup === filterBloodGroup;
                  const matchesLocation = searchLocation === '' || 
                    req.district?.toLowerCase().includes(searchLocation.toLowerCase()) ||
                    req.thana?.toLowerCase().includes(searchLocation.toLowerCase()) ||
                    req.location?.toLowerCase().includes(searchLocation.toLowerCase());
                  return matchesBloodGroup && matchesLocation;
                })
                .map((req, reqIdx) => {
                  const canAccept = !req.isAccepted && req.bloodGroup === userBloodGroup;
                  const isYourBloodGroup = req.bloodGroup === userBloodGroup;
                  
                  return (
                    <View 
                      key={req._id ?? `req-${reqIdx}`} 
                      style={[
                        styles.requestCard,
                        isYourBloodGroup && !req.isAccepted && styles.requestCardHighlight,
                      ]}
                    >
                      <View style={styles.requestHeader}>
                        <View style={styles.bloodGroupBadge}>
                          <Text style={styles.bloodGroupBadgeText}>{req.bloodGroup}</Text>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          req.isAccepted ? styles.statusAccepted : styles.statusPending,
                        ]}>
                          <Text style={styles.statusText}>
                            {req.isAccepted ? '✅ Accepted' : '⏳ Pending'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.requestDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailIcon}>📅</Text>
                          <Text style={styles.detailText}>{req.date}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailIcon}>⏰</Text>
                          <Text style={styles.detailText}>{req.time}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailIcon}>📞</Text>
                          <Text style={styles.detailText}>{req.phone}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailIcon}>📍</Text>
                          <Text style={styles.detailText}>
                            {req.location}, {req.thana}, {req.district}
                          </Text>
                        </View>
                        {req.isAccepted && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>👤</Text>
                            <Text style={styles.detailText}>Accepted by: {req.acceptedBy ?? '—'}</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.button,
                          canAccept && styles.buttonActive,
                          req.isAccepted && styles.buttonAccepted,
                          !canAccept && !req.isAccepted && styles.buttonDisabled,
                        ]}
                        onPress={() => acceptRequest(post._id, reqIdx)}
                        disabled={!canAccept}
                      >
                        <Text style={styles.buttonText}>
                          {req.isAccepted 
                            ? '✓ Already Accepted' 
                            : canAccept 
                            ? '🩸 Accept & Donate' 
                            : '⚠️ Blood Group Mismatch'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
            </View>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

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
    marginBottom: 12,
  },
  yourBloodGroup: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  highlight: {
    color: '#FFEB3B',
    fontWeight: '800',
    fontSize: 18,
  },
  filterSection: {
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
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bloodGroupFilter: {
    marginTop: 4,
  },
  filterButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
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
  noRequest: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  noRequestSub: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  postCard: {
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
  postHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  postName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  requestCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requestCardHighlight: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFB74D',
    borderWidth: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodGroupBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bloodGroupBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusAccepted: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 24,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonActive: {
    backgroundColor: '#E53935',
  },
  buttonAccepted: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 20,
  },
});

export default Donate;