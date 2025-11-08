import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfilePage() {
  const fallbackHistory = [
    { id: 1, name: "John Doe", bloodGroup: "A+", location: "Dhaka Medical College", date: "2024-02-14" },
    { id: 2, name: "Sarah Khan", bloodGroup: "O-", location: "Square Hospital", date: "2023-12-03" },
    { id: 3, name: "Michael Lee", bloodGroup: "B+", location: "Evercare Hospital", date: "2023-09-21" },
    { id: 4, name: "Priya Sharma", bloodGroup: "AB+", location: "Bangabandhu Medical", date: "2023-07-18" },
  ];

  const [user, setUser] = useState({});
  useEffect(() => {
    AsyncStorage.getItem('user')
      .then((value) => {
        setUser(JSON.parse(value));
      }).catch((error) => {
        alert(error);
      })
  }, []);

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

  const history = user?.donationHistory?.length ? user.donationHistory : fallbackHistory;

  return (
    <View style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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
            {user?.donationHistory?.length
              ? `${user.donationHistory.length} recorded donations`
              : "Showing recent community donations"}
          </Text>
        </View>

        {history.length ? (
          history.map((record, index) => (
            <View key={record?.id ?? `history-${index}`} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <View style={styles.historyBadge}>
                  <Text style={styles.historyBadgeText}>{record?.bloodGroup ?? "—"}</Text>
                </View>
                <Text style={styles.historyDate}>{record?.date ?? "—"}</Text>
              </View>
              <Text style={styles.historyName}>{record?.name ?? "Recipient"}</Text>
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
});
