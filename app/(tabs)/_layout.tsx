"use client"

import { Redirect, Tabs } from "expo-router"
import { Home, Users, ClipboardList, MessageCircle, Settings } from "lucide-react-native"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { Colors } from "../../constants/colors"

export default function TabLayout() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isSignedIn) {
    return <Redirect href="/(auth)" />
  }

  // For now, we'll assume all users are doctors since we don't have role management set up
  // In a real app, you'd store user roles in Clerk's public metadata
  const isDoctor = true

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.neutral[400],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral[200],
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter-Medium",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />

      {isDoctor && (
        <Tabs.Screen
          name="patients"
          options={{
            title: "Patients",
            tabBarIcon: ({ size, color }) => <Users size={size} color={color} />,
          }}
        />
      )}

      {isDoctor && (
        <Tabs.Screen
          name="forms"
          options={{
            title: "Forms",
            tabBarIcon: ({ size, color }) => <ClipboardList size={size} color={color} />,
          }}
        />
      )}

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ size, color }) => <MessageCircle size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ size, color }) => <MessageCircle size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
