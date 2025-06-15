import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useUserRole } from '../hooks/useUserRole';
import { Colors } from '../constants/colors';

export default function Index() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { role, isLoaded: roleLoaded } = useUserRole();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!authLoaded || !roleLoaded || initialized) return;

    const navigate = async () => {
      try {
        if (isSignedIn) {
          const userRole = role || 'doctor';
          if (userRole === 'doctor' || userRole === 'patient') {
            console.log(`[Index] Redirecting to ${userRole} dashboard`);
            // @ts-ignore - TypeScript doesn't like the dynamic path, but it's valid
            router.replace(`/(${userRole})/dashboard`);
          } else {
            console.error('[Index] Invalid user role:', userRole);
            router.replace('/(auth)/sign-in');
          }
        } else {
          console.log('[Index] User not signed in, redirecting to sign-in');
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('[Index] Navigation error:', error);
      } finally {
        setInitialized(true);
      }
    };

    const timer = setTimeout(navigate, 100);
    return () => clearTimeout(timer);
  }, [authLoaded, roleLoaded, isSignedIn, role, router, initialized]);

  // Show loading indicator while initializing
  if (!initialized || !authLoaded || !roleLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  // The actual content will be replaced by the router
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
