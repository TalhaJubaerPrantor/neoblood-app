import { Stack } from "expo-router";

export default function _layout() {
  return (
    <Stack screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',   // Dark background
          borderTopWidth: 2,            // Thickness of the border
          borderTopColor: '#FF4C29',    // Border color
          height: 60,                    // Tab bar height
          paddingTop: 5,
        },
        tabBarActiveTintColor: '#FF4C29',
        tabBarInactiveTintColor: 'gray',
      }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
)
}
