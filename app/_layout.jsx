import { Stack } from 'expo-router'

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      <Stack.Screen name="screens/donate" options={{ title: 'Donate Blood', headerStyle: { backgroundColor: "#3c3c3c" }, headerTintColor: "#fff" }} />
      <Stack.Screen name="screens/post" options={{ title: 'Post', headerStyle: { backgroundColor: "#3c3c3c" }, headerTintColor: "#fff" }} />
      <Stack.Screen name="screens/donor" options={{ title: 'Donors', headerStyle: { backgroundColor: "#3c3c3c" }, headerTintColor: "#fff" }} />
      <Stack.Screen name="screens/circle" options={{ title: 'Circle', headerStyle: { backgroundColor: "#3c3c3c" }, headerTintColor: "#fff" }} />
    </Stack>
  )
}