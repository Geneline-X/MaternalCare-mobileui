"use client"

import * as React from "react"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, Shield, Lock, Eye, Smartphone, Key, AlertTriangle } from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"

export default function PrivacySecurity() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    biometricAuth: true,
    sessionTimeout: true,
    loginNotifications: true,
    dataEncryption: true,
    profileVisibility: "private",
    activityTracking: false,
    thirdPartySharing: false,
  })

  const handleToggle = (key: string, value: boolean) => {
    if (key === "twoFactorAuth" && value) {
      Alert.alert(
        "Enable Two-Factor Authentication",
        "This will require you to enter a verification code from your authenticator app each time you sign in. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: () => {
              setSettings({ ...settings, [key]: value })
              // In a real app, you would initiate the 2FA setup process here
              Alert.alert("Success", "Two-factor authentication has been enabled.")
            },
          },
        ],
      )
    } else if (key === "twoFactorAuth" && !value) {
      Alert.alert(
        "Disable Two-Factor Authentication",
        "This will make your account less secure. Are you sure you want to continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            style: "destructive",
            onPress: () => setSettings({ ...settings, [key]: value }),
          },
        ],
      )
    } else {
      setSettings({ ...settings, [key]: value })
    }
  }

  const SecurityItem = ({
    icon,
    title,
    description,
    value,
    onToggle,
    type = "switch",
    danger = false,
  }: {
    icon: React.ReactNode
    title: string
    description: string
    value?: boolean
    onToggle?: () => void
    type?: "switch" | "button"
    danger?: boolean
  }) => (
    <View style={[styles.securityItem, isDarkMode && styles.securityItemDark]}>
      <View style={styles.securityItemLeft}>
        <View style={[styles.securityItemIcon, danger && styles.dangerIcon]}>{icon}</View>
        <View style={styles.securityItemText}>
          <Text
            style={[styles.securityItemTitle, isDarkMode && styles.securityItemTitleDark, danger && styles.dangerText]}
          >
            {title}
          </Text>
          <Text style={[styles.securityItemDescription, isDarkMode && styles.securityItemDescriptionDark]}>
            {description}
          </Text>
        </View>
      </View>
      {type === "switch" && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: Colors.neutral[300], true: danger ? Colors.error[200] : Colors.primary[200] }}
          thumbColor={value ? (danger ? Colors.error[600] : Colors.primary[600]) : Colors.neutral[400]}
        />
      )}
      {type === "button" && (
        <TouchableOpacity style={[styles.actionButton, danger && styles.dangerButton]} onPress={onToggle}>
          <Text style={[styles.actionButtonText, danger && styles.dangerButtonText]}>Configure</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? Colors.white : Colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Authentication Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Authentication</Text>

          <SecurityItem
            icon={<Key size={20} color={settings.twoFactorAuth ? Colors.success[600] : Colors.neutral[600]} />}
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={settings.twoFactorAuth}
            onToggle={() => handleToggle("twoFactorAuth", !settings.twoFactorAuth)}
          />

          <SecurityItem
            icon={<Smartphone size={20} color={settings.biometricAuth ? Colors.success[600] : Colors.neutral[600]} />}
            title="Biometric Authentication"
            description="Use fingerprint or face recognition to unlock the app"
            value={settings.biometricAuth}
            onToggle={() => handleToggle("biometricAuth", !settings.biometricAuth)}
          />

          <SecurityItem
            icon={<Lock size={20} color={settings.sessionTimeout ? Colors.success[600] : Colors.neutral[600]} />}
            title="Auto Session Timeout"
            description="Automatically sign out after 30 minutes of inactivity"
            value={settings.sessionTimeout}
            onToggle={() => handleToggle("sessionTimeout", !settings.sessionTimeout)}
          />
        </View>

        {/* Privacy Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Privacy</Text>

          <SecurityItem
            icon={<Eye size={20} color={Colors.neutral[600]} />}
            title="Profile Visibility"
            description="Control who can see your profile information"
            type="button"
            onToggle={() => Alert.alert("Profile Visibility", "Configure your profile visibility settings")}
          />

          <SecurityItem
            icon={<Shield size={20} color={settings.activityTracking ? Colors.warning[600] : Colors.success[600]} />}
            title="Activity Tracking"
            description="Allow the app to track your usage for analytics"
            value={settings.activityTracking}
            onToggle={() => handleToggle("activityTracking", !settings.activityTracking)}
          />

          <SecurityItem
            icon={
              <AlertTriangle size={20} color={settings.thirdPartySharing ? Colors.error[600] : Colors.success[600]} />
            }
            title="Third-Party Data Sharing"
            description="Share anonymized data with research partners"
            value={settings.thirdPartySharing}
            onToggle={() => handleToggle("thirdPartySharing", !settings.thirdPartySharing)}
            danger
          />
        </View>

        {/* Security Notifications */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Security Notifications</Text>

          <SecurityItem
            icon={<Shield size={20} color={settings.loginNotifications ? Colors.success[600] : Colors.neutral[600]} />}
            title="Login Notifications"
            description="Get notified when someone signs into your account"
            value={settings.loginNotifications}
            onToggle={() => handleToggle("loginNotifications", !settings.loginNotifications)}
          />

          <SecurityItem
            icon={<Lock size={20} color={settings.dataEncryption ? Colors.success[600] : Colors.neutral[600]} />}
            title="Data Encryption"
            description="Encrypt sensitive data stored on your device"
            value={settings.dataEncryption}
            onToggle={() => handleToggle("dataEncryption", !settings.dataEncryption)}
          />
        </View>

        {/* Security Actions */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Security Actions</Text>

          <TouchableOpacity style={[styles.actionItem, isDarkMode && styles.actionItemDark]}>
            <Text style={[styles.actionItemText, isDarkMode && styles.actionItemTextDark]}>View Login History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, isDarkMode && styles.actionItemDark]}>
            <Text style={[styles.actionItemText, isDarkMode && styles.actionItemTextDark]}>Download My Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, isDarkMode && styles.actionItemDark, styles.dangerAction]}>
            <Text style={[styles.actionItemText, styles.dangerText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View style={[styles.infoSection, isDarkMode && styles.infoSectionDark]}>
          <Text style={[styles.infoTitle, isDarkMode && styles.infoTitleDark]}>Security Tips</Text>
          <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>
            • Use a strong, unique password for your account{"\n"}• Enable two-factor authentication for extra security
            {"\n"}• Keep your app updated to the latest version{"\n"}• Don't share your login credentials with anyone
            {"\n"}• Review your privacy settings regularly
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  containerDark: {
    backgroundColor: Colors.neutral[900],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  headerDark: {
    backgroundColor: Colors.neutral[800],
    borderBottomColor: Colors.neutral[700],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  titleDark: {
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  sectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  sectionTitleDark: {
    color: Colors.white,
  },
  securityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  securityItemDark: {
    borderBottomColor: Colors.neutral[700],
  },
  securityItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  securityItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  dangerIcon: {
    backgroundColor: Colors.error[50],
  },
  securityItemText: {
    flex: 1,
  },
  securityItemTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
  },
  securityItemTitleDark: {
    color: Colors.white,
  },
  dangerText: {
    color: Colors.error[600],
  },
  securityItemDescription: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  securityItemDescriptionDark: {
    color: Colors.neutral[400],
  },
  actionButton: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  dangerButton: {
    backgroundColor: Colors.error[50],
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
  },
  dangerButtonText: {
    color: Colors.error[600],
  },
  actionItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  actionItemDark: {
    borderBottomColor: Colors.neutral[700],
  },
  dangerAction: {
    borderBottomColor: Colors.error[200],
  },
  actionItemText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[800],
  },
  actionItemTextDark: {
    color: Colors.white,
  },
  infoSection: {
    backgroundColor: Colors.primary[50],
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  infoSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[700],
    marginBottom: Spacing.sm,
  },
  infoTitleDark: {
    color: Colors.white,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.primary[600],
    lineHeight: 20,
  },
  infoTextDark: {
    color: Colors.neutral[300],
  },
})
