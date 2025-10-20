// ...existing code...
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

const Donate = ({ userBloodGroup = 'A+', currentUserId = "68f24f5d10d3e6cca83a6dd3" }) => {
  const [bloodPost, setBloodPost] = useState([]);

  useEffect(() => {
    fetch('https://neoblood-backend.vercel.app/users')
      .then((res) => res.json())
      .then((data) => setBloodPost(data))
      .catch((err) => console.warn('Fetch error:', err));
  }, []);

  // exclude posts that belong to the current user and only keep posts with non-empty bloodRequests
  const filteredPosts = bloodPost.filter(
    (p) => p._id !== currentUserId && Array.isArray(p.bloodRequests) && p.bloodRequests.length > 0
  );

  // accept by postId (find index internally) to avoid index mismatch when filtering
  const acceptRequest = async (postId, reqIndex) => {
    const postIndex = bloodPost.findIndex((p) => p._id === postId);
    const post = bloodPost[postIndex];
    const request = post?.bloodRequests?.[reqIndex];
    if (!request) return;

    if (request.isAccepted) {
      Alert.alert('Already accepted');
      return;
    }

    if (request.bloodGroup !== userBloodGroup) {
      Alert.alert('Blood group mismatch', `Your group: ${userBloodGroup} — required: ${request.bloodGroup}`);
      return;
    }

    // optimistic update using postId
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

    // TODO: call backend to persist accept (patch endpoint)
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Posts for Blood Requests</Text>

      {filteredPosts.length === 0 ? (
        <Text style={styles.noRequest}>No blood requests available at the moment.</Text>
      ) : (
        filteredPosts.map((post) => (
          <View key={post._id ?? `post-${post.name ?? Math.random()}`} style={styles.postCard}>
            <Text style={styles.postName}>{post.name ?? 'Unknown User'}</Text>

            {post.bloodRequests.map((req, reqIdx) => {
              const canAccept = !req.isAccepted && req.bloodGroup === userBloodGroup;
              return (
                <View key={req._id ?? `req-${reqIdx}`} style={styles.requestCard}>
                  <Text style={styles.requestTitle}>
                    Blood Group: <Text style={styles.highlight}>{req.bloodGroup}</Text>
                  </Text>
                  <Text style={styles.requestInfo}>📅 {req.date}  ⏰ {req.time}</Text>
                  <Text style={styles.requestInfo}>📞 {req.phone}</Text>
                  <Text style={styles.requestInfo}>📍 {req.location}, {req.thana}, {req.district}</Text>
                  <Text style={styles.requestInfo}>
                    Status: {req.isAccepted ? '✅ Accepted' : '⏳ Pending'}
                  </Text>
                  <Text style={styles.requestInfo}>Accepted By: {req.acceptedBy ?? '—'}</Text>

                  <TouchableOpacity
                    style={[
                      styles.button,
                      canAccept ? { backgroundColor: '#E53935' } : { backgroundColor: '#999' },
                    ]}
                    onPress={() => acceptRequest(post._id, reqIdx)}
                    disabled={!canAccept}
                  >
                    <Text style={styles.buttonText}>
                      {req.isAccepted ? 'Accepted' : canAccept ? 'Accept Request' : 'Not Eligible'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
};

// ...existing styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 12,
    textAlign: 'center',
  },
  noRequest: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  postCard: {
    backgroundColor: '#5e5d5dff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#f1cfcfff',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  postName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffffff',
    marginBottom: 8,
  },
  requestCard: {
    backgroundColor: '#FDEDED',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B71C1C',
  },
  requestInfo: {
    fontSize: 14,
    color: '#444',
    marginTop: 3,
  },
  highlight: {
    color: '#E53935',
    fontWeight: '700',
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Donate;
// ...existing code...