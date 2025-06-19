import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function DoctorLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: "white",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "ios" ? 80 + insets.bottom : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 2,
        },
        headerShown: false,
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
        name="dynamic-form"
        options={{
          title: "Forms",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="consultation-rooms"
        options={{
          title: "Consultations",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={26} color={color} />
          ),
        }}
      />
      {/* All other screens are hidden from tabs but still accessible via navigation */}
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="add-patient" options={{ href: null }} />
      <Tabs.Screen name="add-pregnancy" options={{ href: null }} />
      <Tabs.Screen name="health-monitoring" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="patient-details" options={{ href: null }} />
      <Tabs.Screen name="report-analytics" options={{ href: null }} />
      <Tabs.Screen name="schedule-visit" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
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
      <Tabs.Screen name="create" options={{ href: null }} />
      <Tabs.Screen name="appointments" options={{ href: null }} />
    </Tabs>
  )
}
