import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { FontAwesome } from '@expo/vector-icons';

const mockDonors = [
    { 
        id: "1", 
        name: "Rahim Uddin", 
        bloodGroup: "A+", 
        location: "Dhanmondi",
        district: "Dhaka", 
        phone: "01712345678",
        age: 28,
        lastDonation: "2024-09-15",
        totalDonations: 12,
        availability: "Available",
        weight: 68,
        healthStatus: "Excellent"
    },
    { 
        id: "2", 
        name: "Karim Ahmed", 
        bloodGroup: "B-", 
        location: "Agrabad",
        district: "Chittagong", 
        phone: "01823456789",
        age: 32,
        lastDonation: "2024-08-20",
        totalDonations: 8,
        availability: "Available",
        weight: 72,
        healthStatus: "Good"
    },
    { 
        id: "3", 
        name: "Fatema Khatun", 
        bloodGroup: "O+", 
        location: "Zindabazar",
        district: "Sylhet", 
        phone: "01934567890",
        age: 26,
        lastDonation: "2024-10-05",
        totalDonations: 5,
        availability: "Available",
        weight: 58,
        healthStatus: "Excellent"
    },
    { 
        id: "4", 
        name: "Sumon Ali", 
        bloodGroup: "AB+", 
        location: "Sonadanga",
        district: "Khulna", 
        phone: "01645678901",
        age: 35,
        lastDonation: "2024-07-12",
        totalDonations: 15,
        availability: "Available",
        weight: 75,
        healthStatus: "Good"
    },
    { 
        id: "5", 
        name: "Nasrin Akter", 
        bloodGroup: "A-", 
        location: "Boalia",
        district: "Rajshahi", 
        phone: "01756789012",
        age: 29,
        lastDonation: "2024-06-18",
        totalDonations: 7,
        availability: "Available",
        weight: 62,
        healthStatus: "Excellent"
    },
    { 
        id: "6", 
        name: "Habibur Rahman", 
        bloodGroup: "O-", 
        location: "Uttara",
        district: "Dhaka", 
        phone: "01867890123",
        age: 30,
        lastDonation: "2024-05-22",
        totalDonations: 20,
        availability: "Available",
        weight: 70,
        healthStatus: "Excellent"
    },
    { 
        id: "7", 
        name: "Ayesha Siddika", 
        bloodGroup: "A+", 
        location: "Gulshan",
        district: "Dhaka", 
        phone: "01978901234",
        age: 27,
        lastDonation: "2024-09-28",
        totalDonations: 6,
        availability: "Available",
        weight: 60,
        healthStatus: "Good"
    },
    { 
        id: "8", 
        name: "Tanvir Hossain", 
        bloodGroup: "B+", 
        location: "Mirpur",
        district: "Dhaka", 
        phone: "01689012345",
        age: 31,
        lastDonation: "2024-08-10",
        totalDonations: 10,
        availability: "Available",
        weight: 78,
        healthStatus: "Excellent"
    },
    { 
        id: "9", 
        name: "Jahangir Alam", 
        bloodGroup: "O+", 
        location: "Motijheel",
        district: "Dhaka", 
        phone: "01590123456",
        age: 33,
        lastDonation: "2024-07-25",
        totalDonations: 18,
        availability: "Available",
        weight: 73,
        healthStatus: "Good"
    },
    { 
        id: "10", 
        name: "Sharmin Akter", 
        bloodGroup: "AB-", 
        location: "Patenga",
        district: "Chittagong", 
        phone: "01401234567",
        age: 28,
        lastDonation: "2024-09-05",
        totalDonations: 4,
        availability: "Available",
        weight: 59,
        healthStatus: "Excellent"
    },
];

