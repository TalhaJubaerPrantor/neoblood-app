import { router } from 'expo-router';
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ImageBackground,
    Image
} from 'react-native';

export default function App({ navigation }) {
    return (


        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#ff0000ff" />
            {/* Logo */}
            <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
            />

            {/* Button */}
            <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={() => router.push('/(auth)/signup')}
            >
                <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
                Connecting Donors. Saving Lives.
            </Text>
            
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 1)', // optional overlay for readability
    },
    logo: {
        width: 200,
        height: 40,
        resizeMode: 'contain',
    },
    subtitle: {
        fontSize: 16,
        color: '#bbb',
        textAlign: 'center',
        marginTop: 20,
    },
    buttonPrimary: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 12,
        borderRadius: 20,
        marginTop: 20,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
    },
});
