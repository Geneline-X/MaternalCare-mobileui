"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator } from "react-native"
import { Stack, useRouter, useSegments } from "expo-router"
import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo"
import * as SecureStore from "expo-secure-store"
import * as SplashScreen from "expo-splash-screen"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Token cache implementation for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      console.log("[SecureStore] Getting token for key:", key)
      const token = await SecureStore.getItemAsync(key)
      console.log("[SecureStore] Retrieved token:", token ? "***" : "null")
      return token
    } catch (err) {
      console.error("[SecureStore] Error getting token:", err)
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      console.log("[SecureStore] Saving token for key:", key)
      await SecureStore.setItemAsync(key, value)
    } catch (err) {
      console.error("[SecureStore] Error saving token:", err)
    }
  },
  async deleteToken(key: string) {
    try {
      console.log("[SecureStore] Deleting token for key:", key)
      await SecureStore.deleteItemAsync(key)
    } catch (err) {
      console.error("[SecureStore] Error deleting token:", err)
    }
  },
}

// Auth state handler
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const { user, isLoaded: isUserLoaded } = useUser()
  const router = useRouter()
  const segments = useSegments()
  const [isReady, setIsReady] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [lastNavigatedPath, setLastNavigatedPath] = useState<string | null>(null)

  // Get the current route from segments
  const currentPath = segments.join("/")
  const inAuthGroup = segments[0] === "(auth)"
  const inDoctorGroup = segments[0] === "(doctor)"
  const inPatientGroup = segments[0] === "(patient)"
  const inProtectedGroup = inDoctorGroup || inPatientGroup

  // Handle navigation based on auth state and user role
  useEffect(() => {
    // Skip if auth or user data is not loaded yet, or if we're already navigating
    if (!isAuthLoaded || !isUserLoaded || isNavigating) {
      return
    }

    console.log("[AuthProvider] Auth state changed", {
      isSignedIn,
      currentPath,
      inAuthGroup,
      inDoctorGroup,
      inPatientGroup,
      inProtectedGroup,
      lastNavigatedPath,
      userRole: user?.unsafeMetadata?.role,
    })

    const handleNavigation = async () => {
      try {
        // If user is signed in
        if (isSignedIn && user) {
          // Get user role from metadata
          const userRole = (user.unsafeMetadata?.role as "doctor" | "patient") || "patient"
          console.log("[AuthProvider] User role:", userRole)

          // If user is not in the correct protected group, redirect based on their role
          if (
            !inProtectedGroup ||
            (userRole === "doctor" && !inDoctorGroup) ||
            (userRole === "patient" && !inPatientGroup)
          ) {
            const targetPath = userRole === "doctor" ? "/(doctor)/dashboard" : "/(patient)/home"

            // Only navigate if we're not already on the target path
            if (targetPath !== `/${currentPath}`) {
              console.log(`[AuthProvider] Signed in as ${userRole}, redirecting to: ${targetPath}`)
              setIsNavigating(true)
              setLastNavigatedPath(targetPath)
              await router.replace(targetPath)
            }
          }
        }
        // If user is not signed in and not in auth group
        else if (!inAuthGroup) {
          const signInPath = "/(auth)/sign-in"
          // Only navigate if we're not already on the sign-in path
          if (signInPath !== `/${currentPath}`) {
            console.log("[AuthProvider] Not signed in, redirecting to sign-in")
            setIsNavigating(true)
            setLastNavigatedPath(signInPath)
            await router.replace(signInPath)
          }
        }
      } catch (error) {
        console.error("[AuthProvider] Navigation error:", error)
      } finally {
        // Always set navigating to false and hide splash screen when done
        setIsNavigating(false)

        // Hide splash screen once we've made a routing decision
        if (!isReady) {
          await SplashScreen.hideAsync().catch(console.warn)
          setIsReady(true)
        }
      }
    }

    // Add a small delay to prevent rapid navigation
    const timer = setTimeout(handleNavigation, 100)
    return () => clearTimeout(timer)
  }, [
    isSignedIn,
    isAuthLoaded,
    isUserLoaded,
    user,
    currentPath,
    inAuthGroup,
    inProtectedGroup,
    inDoctorGroup,
    inPatientGroup,
    router,
    isReady,
    isNavigating,
    lastNavigatedPath,
  ])

  // Show loading state while checking auth
  if (!isAuthLoaded || !isUserLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    )
  }

  return <>{children}</>
}

// Main layout component
function RootLayout() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

  // Initialize the app
  useEffect(() => {
    async function prepare() {
      try {
        // Load any resources needed for the app
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate loading
      } catch (e) {
        console.error("Error during initialization:", e)
        setError(e as Error)
      } finally {
        // Tell the application to render
        setInitialized(true)
        // Hide splash screen when ready
        SplashScreen.hideAsync().catch(console.warn)
      }
    }

    prepare()
  }, [])

  // Handle missing publishable key
  if (!publishableKey) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10, fontSize: 18, fontWeight: "bold" }}>
          Configuration Error
        </Text>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>
          Missing Clerk Publishable Key. Please check your environment variables.
        </Text>
        <Text style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
          Make sure you have a .env file with EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY set
        </Text>
        <Text style={{ textAlign: "center", color: "#999", fontStyle: "italic" }}>
          Current environment: {process.env.NODE_ENV || "development"}
        </Text>
      </View>
    )
  }

  // Handle initialization errors
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red", textAlign: "center", marginBottom: 10, fontSize: 18, fontWeight: "bold" }}>
          Initialization Error
        </Text>
        <Text style={{ textAlign: "center", marginBottom: 20, color: "#666" }}>{error.message}</Text>
        <Text style={{ textAlign: "center", color: "#999" }}>
          Please restart the app or contact support if the issue persists.
        </Text>
      </View>
    )
  }

  // Show loading state while initializing
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading app...</Text>
      </View>
    )
  }

  // Main app render
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(doctor)" />
          <Stack.Screen name="(patient)" />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="index" />
        </Stack>
      </AuthProvider>
    </ClerkProvider>
  )
}

export default RootLayout
