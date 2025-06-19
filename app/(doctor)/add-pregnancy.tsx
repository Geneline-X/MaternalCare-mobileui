"use client"

import { useState, useEffect } from "react"
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
  type KeyboardTypeOptions,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { useApiClient } from "../../utils/api"
import type {
  PatientForSelection,
  PregnancyCreateRequest,
  PregnancyResponse,
  ApiResponse,
  PaginatedResponse,
  PatientQueryParams,
} from "../../types/api"

interface FormErrors {
  patientId?: string
  lastMenstrualPeriod?: string
  estimatedDueDate?: string
  currentWeek?: string
  weight?: string
  height?: string
}

const riskLevels = [
  { id: "low", label: "Low Risk", color: Colors.success[500] },
  { id: "medium", label: "Medium Risk", color: Colors.warning[500] },
  { id: "high", label: "High Risk", color: Colors.error[500] },
] as const

export default function AddPregnancy() {
  const router = useRouter()
  const apiClient = useApiClient()
  const [loading, setLoading] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [patients, setPatients] = useState<PatientForSelection[]>([])

  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    lastMenstrualPeriod: "",
    estimatedDueDate: "",
    currentWeek: "",
    riskLevel: "low" as "low" | "medium" | "high",
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

  // Load patients when modal opens
  useEffect(() => {
    if (showPatientModal && patients.length === 0) {
      loadPatients()
    }
  }, [showPatientModal])

  const loadPatients = async () => {
    setLoadingPatients(true)
    try {
      const params: PatientQueryParams = {
        _page: 1,
        _count: 50,
      }

      // Cache patient list for 15 minutes since it doesn't change frequently
      const response: ApiResponse<PaginatedResponse<PatientForSelection>> = await apiClient.get(
        "/api/fhir/Patient",
        params,
        { ttl: 15 * 60 * 1000 }, // 15 minutes cache
      )

      if (response.success && response.data) {
        setPatients(response.data.data)
      }
    } catch (error) {
      console.error("Error loading patients:", error)
      if ((error as Error).message?.includes("429")) {
        Alert.alert("Rate Limit", "Too many requests. Using cached data if available.")
      } else {
        Alert.alert("Error", "Failed to load patients. Please try again.")
      }
    } finally {
      setLoadingPatients(false)
    }
  }

  const validateForm = (): boolean => {
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

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields correctly.")
      return
    }

    setLoading(true)
    try {
      const pregnancyData: PregnancyCreateRequest = {
        patientId: formData.patientId,
        lastMenstrualPeriod: formData.lastMenstrualPeriod,
        estimatedDueDate: formData.estimatedDueDate,
        currentWeek: Number.parseInt(formData.currentWeek),
        riskLevel: formData.riskLevel,
        complications: formData.complications || undefined,
        previousPregnancies: formData.previousPregnancies || undefined,
        currentSymptoms: formData.currentSymptoms || undefined,
        bloodPressure: formData.bloodPressure || undefined,
        weight: Number.parseFloat(formData.weight),
        height: Number.parseFloat(formData.height),
        prenatalVitamins: formData.prenatalVitamins,
        smokingStatus: formData.smokingStatus,
        alcoholConsumption: formData.alcoholConsumption,
        notes: formData.notes || undefined,
      }

      const response: ApiResponse<PregnancyResponse> = await apiClient.post("/api/fhir/pregnancy", pregnancyData)

      if (response.success) {
        Alert.alert("Success", "Pregnancy record has been created successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      } else {
        throw new Error(response.message || "Failed to create pregnancy record")
      }
    } catch (error) {
      console.error("Error creating pregnancy:", error)
      Alert.alert("Error", "Failed to create pregnancy record. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const selectPatient = (patient: PatientForSelection) => {
    updateFormData("patientId", patient.id)
    updateFormData("patientName", patient.name)
    setShowPatientModal(false)
  }

  const selectRiskLevel = (risk: (typeof riskLevels)[number]) => {
    updateFormData("riskLevel", risk.id)
    updateFormData("riskLevelLabel", risk.label)
    setShowRiskModal(false)
  }

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    multiline = false,
    keyboardType: KeyboardTypeOptions = "default",
  ) => {
    const isRequired = ["lastMenstrualPeriod", "estimatedDueDate", "currentWeek", "weight", "height"].includes(field)

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>
          {label}
          {isRequired && <Text style={styles.required}> *</Text>}
        </Text>
        <TextInput
          style={[styles.input, multiline && styles.textArea, errors[field as keyof FormErrors] && styles.inputError]}
          placeholder={placeholder}
          value={String(formData[field])}
          onChangeText={(value) => updateFormData(field, value)}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          keyboardType={keyboardType}
          editable={!loading}
        />
        {errors[field as keyof FormErrors] && <Text style={styles.errorText}>{errors[field as keyof FormErrors]}</Text>}
      </View>
    )
  }

  const renderPatientItem = ({ item }: { item: PatientForSelection }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectPatient(item)}>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientEmail}>{item.email}</Text>
        <Text style={styles.patientPhone}>{item.phone}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
    </TouchableOpacity>
  )

  const renderRiskItem = ({ item }: { item: (typeof riskLevels)[number] }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectRiskLevel(item)}>
      <View style={styles.riskInfo}>
        <View style={[styles.riskDot, { backgroundColor: item.color }]} />
        <Text style={styles.riskLabel}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={loading}>
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
              disabled={loading}
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

          {renderInput("Last Menstrual Period", "lastMenstrualPeriod", "YYYY-MM-DD")}
          {renderInput("Estimated Due Date", "estimatedDueDate", "YYYY-MM-DD")}
          {renderInput("Current Week", "currentWeek", "e.g., 12", false, "numeric")}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Risk Level</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setShowRiskModal(true)} disabled={loading}>
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
              onValueChange={(value) => updateFormData("prenatalVitamins", value)}
              trackColor={{ false: Colors.neutral[300], true: Colors.success[200] }}
              thumbColor={formData.prenatalVitamins ? Colors.success[500] : Colors.neutral[500]}
              disabled={loading}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Smoking</Text>
              <Text style={styles.switchDescription}>Currently smoking or recently quit</Text>
            </View>
            <Switch
              value={formData.smokingStatus}
              onValueChange={(value) => updateFormData("smokingStatus", value)}
              trackColor={{ false: Colors.neutral[300], true: Colors.error[200] }}
              thumbColor={formData.smokingStatus ? Colors.error[500] : Colors.neutral[500]}
              disabled={loading}
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Alcohol Consumption</Text>
              <Text style={styles.switchDescription}>Currently consuming alcohol</Text>
            </View>
            <Switch
              value={formData.alcoholConsumption}
              onValueChange={(value) => updateFormData("alcoholConsumption", value)}
              trackColor={{ false: Colors.neutral[300], true: Colors.error[200] }}
              thumbColor={formData.alcoholConsumption ? Colors.error[500] : Colors.neutral[500]}
              disabled={loading}
            />
          </View>

          {renderInput("Additional Notes", "notes", "Enter any additional notes or observations", true)}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>{loading ? "Creating..." : "Create Pregnancy Record"}</Text>
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
            {loadingPatients ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading patients...</Text>
              </View>
            ) : (
              <FlatList
                data={patients}
                renderItem={renderPatientItem}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
              />
            )}
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
  saveButtonDisabled: {
    backgroundColor: Colors.neutral[400],
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
    marginBottom: 2,
  },
  patientPhone: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
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
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
})
