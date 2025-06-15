"use client"

import { useEffect } from "react"
import { View, ActivityIndicator } from "react-native"
import { useAuth } from "@clerk/clerk-expo"
import { useRouter } from "expo-router"
import { useUserRole } from "../hooks/useUserRole"
import { Colors } from "../constants/colors"

export default function Index() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { role, isLoaded: roleLoaded } = useUserRole()
  const router = useRouter()

  useEffect(() => {
    // Wait for both auth and role to be loaded
    if (!authLoaded || !roleLoaded) return

    // Add a small delay to prevent routing conflicts
    const timer = setTimeout(() => {
      if (isSignedIn && role) {
        // Redirect based on user role
        if (role === "doctor") {
          router.replace("/(doctor)/dashboard")
        } else if (role === "patient") {
          router.replace("/(patient)/home")
        }
      } else {
        // User is not signed in, redirect to auth
        router.replace("/(auth)")
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [authLoaded, roleLoaded, isSignedIn, role, router])

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.white,
      }}
    >
      <ActivityIndicator size="large" color={Colors.primary[500]} />
    </View>
  )
}
