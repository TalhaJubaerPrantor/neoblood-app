import { Tabs } from "expo-router";
import Icon from 'react-native-vector-icons/FontAwesome';


function BotomNav() {

  return (
    <Tabs
      screenOptions={{
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
      }}

    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({color,size}) => <Icon name="user" size={size} color={color} /> }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard', tabBarIcon: ({color,size}) => <Icon name="trophy" size={size} color={color} /> }} />
      <Tabs.Screen name="find" options={{ title: 'Find', tabBarIcon: ({color,size}) => <Icon name="search" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({color,size}) => <Icon name="gear" size={size} color={color} /> }} />
    </Tabs>
  )
}

export default BotomNav;
{/* <i class="fa-solid fa-ranking-star"></i> */ }