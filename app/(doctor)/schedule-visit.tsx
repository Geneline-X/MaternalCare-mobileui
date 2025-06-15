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
  Modal,
  FlatList,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { FormErrors } from "@/types/app"

interface Patient {
  id: string
  name: string
  email: string
  phone: string
}

interface VisitType {
  id: string
  label: string
  duration: string
  color: string
}

interface TimeSlot {
  time: string
  available: boolean
  duration: number
  appointmentId?: string
}

const mockPatients: Patient[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah.johnson@email.com", phone: "+1 (555) 123-4567" },
  { id: "2", name: "Emily Davis", email: "emily.davis@email.com", phone: "+1 (555) 234-5678" },
  { id: "3", name: "Maria Rodriguez", email: "maria.rodriguez@email.com", phone: "+1 (555) 345-6789" },
  { id: "4", name: "Jennifer Wilson", email: "jennifer.wilson@email.com", phone: "+1 (555) 456-7890" },
  { id: "5", name: "Lisa Anderson", email: "lisa.anderson@email.com", phone: "+1 (555) 567-8901" },
]

const visitTypes: VisitType[] = [
  { id: "routine", label: "Routine Checkup", duration: "30 min", color: Colors.primary[500] },
  { id: "ultrasound", label: "Ultrasound", duration: "45 min", color: Colors.warning[500] },
  { id: "followup", label: "Follow-up Visit", duration: "20 min", color: Colors.success[500] },
  { id: "emergency", label: "Emergency Consultation", duration: "60 min", color: Colors.error[500] },
  { id: "consultation", label: "Initial Consultation", duration: "60 min", color: Colors.warning[500] },
]

const timeSlots: TimeSlot[] = [
  { time: "08:00", available: true, duration: 30 },
  { time: "08:30", available: true, duration: 30 },
  { time: "09:00", available: true, duration: 30 },
  { time: "09:30", available: true, duration: 30 },
  { time: "10:00", available: true, duration: 30 },
  { time: "10:30", available: true, duration: 30 },
  { time: "11:00", available: true, duration: 30 },
  { time: "11:30", available: true, duration: 30 },
  { time: "12:00", available: true, duration: 30 },
  { time: "12:30", available: true, duration: 30 },
  { time: "13:00", available: true, duration: 30 },
  { time: "13:30", available: true, duration: 30 },
  { time: "14:00", available: true, duration: 30 },
  { time: "14:30", available: true, duration: 30 },
  { time: "15:00", available: true, duration: 30 },
  { time: "15:30", available: true, duration: 30 },
  { time: "16:00", available: true, duration: 30 },
  { time: "16:30", available: true, duration: 30 },
  { time: "17:00", available: true, duration: 30 },
  { time: "17:30", available: true, duration: 30 },
  { time: "18:00", available: true, duration: 30 },
]

export default function ScheduleVisit() {
  const router = useRouter()
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [showVisitTypeModal, setShowVisitTypeModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")

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

  interface FormErrors {
    patientId?: string
    patientName?: string
    visitType?: string
    visitTypeLabel?: string
    date?: string
    time?: string
    duration?: string
    location?: string
    notes?: string
    reminderEnabled?: string
    videoCall?: string
  }

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.patientId) newErrors.patientId = "Please select a patient"
    if (!formData.date.trim()) newErrors.date = "Please select a date"
    if (!formData.time.trim()) newErrors.time = "Please select a time"
    if (!formData.location.trim()) newErrors.location = "Location is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSchedule = () => {
    if (validateForm()) {
      Alert.alert("Success", "Appointment has been scheduled successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ])
    } else {
      Alert.alert("Error", "Please fill in all required fields.")
    }
  }

  const updateFormData = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const selectPatient = (patient: Patient) => {
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

  const renderInput = (label: string, field: keyof FormErrors, placeholder: string, multiline = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
        {["patientId", "date", "time", "location"].includes(field) && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea, errors[field] && styles.inputError]}
        placeholder={placeholder}   
        value={String(formData[field as keyof FormErrors])}
        onChangeText={(value) => updateFormData(field, value)}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  )

  const renderPatientItem = ({ item }: { item: Patient }) => (
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
    <TouchableOpacity style={styles.timeSlot} onPress={() => selectTime(item.time)}>
      <Text style={styles.timeSlotText}>{item.time}</Text>
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
              onPress={() => setShowPatientModal(true)}
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
                <TouchableOpacity
                  style={[styles.selector, errors.time && styles.inputError]}
                  onPress={() => setShowTimeModal(true)}
                >
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
          {renderInput("Notes", "notes", "Enter any additional notes or special instructions", true)}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
            <Text style={styles.scheduleButtonText}>Schedule Appointment</Text>
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
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  visitTypeDetails: {
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
  timeSlotText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
  },
})
