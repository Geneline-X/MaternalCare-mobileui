"use client"

import { Stack, useRouter } from "expo-router"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { useState, useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native'

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const
  }
} as const) as {
  loading: ViewStyle
}

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    if (isLoaded && !hasCheckedAuth) {
      setHasCheckedAuth(true)
      if (isSignedIn) {
        const role = user?.publicMetadata?.role
        if (role === 'doctor') {
          router.replace('/(doctor)/dashboard')
        } else if (role === 'patient') {
          router.replace('/(patient)/home')
        } else {
          router.replace('/(auth)/sign-in')
        }
      } else {
        router.replace('/(auth)/sign-in')
      }
    }
  }, [isLoaded, isSignedIn, user, hasCheckedAuth])

  if (!hasCheckedAuth) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  )
}
