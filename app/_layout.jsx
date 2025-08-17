import { Stack } from 'expo-router'
import { View } from 'react-native'

export default function _layout() {
  return (
    <Stack
      options={{ headerStyle: { backgroundColor: "blue" } }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
    </Stack>
  )
}
