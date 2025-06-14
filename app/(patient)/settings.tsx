import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { FontSize } from '../../constants/fontSize';
import { ChevronRight, Bell, Lock, User, HelpCircle, LogOut } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFeatureNotImplemented = (feature: string) => {
    Alert.alert(
      'Coming Soon',
      `${feature} feature will be available in a future update.`,
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    onPress, 
    showSwitch = false, 
    switchValue, 
    onSwitchChange 
  }: { 
    icon: any, 
    title: string, 
    onPress?: () => void, 
    showSwitch?: boolean, 
    switchValue?: boolean, 
    onSwitchChange?: (value: boolean) => void 
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={Colors.neutral[600]} />
        </View>
        <Text style={styles.settingItemText}>{title}</Text>
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
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon={User}
          title="Profile Information"
          onPress={() => handleFeatureNotImplemented('Profile Information')}
        />
        <SettingItem
          icon={Lock}
          title="Security"
          onPress={() => handleFeatureNotImplemented('Security')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem
          icon={Bell}
          title="Notifications"
          showSwitch
          switchValue={notificationsEnabled}
          onSwitchChange={setNotificationsEnabled}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingItem
          icon={HelpCircle}
          title="Help & Support"
          onPress={() => handleFeatureNotImplemented('Help & Support')}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={20} color={Colors.error[500]} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.neutral[900],
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.neutral[500],
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  settingItemText: {
    fontSize: FontSize.md,
    color: Colors.neutral[900],
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.error[50],
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  signOutText: {
    fontSize: FontSize.md,
    color: Colors.error[500],
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
}); 