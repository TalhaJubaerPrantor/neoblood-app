import { Stack } from 'expo-router'
import { View } from 'react-native'

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      <Stack.Screen name="screens/donate" options={{ title: 'Donate Blood', headerStyle:{backgroundColor:"#3c3c3c"},headerTintColor:"#fff" }} />
      <Stack.Screen name="screens/requests" options={{ title: 'Requests', headerStyle:{backgroundColor:"#3c3c3c"},headerTintColor:"#fff" }} />
      <Stack.Screen name="screens/insight" options={{ title: 'Insight', headerStyle:{backgroundColor:"#3c3c3c"},headerTintColor:"#fff" }} />
    </Stack>
  )
}
