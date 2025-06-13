import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
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
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius, Shadows } from '../../constants/spacing';

export default function Settings() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    showChevron = true,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.settingsItemIcon}>
          {icon}
        </View>
        <View style={styles.settingsItemText}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement}
        {showChevron && onPress && (
          <ChevronRight size={16} color={Colors.neutral[400]} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
          <View style={styles.profileAvatar}>
            <User size={24} color={Colors.primary[600]} />
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileRole}>
              {user?.role === 'doctor' ? 'Healthcare Provider' : 'Patient'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <SettingsSection title="Account">
        <SettingsItem
          icon={<User size={20} color={Colors.neutral[600]} />}
          title="Personal Information"
          subtitle="Update your personal details"
          onPress={() => {}}
        />
        <SettingsItem
          icon={<Lock size={20} color={Colors.neutral[600]} />}
          title="Change Password"
          subtitle="Update your password"
          onPress={() => {}}
        />
        <SettingsItem
          icon={<Shield size={20} color={Colors.neutral[600]} />}
          title="Privacy & Security"
          subtitle="Manage your privacy settings"
          onPress={() => {}}
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
          subtitle="English"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Health Data">
        <SettingsItem
          icon={<Heart size={20} color={Colors.neutral[600]} />}
          title="Data Sharing"
          subtitle="Manage data sharing preferences"
          onPress={() => {}}
        />
        <SettingsItem
          icon={<Smartphone size={20} color={Colors.neutral[600]} />}
          title="Connected Devices"
          subtitle="Manage connected health devices"
          onPress={() => {}}
        />
        <SettingsItem
          icon={<Mail size={20} color={Colors.neutral[600]} />}
          title="Consent Management"
          subtitle="View and manage consent forms"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsItem
          icon={<Mail size={20} color={Colors.neutral[600]} />}
          title="Contact Support"
          subtitle="Get help with your account"
          onPress={() => {}}
        />
        <SettingsItem
          icon={<Shield size={20} color={Colors.neutral[600]} />}
          title="Terms & Privacy"
          subtitle="Read our terms and privacy policy"
          onPress={() => {}}
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
    </ScrollView>
  );
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
    fontFamily: 'Poppins-Bold',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.neutral[800],
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[600],
    marginTop: 2,
  },
  profileRole: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.primary[600],
    marginTop: 2,
  },
  editProfileButton: {
    backgroundColor: Colors.primary[50],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary[600],
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[800],
  },
  settingsItemSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[600],
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoutSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  logoutButton: {
    backgroundColor: Colors.error[50],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.error[600],
  },
  versionInfo: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.neutral[500],
  },
});