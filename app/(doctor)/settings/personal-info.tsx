"use client"

import * as React from "react"

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
import { useUser } from "@clerk/clerk-expo"
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar } from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"

export default function PersonalInfo() {
  const router = useRouter()
  const { user } = useUser()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    phone: user?.phoneNumbers?.[0]?.phoneNumber || "",
    address: "123 Medical Center Drive",
    city: "Freetown",
    country: "Sierra Leone",
    dateOfBirth: "1985-06-15",
    gender: "Male",
    emergencyContact: "+232 76 123 456",
    emergencyContactName: "Dr. Sarah Wilson",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      Alert.alert(t("common.error"), "Please fill in all required fields.")
      return
    }

    setIsLoading(true)

    try {
      // Update user profile using Clerk
      await user?.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      // In a real app, you would also update other fields via your backend API

      Alert.alert(t("common.success"), "Personal information updated successfully!", [
        { text: t("common.ok"), onPress: () => setIsEditing(false) },
      ])
    } catch (error) {
      Alert.alert(t("common.error"), "Failed to update information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const FormField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default" as any,
    required = false,
    editable = true,
    icon,
  }: {
    label: string
    value: string
    onChangeText: (text: string) => void
    placeholder: string
    keyboardType?: any
    required?: boolean
    editable?: boolean
    icon?: React.ReactNode
  }) => (
    <View style={styles.formField}>
      <Text style={[styles.fieldLabel, isDarkMode && styles.fieldLabelDark]}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={[styles.fieldInputContainer, isDarkMode && styles.fieldInputContainerDark]}>
        {icon && <View style={styles.fieldIcon}>{icon}</View>}
        <TextInput
          style={[
            styles.fieldInput,
            isDarkMode ? styles.fieldInputDark : null,
            !editable ? styles.fieldInputDisabled : null,
            icon ? styles.fieldInputWithIcon : null,
          ].filter(Boolean)}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? Colors.neutral[500] : Colors.neutral[400]}
          keyboardType={keyboardType}
          editable={editable && isEditing}
        />
      </View>
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
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Personal Information</Text>
        <TouchableOpacity
          style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isLoading}
        >
          {isEditing ? <Save size={20} color={Colors.white} /> : <Text style={styles.editText}>Edit</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Basic Information</Text>

          <FormField
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            placeholder="Enter your first name"
            required
            icon={<User size={20} color={Colors.neutral[400]} />}
          />

          <FormField
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            placeholder="Enter your last name"
            required
            icon={<User size={20} color={Colors.neutral[400]} />}
          />

          <FormField
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter your email address"
            keyboardType="email-address"
            required
            editable={false}
            icon={<Mail size={20} color={Colors.neutral[400]} />}
          />

          <FormField
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            icon={<Phone size={20} color={Colors.neutral[400]} />}
          />

          <FormField
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
            placeholder="YYYY-MM-DD"
            icon={<Calendar size={20} color={Colors.neutral[400]} />}
          />

          <FormField
            label="Gender"
            value={formData.gender}
            onChangeText={(text) => setFormData({ ...formData, gender: text })}
            placeholder="Enter your gender"
            icon={<User size={20} color={Colors.neutral[400]} />}
          />
        </View>

        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Address Information</Text>

          <FormField
            label="Street Address"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            placeholder="Enter your street address"
            icon={<MapPin size={20} color={Colors.neutral[400]} />}
          />

          <FormField
            label="City"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            placeholder="Enter your city"
            icon={<MapPin size={20} color={Colors.neutral[400]} />}
          />

          <FormField
            label="Country"
            value={formData.country}
            onChangeText={(text) => setFormData({ ...formData, country: text })}
            placeholder="Enter your country"
            icon={<MapPin size={20} color={Colors.neutral[400]} />}
          />
        </View>

        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Emergency Contact</Text>

          <FormField
            label="Emergency Contact Name"
            value={formData.emergencyContactName}
            onChangeText={(text) => setFormData({ ...formData, emergencyContactName: text })}
            placeholder="Enter emergency contact name"
            icon={<User size={20} color={Colors.neutral[400]} />}
          />

          <FormField
            label="Emergency Contact Phone"
            value={formData.emergencyContact}
            onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })}
            placeholder="Enter emergency contact phone"
            keyboardType="phone-pad"
            icon={<Phone size={20} color={Colors.neutral[400]} />}
          />
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
  actionButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 60,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  editText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
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
  required: {
    color: Colors.error[500],
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
    paddingLeft: Spacing.md,
  },
  fieldInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
  },
  fieldInputDark: {
    color: Colors.white,
  },
  fieldInputDisabled: {
    opacity: 0.6,
  },
  fieldInputWithIcon: {
    paddingLeft: Spacing.sm,
  },
})
