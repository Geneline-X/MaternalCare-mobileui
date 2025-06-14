import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { SplashScreen, Slot } from 'expo-router';
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
import { useRouter, useSegments } from 'expo-router';
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
  
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const currentSegment = segments[0] as string | undefined;
    const inAuthGroup = currentSegment === '(auth)';
    const inDoctorGroup = currentSegment === '(doctor)';
    const inPatientGroup = currentSegment === '(patient)';
    const inTabsGroup = currentSegment === '(tabs)';

    if (!isSignedIn) {
      if (!inAuthGroup) {
        router.replace('/(auth)/sign-in');
      }
    } else {
      if (inAuthGroup) {
        const redirectPath = userRole === 'doctor' ? '/(doctor)/dashboard' : '/(patient)/home';
        router.replace(redirectPath as any);
      } else if (userRole === 'doctor' && !inDoctorGroup && !inTabsGroup) {
        router.replace('/(doctor)/dashboard' as any);
      } else if (userRole === 'patient' && !inPatientGroup && !inTabsGroup) {
        router.replace('/(patient)/home' as any);
      } else if (inTabsGroup) {
        const redirectPath = userRole === 'doctor' ? '/(doctor)/dashboard' : '/(patient)/home';
        router.replace(redirectPath as any);
      }
    }
    
    setIsReady(true);
  }, [isSignedIn, segments, isLoaded, user]);

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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider 
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''} 
      tokenCache={tokenCache}
    >
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <Slot />
        </AuthProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

export default RootLayout;