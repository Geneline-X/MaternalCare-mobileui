import { Stack } from "expo-router"
import { Colors } from "../../constants/colors"

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTintColor: Colors.neutral[800],
        headerTitleStyle: {
          fontFamily: "Inter-SemiBold",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="edit-profile" options={{ title: "Edit Profile" }} />
      <Stack.Screen name="personal-info" options={{ title: "Personal Information" }} />
      <Stack.Screen name="change-password" options={{ title: "Change Password" }} />
      <Stack.Screen name="privacy-security" options={{ title: "Privacy & Security" }} />
      <Stack.Screen name="language" options={{ title: "Language" }} />
      <Stack.Screen name="contact-support" options={{ title: "Contact Support" }} />
      <Stack.Screen name="terms-privacy" options={{ title: "Terms & Privacy" }} />
    </Stack>
  )
}
