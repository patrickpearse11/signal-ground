import { Tabs } from 'expo-router'
import { colors } from '@/constants/theme'

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="brief"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabs.active,
        tabBarInactiveTintColor: colors.tabs.inactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="brief"
        options={{
          title: 'Brief',
          tabBarIcon: ({ color }) => (
            // Placeholder emoji icon — replace with proper icons in polish phase
            <TabIcon emoji="📋" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="signal"
        options={{
          title: 'Signal',
          tabBarIcon: ({ color }) => <TabIcon emoji="📡" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ground"
        options={{
          title: 'Ground',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏛️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: 'Impact',
          tabBarIcon: ({ color }) => <TabIcon emoji="⚡" color={color} />,
        }}
      />
    </Tabs>
  )
}

// Temporary emoji tab icon — swap for react-native-vector-icons in polish phase
function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native')
  return <Text style={{ fontSize: 20, opacity: color === colors.tabs.active ? 1 : 0.5 }}>{emoji}</Text>
}
