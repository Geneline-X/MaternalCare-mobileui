"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { ArrowLeft, Save, Lock, Eye, EyeOff, Shield } from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"

export default function ChangePassword() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [isLoading, setIsLoading] = useState(false)

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    }
  }

  const passwordValidation = validatePassword(formData.newPassword)

  const handleSave = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert(t("common.error"), "Please fill in all fields.")
      return
    }

    if (!passwordValidation.isValid) {
      Alert.alert(t("common.error"), "Please ensure your new password meets all requirements.")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert(t("common.error"), "New passwords do not match.")
      return
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert(t("common.error"), "New password must be different from current password.")
      return
    }

    setIsLoading(true)

    try {
      // In a real app, you would call your backend API to change the password
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      Alert.alert(t("common.success"), "Password changed successfully!", [
        {
          text: t("common.ok"),
          onPress: () => {
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
            router.back()
          },
        },
      ])
    } catch (error) {
      Alert.alert(t("common.error"), "Failed to change password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const PasswordField = ({
    label,
    value,
    onChangeText,
    placeholder,
    showPassword,
    onToggleShow,
  }: {
    label: string
    value: string
    onChangeText: (text: string) => void
    placeholder: string
    showPassword: boolean
    onToggleShow: () => void
  }) => (
    <View style={styles.formField}>
      <Text style={[styles.fieldLabel, isDarkMode && styles.fieldLabelDark]}>{label}</Text>
      <View style={[styles.fieldInputContainer, isDarkMode && styles.fieldInputContainerDark]}>
        <Lock size={20} color={Colors.neutral[400]} style={styles.fieldIcon} />
        <TextInput
          style={[styles.fieldInput, isDarkMode && styles.fieldInputDark]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? Colors.neutral[500] : Colors.neutral[400]}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={onToggleShow}>
          {showPassword ? (
            <EyeOff size={20} color={Colors.neutral[400]} />
          ) : (
            <Eye size={20} color={Colors.neutral[400]} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  )

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <View style={styles.requirementItem}>
      <View style={[styles.requirementDot, met && styles.requirementDotMet]} />
      <Text
        style={[styles.requirementText, isDarkMode && styles.requirementTextDark, met && styles.requirementTextMet]}
      >
        {text}
      </Text>
    </View>
  )

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDarkMode && styles.containerDark]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? Colors.white : Colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Change Password</Text>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Save size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color={Colors.primary[600]} />
            <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Security</Text>
          </View>

          <PasswordField
            label="Current Password"
            value={formData.currentPassword}
            onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
            placeholder="Enter your current password"
            showPassword={showPasswords.current}
            onToggleShow={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
          />

          <PasswordField
            label="New Password"
            value={formData.newPassword}
            onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
            placeholder="Enter your new password"
            showPassword={showPasswords.new}
            onToggleShow={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
          />

          <PasswordField
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            placeholder="Confirm your new password"
            showPassword={showPasswords.confirm}
            onToggleShow={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
          />
        </View>

        <View style={[styles.requirementsSection, isDarkMode && styles.requirementsSectionDark]}>
          <Text style={[styles.requirementsTitle, isDarkMode && styles.requirementsTitleDark]}>
            Password Requirements
          </Text>
          <RequirementItem met={passwordValidation.minLength} text="At least 8 characters long" />
          <RequirementItem met={passwordValidation.hasUpperCase} text="Contains uppercase letter (A-Z)" />
          <RequirementItem met={passwordValidation.hasLowerCase} text="Contains lowercase letter (a-z)" />
          <RequirementItem met={passwordValidation.hasNumbers} text="Contains number (0-9)" />
          <RequirementItem met={passwordValidation.hasSpecialChar} text="Contains special character (!@#$%^&*)" />
        </View>

        <View style={[styles.infoSection, isDarkMode && styles.infoSectionDark]}>
          <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>
            For your security, we recommend using a strong password that you don't use for other accounts. Consider
            using a password manager to generate and store secure passwords.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  containerDark: {
    backgroundColor: Colors.neutral[900],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  headerDark: {
    backgroundColor: Colors.neutral[800],
    borderBottomColor: Colors.neutral[700],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  titleDark: {
    color: Colors.white,
  },
  saveButton: {
    backgroundColor: Colors.primary[600],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  sectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginLeft: Spacing.sm,
  },
  sectionTitleDark: {
    color: Colors.white,
  },
  formField: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  fieldLabelDark: {
    color: Colors.neutral[300],
  },
  fieldInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[50],
  },
  fieldInputContainerDark: {
    borderColor: Colors.neutral[600],
    backgroundColor: Colors.neutral[700],
  },
  fieldIcon: {
    marginLeft: Spacing.md,
  },
  fieldInput: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
  },
  fieldInputDark: {
    color: Colors.white,
  },
  eyeButton: {
    padding: Spacing.md,
  },
  requirementsSection: {
    backgroundColor: Colors.primary[50],
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  requirementsSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  requirementsTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[700],
    marginBottom: Spacing.md,
  },
  requirementsTitleDark: {
    color: Colors.white,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  requirementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
    marginRight: Spacing.sm,
  },
  requirementDotMet: {
    backgroundColor: Colors.success[500],
  },
  requirementText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  requirementTextDark: {
    color: Colors.neutral[400],
  },
  requirementTextMet: {
    color: Colors.success[600],
  },
  infoSection: {
    backgroundColor: Colors.warning[50],
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  infoSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.warning[700],
    lineHeight: 20,
  },
  infoTextDark: {
    color: Colors.neutral[300],
  },
})
