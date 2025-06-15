"use client"

import React from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  Modal,
  TextInput,
} from "react-native"
import {
  User,
  Lock,
  Shield,
  Bell,
  Globe,
  Heart,
  LogOut,
  ChevronRight,
  Moon,
  Smartphone,
  Mail,
  X,
  Save,
} from "lucide-react-native"
import { useUser, useClerk } from "@clerk/clerk-expo"
import { useRouter } from "expo-router"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

export default function Settings() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [notifications, setNotifications] = React.useState(true)
  const [darkMode, setDarkMode] = React.useState(false)

  // Modal states
  const [profileModalVisible, setProfileModalVisible] = React.useState(false)
  const [passwordModalVisible, setPasswordModalVisible] = React.useState(false)
  const [privacyModalVisible, setPrivacyModalVisible] = React.useState(false)
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false)
  const [dataModalVisible, setDataModalVisible] = React.useState(false)
  const [devicesModalVisible, setDevicesModalVisible] = React.useState(false)
  const [consentModalVisible, setConsentModalVisible] = React.useState(false)
  const [supportModalVisible, setSupportModalVisible] = React.useState(false)
  const [termsModalVisible, setTermsModalVisible] = React.useState(false)

  // Form states
  const [firstName, setFirstName] = React.useState(user?.firstName || "")
  const [lastName, setLastName] = React.useState(user?.lastName || "")
  const [email, setEmail] = React.useState(user?.primaryEmailAddress?.emailAddress || "")
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [selectedLanguage, setSelectedLanguage] = React.useState("English")

  const languages = ["English", "Spanish", "French", "German", "Italian", "Portuguese"]

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Starting sign out process...")
            await signOut()
            console.log("Sign out successful, navigating to auth...")
            // Use replace to prevent going back
            router.replace("/(auth)/sign-in")
          } catch (error) {
            console.error("Sign out error:", error)
            Alert.alert("Error", "Failed to sign out. Please try again.")
          }
        },
      },
    ])
  }

  const handleSaveProfile = async () => {
    try {
      await user?.update({
        firstName,
        lastName,
      })
      Alert.alert("Success", "Profile updated successfully")
      setProfileModalVisible(false)
    } catch (error) {
      Alert.alert("Error", "Failed to update profile")
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long")
      return
    }

    try {
      await user?.updatePassword({
        currentPassword,
        newPassword,
      })
      Alert.alert("Success", "Password changed successfully")
      setPasswordModalVisible(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      Alert.alert("Error", "Failed to change password")
    }
  }

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  )

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    showChevron = true,
  }: {
    icon: React.ReactNode
    title: string
    subtitle?: string
    onPress?: () => void
    rightElement?: React.ReactNode
    showChevron?: boolean
  }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsItemIcon}>{icon}</View>
        <View style={styles.settingsItemText}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement}
        {showChevron && onPress && <ChevronRight size={16} color={Colors.neutral[400]} />}
      </View>
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container}>
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
            <Text style={styles.profileRole}>Healthcare Provider</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editProfileButton} onPress={() => setProfileModalVisible(true)}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <SettingsSection title="Account">
        <SettingsItem
          icon={<User size={20} color={Colors.neutral[600]} />}
          title="Personal Information"
          subtitle="Update your personal details"
          onPress={() => setProfileModalVisible(true)}
        />
        <SettingsItem
          icon={<Lock size={20} color={Colors.neutral[600]} />}
          title="Change Password"
          subtitle="Update your password"
          onPress={() => setPasswordModalVisible(true)}
        />
        <SettingsItem
          icon={<Shield size={20} color={Colors.neutral[600]} />}
          title="Privacy & Security"
          subtitle="Manage your privacy settings"
          onPress={() => setPrivacyModalVisible(true)}
        />
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsItem
          icon={<Bell size={20} color={Colors.neutral[600]} />}
          title="Notifications"
          subtitle="Push notifications and alerts"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[200] }}
              thumbColor={notifications ? Colors.primary[600] : Colors.neutral[400]}
            />
          }
          showChevron={false}
        />
        <SettingsItem
          icon={<Moon size={20} color={Colors.neutral[600]} />}
          title="Dark Mode"
          subtitle="Switch to dark theme"
          rightElement={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.neutral[300], true: Colors.primary[200] }}
              thumbColor={darkMode ? Colors.primary[600] : Colors.neutral[400]}
            />
          }
          showChevron={false}
        />
        <SettingsItem
          icon={<Globe size={20} color={Colors.neutral[600]} />}
          title="Language"
          subtitle={selectedLanguage}
          onPress={() => setLanguageModalVisible(true)}
        />
      </SettingsSection>

      <SettingsSection title="Health Data">
        <SettingsItem
          icon={<Heart size={20} color={Colors.neutral[600]} />}
          title="Data Sharing"
          subtitle="Manage data sharing preferences"
          onPress={() => setDataModalVisible(true)}
        />
        <SettingsItem
          icon={<Smartphone size={20} color={Colors.neutral[600]} />}
          title="Connected Devices"
          subtitle="Manage connected health devices"
          onPress={() => setDevicesModalVisible(true)}
        />
        <SettingsItem
          icon={<Mail size={20} color={Colors.neutral[600]} />}
          title="Consent Management"
          subtitle="View and manage consent forms"
          onPress={() => setConsentModalVisible(true)}
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsItem
          icon={<Mail size={20} color={Colors.neutral[600]} />}
          title="Contact Support"
          subtitle="Get help with your account"
          onPress={() => setSupportModalVisible(true)}
        />
        <SettingsItem
          icon={<Shield size={20} color={Colors.neutral[600]} />}
          title="Terms & Privacy"
          subtitle="Read our terms and privacy policy"
          onPress={() => setTermsModalVisible(true)}
        />
      </SettingsSection>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error[600]} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>MaternalCare v1.0.0</Text>
      </View>

      {/* Profile Modal */}
      <Modal visible={profileModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
              <X size={24} color={Colors.neutral[600]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Save size={24} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal visible={passwordModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
              <X size={24} color={Colors.neutral[600]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={handleChangePassword}>
              <Save size={24} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={languageModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
              <X size={24} color={Colors.neutral[600]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Language</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[styles.languageItem, selectedLanguage === language && styles.selectedLanguageItem]}
                onPress={() => {
                  setSelectedLanguage(language)
                  setLanguageModalVisible(false)
                }}
              >
                <Text style={[styles.languageText, selectedLanguage === language && styles.selectedLanguageText]}>
                  {language}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Other modals with basic content */}
      <Modal visible={privacyModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
              <X size={24} color={Colors.neutral[600]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Privacy & Security</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              Manage your privacy and security settings. This includes data encryption, access controls, and privacy
              preferences for your medical information.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={supportModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSupportModalVisible(false)}>
              <X size={24} color={Colors.neutral[600]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              Need help? Contact our support team:
              {"\n\n"}
              Email: support@maternalcare.com
              {"\n"}
              Phone: 1-800-MATERNAL
              {"\n"}
              Hours: Monday-Friday, 9AM-5PM EST
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
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
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
    marginLeft: Spacing.lg,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
  },
  settingsItemSubtitle: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoutSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    backgroundColor: Colors.error[50],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.error[600],
  },
  versionInfo: {
    alignItems: "center",
    paddingBottom: Spacing.xl,
  },
  versionText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[700],
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
  },
  disabledInput: {
    backgroundColor: Colors.neutral[100],
    color: Colors.neutral[500],
  },
  languageItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  selectedLanguageItem: {
    backgroundColor: Colors.primary[50],
  },
  languageText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
  },
  selectedLanguageText: {
    color: Colors.primary[600],
    fontFamily: "Inter-SemiBold",
  },
  modalText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[700],
    lineHeight: 24,
  },
})
