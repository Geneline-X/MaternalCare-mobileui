"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native"
import { useRouter } from "expo-router"
import { Lock, Eye, EyeOff } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

export default function ChangePassword() {
  const router = useRouter()
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

  const handleSave = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert("Error", "New passwords do not match")
      return
    }
    if (formData.newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    Alert.alert("Success", "Password changed successfully!", [{ text: "OK", onPress: () => router.back() }])
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.description}>For your security, please enter your current password to set a new one.</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.neutral[400]} />
              <TextInput
                style={styles.input}
                value={formData.currentPassword}
                onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                placeholder="Enter current password"
                secureTextEntry={!showPasswords.current}
              />
              <TouchableOpacity onPress={() => togglePasswordVisibility("current")} style={styles.eyeButton}>
                {showPasswords.current ? (
                  <EyeOff size={20} color={Colors.neutral[400]} />
                ) : (
                  <Eye size={20} color={Colors.neutral[400]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.neutral[400]} />
              <TextInput
                style={styles.input}
                value={formData.newPassword}
                onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                placeholder="Enter new password"
                secureTextEntry={!showPasswords.new}
              />
              <TouchableOpacity onPress={() => togglePasswordVisibility("new")} style={styles.eyeButton}>
                {showPasswords.new ? (
                  <EyeOff size={20} color={Colors.neutral[400]} />
                ) : (
                  <Eye size={20} color={Colors.neutral[400]} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.neutral[400]} />
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                placeholder="Confirm new password"
                secureTextEntry={!showPasswords.confirm}
              />
              <TouchableOpacity onPress={() => togglePasswordVisibility("confirm")} style={styles.eyeButton}>
                {showPasswords.confirm ? (
                  <EyeOff size={20} color={Colors.neutral[400]} />
                ) : (
                  <Eye size={20} color={Colors.neutral[400]} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.requirements}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <Text style={styles.requirementItem}>• At least 6 characters long</Text>
          <Text style={styles.requirementItem}>• Include uppercase and lowercase letters</Text>
          <Text style={styles.requirementItem}>• Include at least one number</Text>
          <Text style={styles.requirementItem}>• Include at least one special character</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: Spacing.lg,
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  form: {
    marginBottom: Spacing.xl,
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
    marginLeft: Spacing.sm,
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  requirements: {
    backgroundColor: Colors.primary[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  requirementsTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[700],
    marginBottom: Spacing.sm,
  },
  requirementItem: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.primary[600],
    marginBottom: 2,
  },
  saveButton: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    ...Shadows.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
})
