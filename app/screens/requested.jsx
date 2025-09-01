import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';


const requests = [
    { id: "1", name: "Rahim Uddin", bloodGroup: "A+", location: "Dhaka", urgency: "High" },
    { id: "2", name: "Karim Ahmed", bloodGroup: "B-", location: "Chittagong", urgency: "Medium" },
    { id: "3", name: "Fatema Khatun", bloodGroup: "O+", location: "Sylhet", urgency: "High" },
    { id: "4", name: "Sumon Ali", bloodGroup: "AB+", location: "Khulna", urgency: "Low" },
];

export default function requested() {
    const handleAdd = (name) => {
        Alert.alert("Added", `You selected ${name}'s request.`);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.details}>Blood Group: {item.bloodGroup}</Text>
                <Text style={styles.details}>Location: {item.location}</Text>
                <Text style={[styles.details, { color: item.urgency === "High" ? "#FF4C29" : "#aaa" }]}>
                    Urgency: {item.urgency}
                </Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => handleAdd(item.name)}>
                <Text style={styles.addButtonText}> Add <Icon name="arrow-right" size={15} color="#fff" /></Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Blood Requests</Text>
            <FlatList
                data={requests}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
        textAlign: "center",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#2A2A2A",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
    },
    details: {
        fontSize: 14,
        color: "#ccc",
        marginTop: 5,
    },
    addButton: {
        backgroundColor: "#FF4C29",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
});
