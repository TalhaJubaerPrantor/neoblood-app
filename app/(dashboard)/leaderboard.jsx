import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { apiUrl } from '../../config/api';

const rankColors = ['#FACC15', '#A1A1AA', '#F97316'];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl('users'))
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Fetch error:', err);
        setError(true);
        setLoading(false);
      });
  }, []); // Empty dependency array to run only once

  return (
    <View style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top Contributors of the Month</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4C29" />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load leaderboard</Text>
            <Text style={styles.errorSubtext}>Please check your connection</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contributors yet</Text>
          </View>
        ) : (
          users.sort((a, b) => b.points - a.points).map((user, index) => (
            <View key={user._id ?? `user-${index}`} style={styles.card}>
              <View style={[styles.rankBadge, { borderColor: rankColors[index] || '#FF4C29' }]}>
                <Text style={[styles.rankText, { color: rankColors[index] || '#FF4C29' }]}>
                  #{index + 1}
                </Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{user.name ?? 'Anonymous Donor'}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>Blood Group: {user.bloodGroup ?? '—'}</Text>
                  </View>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaChipText}>
                      Donations: {user.totalDonations ?? 0}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.pointsBlock}>
                <Text style={styles.pointsValue}>{user.points ?? 0}</Text>
                <Text style={styles.pointsLabel}>Points</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4C29',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  rankBadge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginRight: 18,
    backgroundColor: '#1F1F1F',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E5E5',
  },
  pointsBlock: {
    alignItems: 'flex-end',
    paddingLeft: 12,
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#FF4C29',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  errorText: {
    color: '#FF4C29',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorSubtext: {
    color: '#aaa',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
  },
});
