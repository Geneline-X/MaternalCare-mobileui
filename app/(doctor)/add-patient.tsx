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
  SafeAreaView,
  Switch,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { FormErrors } from "../../types/app"

export default function AddPatient() {
    
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: "",
    isHighRisk: false,
    bloodType: "",
    insurance: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = "Date of birth is required"
    if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = "Emergency contact name is required"
    if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = "Emergency contact phone is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s\-$$$$]+$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      // Here you would typically save to your backend
      Alert.alert("Success", "Patient has been added successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } else {
      Alert.alert("Error", "Please fill in all required fields correctly.")
    }
  }

  const updateFormData = (field: keyof FormErrors, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const renderInput = (label: string, field: keyof typeof formData, placeholder: string, multiline = false, keyboardType: 'default' | 'numeric' | 'email-address' | 'phone-pad' = "default") => {
  const keyboardTypeMap: { [key: string]: 'default' | 'numeric' | 'email-address' | 'phone-pad' } = {
    'default': 'default',
    'numeric': 'numeric',
    'email-address': 'email-address',
    'phone-pad': 'phone-pad'
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {[
          "firstName",
          "lastName",
          "email",
          "phone",
          "dateOfBirth",
          "emergencyContactName",
          "emergencyContactPhone",
        ].includes(field) && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea, errors[field] && styles.inputError]}
        placeholder={placeholder}
        value={typeof formData[field] === 'boolean' ? formData[field].toString() : formData[field]}
        onChangeText={(value) => updateFormData(field, value)}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardTypeMap[keyboardType]}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Patient</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>{renderInput("First Name", "firstName", "Enter first name", false, "default")}</View>
            <View style={styles.halfWidth}>{renderInput("Last Name", "lastName", "Enter last name", false, "default")}</View>
          </View>

          {renderInput("Email Address", "email", "Enter email address", false, "email-address")}
          {renderInput("Phone Number", "phone", "Enter phone number", false, "phone-pad")}
          {renderInput("Date of Birth", "dateOfBirth", "DD/MM/YYYY")}
          {renderInput("Address", "address", "Enter full address", true)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          {renderInput("Contact Name", "emergencyContactName", "Enter emergency contact name")}
          {renderInput("Contact Phone", "emergencyContactPhone", "Enter emergency contact phone", false, "phone-pad")}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>{renderInput("Blood Type", "bloodType", "e.g., O+, A-, B+")}</View>
            <View style={styles.halfWidth}>{renderInput("Insurance", "insurance", "Insurance provider")}</View>
          </View>

          {renderInput("Medical History", "medicalHistory", "Enter relevant medical history", true)}
          {renderInput("Allergies", "allergies", "Enter known allergies", true)}
          {renderInput("Current Medications", "currentMedications", "Enter current medications", true)}

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>High Risk Patient</Text>
              <Text style={styles.switchDescription}>Mark if patient requires special attention or monitoring</Text>
            </View>
            <Switch
              value={formData.isHighRisk}
              onValueChange={(value) => updateFormData("isHighRisk", value.toString())}
              trackColor={{ false: Colors.neutral[300], true: Colors.error[200] }}
              thumbColor={formData.isHighRisk ? Colors.error[500] : Colors.neutral[500]}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Patient</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
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
  backButton: {
    padding: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.error[500],
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: Colors.error[500],
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.error[500],
    marginTop: Spacing.xs,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    marginTop: Spacing.md,
  },
  switchInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[700],
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
})
