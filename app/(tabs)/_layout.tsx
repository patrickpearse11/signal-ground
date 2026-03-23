import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
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
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="signal"
        options={{
          title: 'Signal',
          tabBarIcon: ({ color, size }) => <Ionicons name="radio-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reps"
        options={{
          title: 'Reps',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ground"
        options={{
          title: 'Ground',
          tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="impact"
        options={{
          title: 'Impact',
          tabBarIcon: ({ color, size }) => <Ionicons name="flash-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
