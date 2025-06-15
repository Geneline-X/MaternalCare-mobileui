"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from "react-native"
import { useRouter } from "@/utils/navigation"
import { paths } from "@/utils/navigation"
import { useAuth } from "../../contexts/AuthContext"
import {
  User,
  Edit3,
  Bell,
  Moon,
  Globe,
  Shield,
  Lock,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

export default function Profile() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => logout(),
      },
    ])
  }

  // Define the type for settings items
  type SettingsItem = {
    icon: any; // Using 'any' for Lucide icons to simplify
    title: string;
    subtitle?: string;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    onPress?: () => void;
  };

  const settingsItems: { section: string; items: SettingsItem[] }[] = [
    {
      section: "Account",
      items: [
        {
          icon: User,
          title: "Personal Information",
          onPress: () => router.push({
            pathname: "/settings/personal-info",
            params: { from: 'profile' }
          } as any),
        },
        {
          icon: Lock,
          title: "Change Password",
          onPress: () => router.push({
            pathname: "/settings/change-password",
            params: { from: 'profile' }
          } as any),
        },
        {
          icon: Shield,
          title: "Privacy & Security",
          onPress: () => router.push({
            pathname: "/settings/privacy-security",
            params: { from: 'profile' }
          } as any),
        },
      ],
    },
    {
      section: "Preferences",
      items: [
        {
          icon: Bell,
          title: "Notifications",
          hasSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: setNotificationsEnabled,
        },
        {
          icon: Moon,
          title: "Dark Mode",
          hasSwitch: true,
          switchValue: darkModeEnabled,
          onSwitchChange: setDarkModeEnabled,
        },
        {
          icon: Globe,
          title: "Language",
          subtitle: "English",
          onPress: () => router.push({
            pathname: "/settings/language",
            params: { from: 'profile' }
          } as any),
        },
      ],
    },
    {
      section: "Support",
      items: [
        {
          icon: HelpCircle,
          title: "Contact Support",
          onPress: () => router.push({
            pathname: "/settings/contact-support",
            params: { from: 'profile' }
          } as any),
        },
        {
          icon: FileText,
          title: "Terms & Privacy",
          onPress: () => router.push({
            pathname: "/settings/terms-privacy",
            params: { from: 'profile' }
          } as any),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user?.avatar ||
                "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "User Name"}</Text>
            <Text style={styles.profileEmail}>{user?.email || "user@example.com"}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => router.push(paths.settings.editProfile as any)}>
            <Edit3 size={20} color={Colors.primary[600]} />
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
        {settingsItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[styles.settingItem, itemIndex === section.items.length - 1 && styles.lastItem]}
                  onPress={item.onPress}
                  disabled={item.hasSwitch}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <item.icon size={20} color={Colors.primary[600]} />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
                    </View>
                  </View>
                  <View style={styles.settingRight}>
                    {item.hasSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{
                          false: Colors.neutral[300],
                          true: Colors.primary[200],
                        }}
                        thumbColor={item.switchValue ? Colors.primary[600] : Colors.neutral[400]}
                      />
                    ) : (
                      <ChevronRight size={20} color={Colors.neutral[400]} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error[600]} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for sign out button
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
    textAlign: "center",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  editButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[800],
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  settingRight: {
    marginLeft: Spacing.sm,
  },
  signOutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingBottom: 90, // Space above tab bar
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.error[50],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  signOutText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.error[600],
    marginLeft: Spacing.sm,
  },
})
