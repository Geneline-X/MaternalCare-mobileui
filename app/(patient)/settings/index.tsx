"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image } from "react-native"
import { useRouter } from "expo-router"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { FontSize } from "../../constants/fontSize"
import { ChevronRight, Bell, Lock, User, HelpCircle, LogOut, Globe, Moon, Shield, Edit } from "lucide-react-native"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { useNotifications } from "../../contexts/NotificationContext"
import { useTheme } from "../../contexts/ThemeContext"

export default function SettingsScreen() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { user } = useUser()
  const { notificationsEnabled, toggleNotifications } = useNotifications()
  const { isDarkMode, toggleTheme } = useTheme()

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut()
            router.replace("/(auth)/sign-in")
          } catch (error) {
            console.error("Error signing out:", error)
          }
        },
      },
    ])
  }

  const handleFeatureNotImplemented = (feature: string) => {
    Alert.alert("Coming Soon", `${feature} feature will be available in a future update.`, [{ text: "OK" }])
  }

  const SettingItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showSwitch = false,
    switchValue,
    onSwitchChange,
  }: {
    icon: any
    title: string
    subtitle?: string
    onPress?: () => void
    showSwitch?: boolean
    switchValue?: boolean
    onSwitchChange?: (value: boolean) => void
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={showSwitch}>
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={Colors.neutral[600]} />
        </View>
        <View style={styles.settingItemText}>
          <Text style={styles.settingItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: Colors.neutral[200], true: Colors.primary[400] }}
          thumbColor={Colors.white}
        />
      ) : (
        <ChevronRight size={20} color={Colors.neutral[400]} />
      )}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.profileAvatar}>
              {user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.profileAvatarImage} />
              ) : (
                <User size={24} color={Colors.primary[600]} />
              )}
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
              <Text style={styles.profileRole}>Patient</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push("../../edit-profile")}>
            <Edit size={16} color={Colors.primary[600]} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={User}
              title="Personal Information"
              subtitle="Update your personal details"
              onPress={() => router.push("/settings/personal-info")}
            />
            <SettingItem
              icon={Lock}
              title="Security"
              subtitle="Password and security settings"
              onPress={() => router.push("/settings/security")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Bell}
              title="Notifications"
              subtitle="Push notifications and alerts"
              showSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={toggleNotifications}
            />
            <SettingItem
              icon={Moon}
              title="Dark Mode"
              subtitle="Switch to dark theme"
              showSwitch
              switchValue={isDarkMode}
              onSwitchChange={toggleTheme}
            />
            <SettingItem
              icon={Globe}
              title="Language"
              subtitle="English"
              onPress={() => router.push("/settings/language")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="Get help with your account"
              onPress={() => router.push("/settings/help-support")}
            />
            <SettingItem
              icon={Shield}
              title="Terms & Privacy"
              subtitle="Read our terms and privacy policy"
              onPress={() => router.push("/settings/terms-privacy")}
            />
          </View>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>MaternalCare v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Fixed logout section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.error[500]} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add padding to prevent overlap with logout button
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.neutral[900],
  },
  profileCard: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    overflow: "hidden",
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  profileRole: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.primary[600],
    marginTop: 2,
  },
  editProfileButton: {
    backgroundColor: Colors.primary[50],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.neutral[500],
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  sectionContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: FontSize.md,
    color: Colors.neutral[900],
  },
  settingItemSubtitle: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  logoutSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: 100, // Account for tab bar
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    backgroundColor: Colors.error[50],
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  signOutText: {
    fontSize: FontSize.md,
    color: Colors.error[500],
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
  versionInfo: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  versionText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
  },
})
