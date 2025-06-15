"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from "react-native"
import { Shield, Lock, Eye, Smartphone, ChevronRight } from "lucide-react-native"
import type { LucideIcon } from 'lucide-react-native'
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

interface PrivacySettings {
  twoFactorAuth: boolean;
  biometricLogin: boolean;
  dataSharing: boolean;
  profileVisibility: boolean;
  activityTracking: boolean;
}

interface SettingItem {
  icon: LucideIcon;
  title: string;
  description: string;
  hasSwitch: boolean;
  switchKey: keyof PrivacySettings;
}

export default function PrivacySecurity() {
  const [settings, setSettings] = useState<PrivacySettings>({
    twoFactorAuth: false,
    biometricLogin: true,
    dataSharing: false,
    profileVisibility: true,
    activityTracking: false,
  })

  const toggleSetting = (key: keyof PrivacySettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const securityItems: SettingItem[] = [
    {
      icon: Lock,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      hasSwitch: true,
      switchKey: "twoFactorAuth",
    },
    {
      icon: Smartphone,
      title: "Biometric Login",
      description: "Use fingerprint or face recognition to sign in",
      hasSwitch: true,
      switchKey: "biometricLogin",
    },
  ]

  const privacyItems: SettingItem[] = [
    {
      icon: Eye,
      title: "Profile Visibility",
      description: "Control who can see your profile information",
      hasSwitch: true,
      switchKey: "profileVisibility",
    },
    {
      icon: Shield,
      title: "Data Sharing",
      description: "Share anonymized data for research purposes",
      hasSwitch: true,
      switchKey: "dataSharing",
    },
    {
      icon: Eye,
      title: "Activity Tracking",
      description: "Allow tracking for personalized recommendations",
      hasSwitch: true,
      switchKey: "activityTracking",
    },
  ]

  const renderSection = (title: string, items: SettingItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <View key={index} style={[styles.settingItem, index === items.length - 1 && styles.lastItem]}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <item.icon size={20} color={Colors.primary[600]} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingDescription}>{item.description}</Text>
              </View>
            </View>
            <View style={styles.settingRight}>
              {item.hasSwitch ? (
                <Switch
                  value={settings[item.switchKey]}
                  onValueChange={() => toggleSetting(item.switchKey)}
                  trackColor={{
                    false: Colors.neutral[300],
                    true: Colors.primary[200],
                  }}
                  thumbColor={settings[item.switchKey] ? Colors.primary[600] : Colors.neutral[400]}
                />
              ) : (
                <ChevronRight size={20} color={Colors.neutral[400]} />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {renderSection("Security", securityItems)}
        {renderSection("Privacy", privacyItems)}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <Shield size={20} color={Colors.primary[600]} />
                </View>
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Download My Data</Text>
                  <Text style={styles.settingDescription}>Get a copy of all your data</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingItem, styles.lastItem]}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.error[50] }]}>
                  <Shield size={20} color={Colors.error[600]} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: Colors.error[600] }]}>Delete Account</Text>
                  <Text style={styles.settingDescription}>Permanently delete your account and data</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    fontWeight: "500",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.neutral[600],
  },
  settingRight: {
    marginLeft: Spacing.sm,
  },
})