export default function FindDonors() {
    const [donors, setDonors] = useState(mockDonors);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBloodGroup, setFilterBloodGroup] = useState("All");
    const [filterDistrict, setFilterDistrict] = useState("All");
    const [loading, setLoading] = useState(false);

    const bloodGroups = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const districts = ["All", "Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi", "Barisal", "Rangpur", "Mymensingh"];

    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const handleContactDonor = (donor) => {
        Alert.alert(
            "Contact Donor",
            `Connect with ${donor.name}?\n\n` +
            `Blood Group: ${donor.bloodGroup}\n` +
            `Location: ${donor.location}, ${donor.district}\n` +
            `Total Donations: ${donor.totalDonations}\n` +
            `Contact: ${donor.phone}`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Call Now", 
                    onPress: () => Alert.alert("Calling...", `Contacting ${donor.phone}`)
                },
                { 
                    text: "Send Request", 
                    onPress: () => {
                        Alert.alert("Success!", `Blood donation request sent to ${donor.name}. They will contact you soon.`);
                    }
                }
            ]
        );
    };

    const handleViewDonorDetails = (donor) => {
        Alert.alert(
            `${donor.name}'s Profile`,
            `🩸 Blood Group: ${donor.bloodGroup}\n` +
            `📍 Location: ${donor.location}, ${donor.district}\n` +
            `📞 Phone: ${donor.phone}\n` +
            `👤 Age: ${donor.age} years\n` +
            `⚖️ Weight: ${donor.weight} kg\n` +
            `💪 Health: ${donor.healthStatus}\n` +
            `📅 Last Donation: ${donor.lastDonation}\n` +
            `🎖️ Total Donations: ${donor.totalDonations}\n` +
            `✅ Status: ${donor.availability}`
        );
    };

    const filteredDonors = donors.filter(donor => {
        const matchesSearch = donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            donor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            donor.district.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBloodGroup = filterBloodGroup === "All" || donor.bloodGroup === filterBloodGroup;
        const matchesDistrict = filterDistrict === "All" || donor.district === filterDistrict;
        return matchesSearch && matchesBloodGroup && matchesDistrict;
    });

    const getAvailabilityColor = (availability) => {
        return availability === "Available" ? "#43A047" : "#999";
    };

    const getAvailabilityBgColor = (availability) => {
        return availability === "Available" ? "#E8F5E9" : "#F5F5F5";
    };

    const getDonationBadgeColor = (total) => {
        if (total >= 15) return "#E53935"; // Hero Donor
        if (total >= 8) return "#FB8C00";  // Regular Donor
        return "#43A047"; // New Donor
    };

    const getDonationBadgeText = (total) => {
        if (total >= 15) return "🏆 Hero";
        if (total >= 8) return "⭐ Regular";
        return "🌟 Active";
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.nameSection}>
                    <Text style={styles.name}>👤 {item.name}</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.donorBadge, { backgroundColor: getDonationBadgeColor(item.totalDonations) }]}>
                            <Text style={styles.donorBadgeText}>
                                {getDonationBadgeText(item.totalDonations)}
                            </Text>
                        </View>
                        <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityBgColor(item.availability) }]}>
                            <Text style={[styles.availabilityText, { color: getAvailabilityColor(item.availability) }]}>
                                ● {item.availability}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.bloodGroupBadge}>
                    <Text style={styles.bloodGroupText}>{item.bloodGroup}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{item.location}, {item.district}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>👤</Text>
                    <Text style={styles.detailText}>{item.age} years old • {item.weight} kg</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>💪</Text>
                    <Text style={styles.detailText}>Health: {item.healthStatus}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>🎖️</Text>
                    <Text style={styles.detailText}>Donated {item.totalDonations} times</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <Text style={styles.detailText}>Last donation: {item.lastDonation}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity 
                    style={styles.detailsButton} 
                    onPress={() => handleViewDonorDetails(item)}
                >
                    <Text style={styles.detailsButtonText}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.contactButton} 
                    onPress={() => handleContactDonor(item)}
                >
                    <Text style={styles.contactButtonText}>Contact</Text>
                    <FontAwesome name="phone" size={14} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.safeContainer}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.headerSection}>
                    <Text style={styles.title}>🔍 Find Blood Donors</Text>
                    <Text style={styles.subtitle}>Search for donors with the blood group you need</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, location, or district..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filters */}
                <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Blood Group:</Text>
                            {bloodGroups.map(group => (
                                <TouchableOpacity
                                    key={group}
                                    style={[
                                        styles.filterChip,
                                        filterBloodGroup === group && styles.filterChipActive
                                    ]}
                                    onPress={() => setFilterBloodGroup(group)}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        filterBloodGroup === group && styles.filterChipTextActive
                                    ]}>
                                        {group}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.filterSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>District:</Text>
                            {districts.map(district => (
                                <TouchableOpacity
                                    key={district}
                                    style={[
                                        styles.filterChip,
                                        filterDistrict === district && styles.filterChipActive
                                    ]}
                                    onPress={() => setFilterDistrict(district)}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        filterDistrict === district && styles.filterChipTextActive
                                    ]}>
                                        {district}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Results Count */}
                <Text style={styles.resultCount}>
                    {filteredDonors.length} {filteredDonors.length === 1 ? 'Donor' : 'Donors'} Found
                </Text>

                {/* List */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E53935" />
                        <Text style={styles.loadingText}>Loading donors...</Text>
                    </View>
                ) : filteredDonors.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyText}>No donors found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your filters or search criteria</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredDonors}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    headerSection: {
        backgroundColor: "#E53935",
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 13,
        color: "#FFEBEE",
        textAlign: "center",
    },
    searchSection: {
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    searchInput: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 15,
        color: "#333",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    filterSection: {
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    filterGroup: {
        flexDirection: "row",
        alignItems: "center",
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginRight: 10,
    },
    filterChip: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    filterChipActive: {
        backgroundColor: "#E53935",
        borderColor: "#E53935",
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
    filterChipTextActive: {
        color: "#FFFFFF",
    },
    resultCount: {
        fontSize: 14,
        color: "#666",
        fontWeight: "600",
        paddingHorizontal: 20,
        marginTop: 15,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: 15,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 5,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    nameSection: {
        flex: 1,
        marginRight: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    donorBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    donorBadgeText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    availabilityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    availabilityText: {
        fontSize: 11,
        fontWeight: "700",
    },
    bloodGroupBadge: {
        backgroundColor: "#E53935",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 60,
        alignItems: "center",
    },
    bloodGroupText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "800",
    },
    cardBody: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    detailIcon: {
        fontSize: 16,
        marginRight: 10,
        width: 24,
    },
    detailText: {
        fontSize: 14,
        color: "#555",
        flex: 1,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 8,
    },
    detailsButton: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    detailsButtonText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "600",
    },
    contactButton: {
        flex: 1,
        backgroundColor: "#43A047",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        shadowColor: "#43A047",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    contactButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
});
