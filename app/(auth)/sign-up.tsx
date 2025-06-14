"use client"

import { useState } from "react"
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
} from "react-native"
import { useRouter } from "expo-router"
import { useSignUp } from "@clerk/clerk-expo"
import { ArrowLeft, User, Mail, Lock, Stethoscope, User as UserIcon } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "patient" as 'patient' | 'doctor'
  })
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignUp = async () => {
    if (!isLoaded) return;

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    
    if (!formData.role) {
      Alert.alert("Error", "Please select an account type");
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      // Create the user with all data in unsafeMetadata
      await signUp.create({
        emailAddress: formData.email.trim().toLowerCase(),
        password: formData.password,
        unsafeMetadata: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          role: formData.role
        }
      });

      // No need for a separate update call

      // Prepare email verification
      await signUp.prepareEmailAddressVerification({ 
        strategy: "email_code" 
      });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Signup error:', JSON.stringify(err, null, 2));
      
      let errorMessage = 'Sign up failed. Please try again.';
      
      if (err.errors) {
        const clerkError = err.errors[0];
        if (clerkError) {
          if (clerkError.code === 'form_identifier_exists') {
            errorMessage = 'This email is already registered. Please sign in instead.';
          } else if (clerkError.message) {
            errorMessage = clerkError.message;
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const onPressVerify = async () => {
    if (!isLoaded) return

    setIsLoading(true)
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === "complete") {
        // Get the user role from the sign up data
        const userRole = completeSignUp.createdUserId ? 
          (completeSignUp.unsafeMetadata?.role as string) || 'patient' : 'patient';
        
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Redirect based on role
        const redirectPath = userRole === 'doctor' ? '/(doctor)/dashboard' : '/(patient)/home';
        router.replace(redirectPath as any);
      } else {
        console.log(JSON.stringify(completeSignUp, null, 2))
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>We've sent a verification code to {formData.email}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={setCode}
              placeholder="Enter verification code"
              keyboardType="number-pad"
              textAlign="center"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
            onPress={onPressVerify}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>{isLoading ? "Verifying..." : "Verify Email"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.neutral[600]} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill in your details to get started</Text>
          
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity 
                style={[
                  styles.roleButton, 
                  formData.role === 'patient' && styles.roleButtonActive
                ]}
                onPress={() => setFormData({...formData, role: 'patient'})}
              >
                <UserIcon size={20} color={formData.role === 'patient' ? Colors.white : Colors.primary[600]} />
                <Text style={[styles.roleButtonText, formData.role === 'patient' && styles.roleButtonTextActive]}>
                  Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.roleButton, 
                  formData.role === 'doctor' && styles.roleButtonActive
                ]}
                onPress={() => setFormData({...formData, role: 'doctor'})}
              >
                <Stethoscope size={20} color={formData.role === 'doctor' ? Colors.white : Colors.primary[600]} />
                <Text style={[styles.roleButtonText, formData.role === 'doctor' && styles.roleButtonTextActive]}>
                  Doctor
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.neutral[400]} />
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(value) => updateFormData("firstName", value)}
                placeholder="Enter your first name"
                autoComplete="given-name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.neutral[400]} />
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(value) => updateFormData("lastName", value)}
                placeholder="Enter your last name"
                autoComplete="family-name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.neutral[400]} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => updateFormData("email", value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.neutral[400]} />
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(value) => updateFormData("password", value)}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>{isLoading ? "Creating Account..." : "Create Account"}</Text>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("./sign-in")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral[500],
    marginBottom: 24,
    textAlign: 'center',
  },
  roleContainer: {
    marginBottom: 24,
    width: '100%',
  },
  roleLabel: {
    fontSize: 14,
    color: Colors.neutral[600],
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.white,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  roleButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[800],
  },
  roleButtonTextActive: {
    color: Colors.white,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral[50],
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
    marginLeft: Spacing.sm,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.neutral[50],
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    letterSpacing: 4,
  },
  registerButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.lg,
    ...Shadows.md,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginTop: Spacing.lg,
    ...Shadows.md,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  loginPromptText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  loginLink: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
  },
})
