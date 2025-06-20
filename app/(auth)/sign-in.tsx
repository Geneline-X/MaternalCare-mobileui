"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  ViewStyle,
} from "react-native"
import { useRouter } from "expo-router"
import { useSignIn } from "@clerk/clerk-expo"
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows, Typography } from "../../constants/spacing"
import { LinearGradient } from "expo-linear-gradient"

export default function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const passwordInput = useRef<TextInput>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useState(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  })

  const handleSignIn = async () => {
    if (!isLoaded) return

    if (!email || !email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address")
      return
    }

    if (!password || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn.create({
        identifier: email.trim().toLowerCase(),
        password,
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.replace("/")
      }
    } catch (err: any) {
      console.error("Sign in error:", err)

      let errorMessage = "Sign in failed. Please try again."

      if (err.errors?.[0]?.code === "form_identifier_not_found") {
        errorMessage = "No account found with this email address."
      } else if (err.errors?.[0]?.code === "form_password_incorrect") {
        errorMessage = "Incorrect password. Please try again."
      } else if (err.errors?.[0]?.message) {
        errorMessage = err.errors[0].message
      }

      Alert.alert("Error", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient.primary[0], Colors.gradient.primary[1]]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.white} />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>MC</Text>
              </View>
              <Text style={styles.appName}>MaternalCare</Text>
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your care journey</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={[styles.inputContainer, email && styles.inputContainerFocused]}>
                  <Mail size={20} color={email ? Colors.primary[600] : Colors.neutral[400]} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.neutral[400]}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInput.current?.focus()}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity onPress={() => {}}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputContainer, password && styles.inputContainerFocused]}>
                  <Lock
                    size={20}
                    color={password ? Colors.primary[600] : Colors.neutral[400]}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordInput}
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.neutral[400]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={20} color={Colors.neutral[500]} />
                    ) : (
                      <Eye size={20} color={Colors.neutral[500]} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? [Colors.neutral[400], Colors.neutral[500]] : Colors.gradient.primary}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.white} size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.xxxxxxl,
    paddingBottom: Spacing.xl,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: Spacing.xxxxxxl,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xl,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
    ...Shadows.lg,
  },
  logoText: {
    fontSize: Typography.fontSize["4xl"],
    fontFamily: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
  appName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontWeight.semibold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: Typography.fontSize["5xl"],
    fontFamily: Typography.fontWeight.bold,
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.lg,
  },
  formContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxxl,
    borderTopRightRadius: BorderRadius.xxxl,
    paddingTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    ...Shadows.xl,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border.light,
    transition: "all 0.2s ease",
  } as ViewStyle,
  inputContainerFocused: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
    ...Shadows.sm,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  eyeIcon: {
    padding: Spacing.sm,
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  forgotPassword: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontWeight.semibold,
    color: Colors.primary[600],
  },
  button: {
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.xl,
    overflow: "hidden",
    ...Shadows.md,
  },
  buttonGradient: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  signUpText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  signUpLink: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontWeight.bold,
    color: Colors.primary[600],
  },
})
