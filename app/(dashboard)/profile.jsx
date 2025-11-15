import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiUrl } from "../../config/api";

export default function ProfilePage() {
  const [user, setUser] = useState({});
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    loadUserData();
    fetchUserFromBackend();
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchDonationHistory();
    }
  }, [user?._id]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.warn('Error loading user data from storage:', error);
    }
  };

  const fetchUserFromBackend = async () => {
    try {
      // First get user ID from storage
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userData);
      if (!parsedUser._id) {
        setLoading(false);
        return;
      }

      // Fetch fresh user data from backend
      const response = await fetch(apiUrl(`users/${parsedUser._id}`));
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Non-JSON response:', text.substring(0, 200));
        // If endpoint doesn't exist, use stored user data
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.status === 200 && data.user) {
        // Update user with fresh data from backend
        const updatedUser = data.user;
        setUser(updatedUser);
        // Update AsyncStorage with fresh data
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      } else if (Array.isArray(data)) {
        // If API returns array, find the current user
        const foundUser = data.find(u => u._id === parsedUser._id);
        if (foundUser) {
          setUser(foundUser);
          await AsyncStorage.setItem('user', JSON.stringify(foundUser));
        }
      } else if (data._id) {
        // If API returns user object directly
        setUser(data);
        await AsyncStorage.setItem('user', JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Error fetching user from backend:', error);
      // Continue with stored user data if backend fetch fails
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationHistory = async () => {
    if (!user?._id) return;

    setLoadingHistory(true);
    try {
      const response = await fetch(apiUrl(`donation-history/${user._id}`));
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Non-JSON response for donation history:', text.substring(0, 200));
        setDonationHistory([]);
        setLoadingHistory(false);
        return;
      }

      const data = await response.json();
      
      if (data.status === 200) {
        setDonationHistory(data.donationHistory || []);
        
        // Update user stats if provided
        if (data.totalDonations !== undefined || data.points !== undefined || data.lastDonation !== undefined) {
          setUser(prev => ({
            ...prev,
            totalDonations: data.totalDonations ?? prev.totalDonations,
            points: data.points ?? prev.points,
            lastDonation: data.lastDonation ?? prev.lastDonation
          }));
        }
      } else {
        console.warn('Failed to fetch donation history:', data.message);
        setDonationHistory([]);
      }
    } catch (error) {
      console.warn('Error fetching donation history:', error);
      setDonationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserFromBackend(),
      fetchDonationHistory()
    ]);
    setRefreshing(false);
  };

  const initials = useMemo(() => {
    if (!user?.name) return "NB";
    const parts = user.name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase() || "NB";
  }, [user?.name]);

  const stats = useMemo(() => ([
    {
      icon: "water-outline",
      label: "Blood Group",
      value: user?.bloodGroup ?? "—",
    },
    {
      icon: "calendar-outline",
      label: "Age",
      value: user?.age ? `${user.age} yrs` : "—",
    },
    {
      icon: "heart-outline",
      label: "Donations",
      value: user?.totalDonations ?? 0,
    },
    {
      icon: "star-outline",
      label: "Points",
      value: user?.points ?? 0,
    },
  ]), [user]);

  // History is already sorted by backend, just ensure it's an array
  const history = useMemo(() => {
    if (!Array.isArray(donationHistory)) {
      return [];
    }
    return donationHistory;
  }, [donationHistory]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
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

  if (loading) {
    return (
      <View style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4C29" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeContainer}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            tintColor="#FF4C29"
            colors={["#FF4C29"]}
          />
        }
      >
        <View style={styles.profileCard}>
          <View style={styles.initialsCircle}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name ?? "NeoBlood Hero"}</Text>
          <Text style={styles.userEmail}>{user?.email ?? "user@neoblood.app"}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color="#FF4C29" />
            <Text style={styles.userLocation}>{user?.address ?? "Add your address"}</Text>
          </View>
        </View>

        <View style={styles.statGrid}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={styles.iconWrapper}>
                <Ionicons name={item.icon} size={20} color="#FF4C29" />
              </View>
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Donation History</Text>
          <Text style={styles.sectionSubtitle}>
            {loadingHistory 
              ? "Loading donation history..."
              : history.length
              ? `${history.length} recorded donation${history.length === 1 ? '' : 's'}`
              : "No donations recorded yet"}
          </Text>
        </View>

        {loadingHistory ? (
          <View style={styles.loadingHistoryContainer}>
            <ActivityIndicator size="small" color="#FF4C29" />
            <Text style={styles.loadingHistoryText}>Loading donation history...</Text>
          </View>
        ) : history.length > 0 ? (
          history.map((record, index) => (
            <View key={record?._id ?? `history-${index}`} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>{record?.bloodGroup ?? "—"}</Text>
                </View>
                <Text style={styles.historyDate}>
                  {formatDate(record?.date)}
                </Text>
              </View>
              <Text style={styles.historyName}>
                {record?.name ?? "Recipient"}
              </Text>
              {record?.recipient && (
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientLabel}>Recipient Details:</Text>
                  <Text style={styles.recipientText}>
                    {record.recipient.name}
                    {record.recipient.bloodGroup && ` • ${record.recipient.bloodGroup}`}
                  </Text>
                  {record.recipient.location && (
                    <Text style={styles.recipientLocation}>{record.recipient.location}</Text>
                  )}
                </View>
              )}
              {record?.location && (
                <View style={styles.historyMetaRow}>
                  <Ionicons name="location-outline" size={14} color="#FF4C29" />
                  <Text style={styles.historyLocation}>{record.location}</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="water-outline" size={40} color="#B0B0B0" />
            <Text style={styles.emptyTitle}>No donations yet</Text>
            <Text style={styles.emptySubtitle}>
              Once you start donating, your impact will be tracked here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  container: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#333",
    borderRadius: 20,
    paddingVertical: 26,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#3D3D3D",
  },
  initialsCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1F1F1F",
    borderWidth: 3,
    borderColor: "#FF4C29",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FF4C29",
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    color: "#C6C6C6",
    marginTop: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  userLocation: {
    fontSize: 13,
    color: "#FFFFFF",
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexBasis: "48%",
    backgroundColor: "#333",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3D3D3D",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 4,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#1F1F1F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: "#C6C6C6",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 6,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#C6C6C6",
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: "#333",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#3D3D3D",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#1F1F1F",
  },
  historyBadgeText: {
    color: "#FF4C29",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  historyDate: {
    color: "#C6C6C6",
    fontSize: 12,
  },
  historyName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  historyMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyLocation: {
    color: "#C6C6C6",
    fontSize: 13,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#3D3D3D",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "#C6C6C6",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
  },
  loadingText: {
    color: "#C6C6C6",
    fontSize: 14,
    marginTop: 12,
  },
  loadingHistoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  loadingHistoryText: {
    color: "#C6C6C6",
    fontSize: 14,
  },
  recipientInfo: {
    marginTop: 8,
    marginBottom: 6,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: "#1F1F1F",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF4C29",
  },
  recipientLabel: {
    color: "#C6C6C6",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recipientText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  recipientLocation: {
    color: "#C6C6C6",
    fontSize: 12,
    marginTop: 2,
  },
});
