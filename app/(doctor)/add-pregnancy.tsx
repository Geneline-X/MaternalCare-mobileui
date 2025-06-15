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
  Modal,
  FlatList,
  KeyboardTypeOptions,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { FormErrors } from "../../types/app"
import { StyleProp, ViewStyle, TextStyle } from 'react-native';
const mockPatients = [
  { id: "1", name: "Sarah Johnson", email: "sarah.johnson@email.com" },
  { id: "2", name: "Emily Davis", email: "emily.davis@email.com" },
  { id: "3", name: "Maria Rodriguez", email: "maria.rodriguez@email.com" },
  { id: "4", name: "Jennifer Wilson", email: "jennifer.wilson@email.com" },
  { id: "5", name: "Lisa Anderson", email: "lisa.anderson@email.com" },
]

const riskLevels = [
  { id: "low", label: "Low Risk", color: Colors.success[500] },
  { id: "medium", label: "Medium Risk", color: Colors.warning[500] },
  { id: "high", label: "High Risk", color: Colors.error[500] },
]

export default function AddPregnancy() {
  const router = useRouter()
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    lastMenstrualPeriod: "",
    estimatedDueDate: "",
    currentWeek: "",
    riskLevel: "low",
    riskLevelLabel: "Low Risk",
    complications: "",
    previousPregnancies: "",
    currentSymptoms: "",
    bloodPressure: "",
    weight: "",
    height: "",
    prenatalVitamins: false,
    smokingStatus: false,
    alcoholConsumption: false,
    notes: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.patientId) newErrors.patientId = "Please select a patient"
    if (!formData.lastMenstrualPeriod.trim()) newErrors.lastMenstrualPeriod = "Last menstrual period is required"
    if (!formData.estimatedDueDate.trim()) newErrors.estimatedDueDate = "Estimated due date is required"
    if (!formData.currentWeek.trim()) newErrors.currentWeek = "Current week is required"
    if (!formData.weight.trim()) newErrors.weight = "Current weight is required"
    if (!formData.height.trim()) newErrors.height = "Height is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      Alert.alert("Success", "Pregnancy record has been created successfully!", [
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
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const selectPatient = (patient: { id: string; name: string }) => {
    updateFormData("patientId", patient.id)
    updateFormData("patientName", patient.name)
    setShowPatientModal(false)
  }

  const selectRiskLevel = (risk: { id: string; label: string }) => {
    updateFormData("riskLevel", risk.id)
    updateFormData("riskLevelLabel", risk.label)
    setShowRiskModal(false)
  }

  const renderInput = (label: string, field: keyof typeof formData, placeholder: string, multiline = false, keyboardType = "default") => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {[
          "patientId", "lastMenstrualPeriod", "estimatedDueDate", "currentWeek", "weight", "height"
        ].includes(field) && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea, errors[field] && styles.inputError]}
        placeholder={placeholder}
        value={String(formData[field]) || ''}
        onChangeText={(value) => updateFormData(field, value)}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType as KeyboardTypeOptions}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  )

  const renderPatientItem = ({ item }: { item: { id: string; name: string; email: string } }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectPatient(item)}>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientEmail}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
    </TouchableOpacity>
  )

  const renderRiskItem = ({ item }: { item: { id: string; label: string; color: string } }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectRiskLevel(item)}>
      <View style={styles.riskInfo}>
        <View style={[styles.riskDot, { backgroundColor: item.color } as ViewStyle]} />
        <Text style={styles.riskLabel}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Pregnancy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Selection</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Select Patient <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selector, errors.patientId && styles.inputError]}
              onPress={() => setShowPatientModal(true)}
            >   
              <Text style={[styles.selectorText, !formData.patientName && styles.placeholder]}>
                {formData.patientName || "Choose a patient"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
            {errors.patientId && <Text style={styles.errorText}>{errors.patientId}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pregnancy Details</Text>

          {renderInput("Last Menstrual Period", "lastMenstrualPeriod", "DD/MM/YYYY")}
          {renderInput("Estimated Due Date", "estimatedDueDate", "DD/MM/YYYY")}
          {renderInput("Current Week", "currentWeek", "e.g., 12", false, "numeric")}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Risk Level</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setShowRiskModal(true)}>
              <View style={styles.riskSelector}>
                <View
                  style={[
                    styles.riskDot,
                    {
                      backgroundColor:
                        riskLevels.find((r) => r.id === formData.riskLevel)?.color || Colors.success[500],
                    },
                  ]}
                />
                <Text style={styles.selectorText}>{formData.riskLevelLabel}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          {renderInput("Complications", "complications", "Enter any known complications", true)}
          {renderInput("Previous Pregnancies", "previousPregnancies", "Enter previous pregnancy history", true)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Health Status</Text>

          {renderInput("Current Symptoms", "currentSymptoms", "Enter current symptoms", true)}
          {renderInput("Blood Pressure", "bloodPressure", "e.g., 120/80 mmHg")}

          <View style={styles.row}>
            <View style={styles.halfWidth}>{renderInput("Weight", "weight", "kg", false, "numeric")}</View>
            <View style={styles.halfWidth}>{renderInput("Height", "height", "cm", false, "numeric")}</View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle Factors</Text>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Taking Prenatal Vitamins</Text>
              <Text style={styles.switchDescription}>Currently taking prenatal supplements</Text>
            </View>
            <Switch
              value={formData.prenatalVitamins}
              onValueChange={(value) => updateFormData("prenatalVitamins", value.toString())}
              trackColor={{ false: Colors.neutral[300], true: Colors.success[200] }}
              thumbColor={formData.prenatalVitamins ? Colors.success[500] : Colors.neutral[500]}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Smoking</Text>
              <Text style={styles.switchDescription}>Currently smoking or recently quit</Text>
            </View>
            <Switch
              value={formData.smokingStatus}
              onValueChange={(value) => updateFormData("smokingStatus", value.toString())}
              trackColor={{ false: Colors.neutral[300], true: Colors.error[200] }}
              thumbColor={formData.smokingStatus ? Colors.error[500] : Colors.neutral[500]}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Alcohol Consumption</Text>
              <Text style={styles.switchDescription}>Currently consuming alcohol</Text>
            </View>
            <Switch
              value={formData.alcoholConsumption}
              onValueChange={(value) => updateFormData("alcoholConsumption", value.toString())}
              trackColor={{ false: Colors.neutral[300], true: Colors.error[200] }}
              thumbColor={formData.alcoholConsumption ? Colors.error[500] : Colors.neutral[500]}
            />
          </View>

          {renderInput("Additional Notes", "notes", "Enter any additional notes or observations", true)}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Create Pregnancy Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Patient Selection Modal */}
      <Modal
        visible={showPatientModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <TouchableOpacity onPress={() => setShowPatientModal(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={mockPatients}
              renderItem={renderPatientItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Risk Level Selection Modal */}
      <Modal
        visible={showRiskModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRiskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Risk Level</Text>
              <TouchableOpacity onPress={() => setShowRiskModal(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={riskLevels}
              renderItem={renderRiskItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
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
  selector: {
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
  },
  placeholder1: {
    color: Colors.neutral[400],
  },
  riskSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  riskDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  patientEmail: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  riskInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  riskLabel: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[800],
  },
})
