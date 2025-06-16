import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"

export default function DoctorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.neutral[500],
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral[100],
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          paddingTop: 8,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter-Medium",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: "Patients",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="health-monitoring"
        options={{
          title: "Health",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* All other screens are hidden but accessible via navigation */}
      <Tabs.Screen name="patient-details" options={{ href: null }} />
      <Tabs.Screen name="dynamic-form" options={{ href: null }} />
      <Tabs.Screen name="report-analytics" options={{ href: null }} />
      <Tabs.Screen name="schedule-visit" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="add-patient" options={{ href: null }} />
      <Tabs.Screen name="add-pregnancy" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="settings/change-password" options={{ href: null }} />
      <Tabs.Screen name="settings/connected-devices" options={{ href: null }} />
      <Tabs.Screen name="settings/consent-management" options={{ href: null }} />
      <Tabs.Screen name="settings/contact-support" options={{ href: null }} />
      <Tabs.Screen name="settings/data-sharing" options={{ href: null }} />
      <Tabs.Screen name="settings/edit-profile" options={{ href: null }} />
      <Tabs.Screen name="settings/language" options={{ href: null }} />
      <Tabs.Screen name="settings/personal-info" options={{ href: null }} />
      <Tabs.Screen name="settings/privacy-security" options={{ href: null }} />
      <Tabs.Screen name="settings/terms-privacy" options={{ href: null }} />
    </Tabs>
  )
}
