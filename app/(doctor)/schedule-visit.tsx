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
  Modal,
  FlatList,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { useApiClient } from "../../utils/api"
import { useToast } from "react-native-toast-notifications"
import type { PatientForSelection, PaginatedResponse, ScheduleAvailability, TimeSlot } from "../../types/api"

interface VisitType {
  id: string
  label: string
  duration: string
  color: string
}

interface FormData {
  patientId: string
  patientName: string
  visitType: string
  visitTypeLabel: string
  date: string
  time: string
  duration: string
  location: string
  notes: string
  reminderEnabled: boolean
  videoCall: boolean
}

interface FormErrors {
  patientId?: string
  date?: string
  time?: string
  location?: string
}

const visitTypes: VisitType[] = [
  { id: "routine", label: "Routine Checkup", duration: "30 min", color: Colors.primary[500] },
  { id: "ultrasound", label: "Ultrasound", duration: "45 min", color: Colors.warning[500] },
  { id: "followup", label: "Follow-up Visit", duration: "20 min", color: Colors.success[500] },
  { id: "emergency", label: "Emergency Consultation", duration: "60 min", color: Colors.error[500] },
  { id: "consultation", label: "Initial Consultation", duration: "60 min", color: Colors.warning[500] },
]

export default function ScheduleVisit() {
  const router = useRouter()
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showVisitTypeModal, setShowVisitTypeModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [patients, setPatients] = useState<PatientForSelection[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const apiClient = useApiClient()
  const toast = useToast()

  const [formData, setFormData] = useState<FormData>({
    patientId: "",
    patientName: "",
    visitType: "routine",
    visitTypeLabel: "Routine Checkup",
    date: "",
    time: "",
    duration: "30 min",
    location: "Clinic Room 1",
    notes: "",
    reminderEnabled: true,
    videoCall: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get<PaginatedResponse<PatientForSelection>>("/api/fhir/Patient", {
        _page: 1,
        _count: 50,
        active: true,
      })

      if (response.success && response.data) {
        setPatients(response.data)
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast.show("Failed to load patients", { type: "danger" })
    }
  }

  const fetchTimeSlots = async (date: string) => {
    if (!date) return

    try {
      const response = await apiClient.get<{ success: boolean; data: ScheduleAvailability; timestamp: string }>(
        "/api/fhir/schedule/availability",
        {
          date: date,
          duration: Number.parseInt(formData.duration.split(" ")[0]),
        },
      )

      if (response.success && response.data) {
        setTimeSlots(response.data.data.timeSlots)
      }
    } catch (error) {
      console.error("Error fetching time slots:", error)
      toast.show("Failed to load available times", { type: "danger" })
    }
  }

  useEffect(() => {
    if (formData.date) {
      fetchTimeSlots(formData.date)
    }
  }, [formData.date, formData.duration])

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.patientId) newErrors.patientId = "Please select a patient"
    if (!formData.date.trim()) newErrors.date = "Please select a date"
    if (!formData.time.trim()) newErrors.time = "Please select a time"
    if (!formData.location.trim()) newErrors.location = "Location is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSchedule = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields.")
      return
    }

    setLoading(true)
    try {
      const appointmentData = {
        patientId: formData.patientId,
        doctorId: "req.user.id",
        date: formData.date,
        time: formData.time,
        duration: Number.parseInt(formData.duration.split(" ")[0]),
        type: formData.visitType,
        location: formData.location,
        notes: formData.notes,
        status: "scheduled",
      }

      const response = await apiClient.post<any>("/api/appointments", appointmentData)

      if (response.success) {
        Alert.alert("Success", "Appointment has been scheduled successfully!", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      } else {
        Alert.alert("Error", "Failed to schedule appointment")
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error)
      Alert.alert("Error", "Failed to schedule appointment")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: FormData[keyof FormData]) => {
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

  const selectVisitType = (visitType: VisitType) => {
    updateFormData("visitType", visitType.id)
    updateFormData("visitTypeLabel", visitType.label)
    updateFormData("duration", visitType.duration)
    setShowVisitTypeModal(false)
  }

  const selectTime = (time: string) => {
    updateFormData("time", time)
    setShowTimeModal(false)
  }

  const openPatientModal = () => {
    fetchPatients()
    setShowPatientModal(true)
  }

  const openTimeModal = () => {
    if (!formData.date) {
      toast.show("Please select a date first", { type: "warning" })
      return
    }
    setShowTimeModal(true)
  }

  const renderInput = (label: string, field: keyof FormErrors, placeholder: string, multiline = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {["patientId", "date", "time", "location"].includes(field) && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea, errors[field] && styles.inputError]}
        placeholder={placeholder}
        value={String(formData[field as keyof FormData])}
        onChangeText={(value) => updateFormData(field as keyof FormData, value)}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  )

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

  const renderVisitTypeItem = ({ item }: { item: VisitType }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectVisitType(item)}>
      <View style={styles.visitTypeInfo}>
        <Text style={styles.visitTypeLabel}>{item.label}</Text>
        <Text style={styles.visitTypeDuration}>{item.duration}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
    </TouchableOpacity>
  )

  const renderTimeSlotItem = ({ item }: { item: TimeSlot }) => (
    <TouchableOpacity
      style={[styles.timeSlot, !item.available && styles.timeSlotDisabled]}
      onPress={() => item.available && selectTime(item.time)}
      disabled={!item.available}
    >
      <Text style={[styles.timeSlotText, !item.available && styles.timeSlotTextDisabled]}>{item.time}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.title}>Schedule Visit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient & Visit Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Select Patient <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selector, errors.patientId && styles.inputError]}
              onPress={openPatientModal}
            >
              <Text style={[styles.selectorText, !formData.patientName && styles.placeholder]}>
                {formData.patientName || "Choose a patient"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
            {errors.patientId && <Text style={styles.errorText}>{errors.patientId}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Visit Type</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setShowVisitTypeModal(true)}>
              <View style={styles.visitTypeSelector}>
                <View
                  style={[
                    styles.visitTypeDot,
                    {
                      backgroundColor:
                        visitTypes.find((v) => v.id === formData.visitType)?.color || Colors.primary[500],
                    },
                  ]}
                />
                <View>
                  <Text style={styles.selectorText}>{formData.visitTypeLabel}</Text>
                  <Text style={styles.durationText}>{formData.duration}</Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Date <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.date && styles.inputError]}
                  placeholder="DD/MM/YYYY"
                  value={formData.date}
                  onChangeText={(value) => updateFormData("date", value)}
                />
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              </View>
            </View>
            <View style={styles.halfWidth}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Time <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity style={[styles.selector, errors.time && styles.inputError]} onPress={openTimeModal}>
                  <Text style={[styles.selectorText, !formData.time && styles.placeholder]}>
                    {formData.time || "Select time"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
                </TouchableOpacity>
                {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Notes</Text>

          {renderInput("Location", "location", "e.g., Clinic Room 1, Video Call")}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter any additional notes or special instructions"
              value={formData.notes}
              onChangeText={(value) => updateFormData("notes", value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.scheduleButton, loading && styles.disabledButton]}
            onPress={handleSchedule}
            disabled={loading}
          >
            <Text style={styles.scheduleButtonText}>{loading ? "Scheduling..." : "Schedule Appointment"}</Text>
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
              data={patients}
              renderItem={renderPatientItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Visit Type Selection Modal */}
      <Modal
        visible={showVisitTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVisitTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Visit Type</Text>
              <TouchableOpacity onPress={() => setShowVisitTypeModal(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={visitTypes}
              renderItem={renderVisitTypeItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Time Selection Modal */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={timeSlots}
              renderItem={renderTimeSlotItem}
              keyExtractor={(item: TimeSlot) => item.time}
              numColumns={3}
              style={styles.modalList}
              contentContainerStyle={styles.timeGrid}
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
  visitTypeSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  visitTypeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  durationText: {
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
  scheduleButton: {
    flex: 1,
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  scheduleButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
  disabledButton: {
    backgroundColor: Colors.neutral[300],
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
  visitTypeInfo: {
    flex: 1,
  },
  visitTypeLabel: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  visitTypeDuration: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  timeGrid: {
    padding: Spacing.md,
  },
  timeSlot: {
    flex: 1,
    backgroundColor: Colors.neutral[100],
    margin: 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    minWidth: 80,
  },
  timeSlotDisabled: {
    backgroundColor: Colors.neutral[200],
  },
  timeSlotText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
  },
  timeSlotTextDisabled: {
    color: Colors.neutral[400],
  },
})
