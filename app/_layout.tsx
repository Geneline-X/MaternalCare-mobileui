import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as SecureStore from 'expo-secure-store';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUserRole } from '@/hooks/useUserRole';

SplashScreen.preventAutoHideAsync();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { role: userRole } = useUserRole();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  
  // Log the current authentication state for debugging
  useEffect(() => {
    console.log('Auth state changed:', { isLoaded, isSignedIn, userRole });
  }, [isLoaded, isSignedIn, userRole]);

  useEffect(() => {
    if (!isLoaded) {
      console.log('Auth not loaded yet');
      return;
    }

    const currentSegment = segments[0] as string | undefined;
    const inAuthGroup = currentSegment === '(auth)';
    const inDoctorGroup = currentSegment === '(doctor)';
    const inPatientGroup = currentSegment === '(patient)';
    const inTabsGroup = currentSegment === '(tabs)';

    console.log('Current segment:', currentSegment);
    console.log('Auth state:', { isSignedIn, userRole });

    if (!isSignedIn) {
      if (!inAuthGroup) {
        console.log('Not signed in, redirecting to sign-in');
        router.replace('/(auth)/sign-in');
      }
    } else {
      // User is signed in
      if (inAuthGroup) {
        // If in auth group but signed in, redirect based on role
        const redirectPath = userRole === 'doctor' ? '/(doctor)/dashboard' : '/(patient)/home';
        console.log('In auth group, redirecting to:', redirectPath);
        router.replace(redirectPath as any);
      } else if (userRole === 'doctor' && !inDoctorGroup && !inTabsGroup) {
        // If doctor but not in doctor group or tabs, redirect to doctor dashboard
        console.log('Doctor user, redirecting to doctor dashboard');
        router.replace('/(doctor)/dashboard' as any);
      } else if (userRole === 'patient' && !inPatientGroup && !inTabsGroup) {
        // If patient but not in patient group or tabs, redirect to patient home
        console.log('Patient user, redirecting to patient home');
        router.replace('/(patient)/home' as any);
      } else if (inTabsGroup) {
        // If in tabs group, redirect based on role
        const redirectPath = userRole === 'doctor' ? '/(doctor)/dashboard' : '/(patient)/home';
        console.log('In tabs group, redirecting to:', redirectPath);
        router.replace(redirectPath as any);
      }
    }
    
    setIsReady(true);
  }, [isSignedIn, segments, isLoaded, user]);

  // Show loading indicator while checking auth state
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useFrameworkReady();

  const tokenCache = {
    async getToken(key: string) {
      try {
        return SecureStore.getItemAsync(key);
      } catch (err) {
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (err) {
        return;
      }
    },
  };

  // Don't render anything until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider 
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''} 
      tokenCache={tokenCache}
    >
      <AuthProvider>
        <StatusBar style="auto" />
        <Slot />
      </AuthProvider>
    </ClerkProvider>
  );
}

export default RootLayout;