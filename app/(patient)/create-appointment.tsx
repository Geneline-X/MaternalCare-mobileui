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
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "@clerk/clerk-expo"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { FontSize } from "../../constants/fontSize"

interface Doctor {
  id: string
  name: string
  email: string
  role: string
  specialization?: string
}

interface AppointmentType {
  id: string
  label: string
  duration: number
  description: string
  color: string
}

interface TimeSlot {
  time: string
  available: boolean
  duration: number
}

const appointmentTypes: AppointmentType[] = [
  {
    id: "routine",
    label: "Routine Checkup",
    duration: 30,
    description: "Regular prenatal checkup and monitoring",
    color: Colors.primary[500],
  },
  {
    id: "ultrasound",
    label: "Ultrasound",
    duration: 45,
    description: "Ultrasound imaging and assessment",
    color: Colors.warning[500],
  },
  {
    id: "consultation",
    label: "Consultation",
    duration: 60,
    description: "Initial consultation or specialized discussion",
    color: Colors.success[500],
  },
  {
    id: "followup",
    label: "Follow-up Visit",
    duration: 20,
    description: "Follow-up on previous visit or test results",
    color: Colors.neutral[600],
  },
]

const timeSlots: TimeSlot[] = [
  { time: "09:00", available: true, duration: 30 },
  { time: "09:30", available: true, duration: 30 },
  { time: "10:00", available: false, duration: 30 },
  { time: "10:30", available: true, duration: 30 },
  { time: "11:00", available: true, duration: 30 },
  { time: "11:30", available: false, duration: 30 },
  { time: "14:00", available: true, duration: 30 },
  { time: "14:30", available: true, duration: 30 },
  { time: "15:00", available: true, duration: 30 },
  { time: "15:30", available: false, duration: 30 },
  { time: "16:00", available: true, duration: 30 },
  { time: "16:30", available: true, duration: 30 },
]

interface FormData {
  doctorId: string
  doctorName: string
  appointmentType: string
  appointmentTypeLabel: string
  date: string
  time: string
  duration: number
  reason: string
  notes: string
  preferredContact: "phone" | "email"
  reminderEnabled: boolean
}

interface FormErrors {
  doctorId?: string
  appointmentType?: string
  date?: string
  time?: string
  reason?: string
  [key: string]: string | undefined
}

const API_BASE_URL = "https://maternalcare-backend.onrender.com/api"

export default function CreateAppointment() {
  const router = useRouter()
  const { getToken } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    doctorId: "",
    doctorName: "",
    appointmentType: "routine",
    appointmentTypeLabel: "Routine Checkup",
    date: "",
    time: "",
    duration: 30,
    reason: "",
    notes: "",
    preferredContact: "phone",
    reminderEnabled: true,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const token = await getToken();
      const url = `${API_BASE_URL}/fhir/users/doctors`; // Updated URL with /fhir
      console.log("Loading doctors from:", url);
      console.log("Using token:", token ? "Token exists" : "No token");
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to fetch doctors: ${response.status} - ${response.statusText}`);
      }
  
      const doctorsList = await response.json();
      console.log("Doctors loaded:", doctorsList);
      setDoctors(doctorsList);
    } catch (error) {
      console.error("Error in loadDoctors:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to load doctors");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.doctorId) newErrors.doctorId = "Please select a doctor"
    if (!formData.date.trim()) newErrors.date = "Please select a date"
    if (!formData.time.trim()) newErrors.time = "Please select a time"
    if (!formData.reason.trim()) newErrors.reason = "Please provide a reason for the appointment"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateAppointment = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields.")
      return
    }

    setLoading(true)
    try {
      const token = await getToken()
      console.log("Creating appointment with data:", formData)

      const appointmentData = {
        doctorId: formData.doctorId,
        appointmentType: formData.appointmentType,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        reason: formData.reason,
        notes: formData.notes || undefined,
        preferredContact: formData.preferredContact,
        reminderEnabled: formData.reminderEnabled,
      }

      const response = await fetch(`${API_BASE_URL}/fhir/Appointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(appointmentData),
      })

      console.log("Create appointment response status:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Create appointment error:", errorData)
        throw new Error(`Failed to create appointment: ${response.statusText}`)
      }

      const appointment = await response.json()
      console.log("Appointment created successfully:", appointment)

      Alert.alert(
        "Appointment Request Sent",
        "Your appointment request has been sent to the doctor. You will receive a confirmation shortly.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      )
    } catch (error) {
      console.error("Error creating appointment:", error)
      Alert.alert("Error", "Failed to create appointment. Please try again.", [{ text: "OK" }])
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const selectDoctor = (doctor: Doctor) => {
    updateFormData("doctorId", doctor.id)
    updateFormData("doctorName", doctor.name)
    setShowDoctorModal(false)
  }

  const selectAppointmentType = (type: AppointmentType) => {
    updateFormData("appointmentType", type.id)
    updateFormData("appointmentTypeLabel", type.label)
    updateFormData("duration", type.duration)
    setShowTypeModal(false)
  }

  const selectTime = (time: string) => {
    updateFormData("time", time)
    setShowTimeModal(false)
  }

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectDoctor(item)}>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorSpecialty}>{item.specialization || "General Practice"}</Text>
        <Text style={styles.doctorEmail}>{item.email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
    </TouchableOpacity>
  )

  const renderAppointmentTypeItem = ({ item }: { item: AppointmentType }) => (
    <TouchableOpacity style={styles.modalItem} onPress={() => selectAppointmentType(item)}>
      <View style={styles.appointmentTypeInfo}>
        <View style={styles.typeHeader}>
          <View style={[styles.typeDot, { backgroundColor: item.color }]} />
          <View style={styles.typeDetails}>
            <Text style={styles.typeLabel}>{item.label}</Text>
            <Text style={styles.typeDuration}>{item.duration} min</Text>
          </View>
        </View>
        <Text style={styles.typeDescription}>{item.description}</Text>
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
        <Text style={styles.title}>Book Appointment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Doctor</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Choose Doctor <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selector, errors.doctorId && styles.inputError]}
              onPress={() => setShowDoctorModal(true)}
            >
              <Text style={[styles.selectorText, !formData.doctorName && styles.placeholder]}>
                {formData.doctorName || "Select a doctor"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
            {errors.doctorId && <Text style={styles.errorText}>{errors.doctorId}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Appointment Type</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setShowTypeModal(true)}>
              <View style={styles.appointmentTypeSelector}>
                <View
                  style={[
                    styles.typeDot,
                    {
                      backgroundColor:
                        appointmentTypes.find((t) => t.id === formData.appointmentType)?.color || Colors.primary[500],
                    },
                  ]}
                />
                <View>
                  <Text style={styles.selectorText}>{formData.appointmentTypeLabel}</Text>
                  <Text style={styles.durationText}>{formData.duration} min</Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Date <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.date && styles.inputError]}
                  placeholder="YYYY-MM-DD"
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
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Reason for Visit <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.reason && styles.inputError]}
              placeholder="Brief description of your concern"
              value={formData.reason}
              onChangeText={(value) => updateFormData("reason", value)}
              multiline
              numberOfLines={3}
            />
            {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Additional Notes</Text>
            <TextInput
              style={styles.input}
              placeholder="Any additional information or special requests"
              value={formData.notes}
              onChangeText={(value) => updateFormData("notes", value)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preferred Contact Method</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity style={styles.radioOption} onPress={() => updateFormData("preferredContact", "phone")}>
                <View style={styles.radioButton}>
                  {formData.preferredContact === "phone" && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioLabel}>Phone</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption} onPress={() => updateFormData("preferredContact", "email")}>
                <View style={styles.radioButton}>
                  {formData.preferredContact === "email" && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioLabel}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreateAppointment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.createButtonText}>Book Appointment</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Doctor Selection Modal */}
      <Modal
        visible={showDoctorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDoctorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Doctor</Text>
              <TouchableOpacity onPress={() => setShowDoctorModal(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
            {loadingDoctors ? (
              <View style={styles.emptyDoctors}>
                <ActivityIndicator size="large" color={Colors.primary[500]} />
                <Text style={styles.emptyDoctorsText}>Loading doctors...</Text>
              </View>
            ) : doctors.length === 0 ? (
              <View style={styles.emptyDoctors}>
                <Text style={styles.emptyDoctorsText}>No doctors available</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadDoctors}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={doctors}
                renderItem={renderDoctorItem}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Appointment Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Appointment Type</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={appointmentTypes}
              renderItem={renderAppointmentTypeItem}
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
            <Text style={styles.timeNote}>Available time slots for selected date</Text>
            <FlatList
              data={timeSlots}
              renderItem={renderTimeSlotItem}
              keyExtractor={(item) => item.time}
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
    fontSize: FontSize.xl,
    fontWeight: "bold",
    color: Colors.neutral[800],
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
    fontSize: FontSize.lg,
    fontWeight: "bold",
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
    fontSize: FontSize.sm,
    fontWeight: "500",
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
    fontSize: FontSize.md,
    color: Colors.neutral[800],
    backgroundColor: Colors.white,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: Colors.error[500],
  },
  errorText: {
    fontSize: FontSize.xs,
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
    fontSize: FontSize.md,
    color: Colors.neutral[800],
  },
  placeholder: {
    color: Colors.neutral[500],
    width: 40,
  },
  appointmentTypeSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  durationText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
  },
  radioGroup: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    marginRight: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary[500],
  },
  radioLabel: {
    fontSize: FontSize.md,
    color: Colors.neutral[700],
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
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.neutral[700],
  },
  createButton: {
    flex: 1,
    backgroundColor: Colors.primary[500],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: Colors.neutral[400],
  },
  createButtonText: {
    fontSize: FontSize.md,
    fontWeight: "600",
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
    maxHeight: "80%",
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
    fontSize: FontSize.lg,
    fontWeight: "bold",
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
  emptyDoctors: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptyDoctorsText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.neutral[600],
  },
  retryButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: "600",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: FontSize.md,
    fontWeight: "bold",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    marginBottom: 2,
  },
  doctorEmail: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
  },
  appointmentTypeInfo: {
    flex: 1,
  },
  typeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typeDetails: {
    flex: 1,
  },
  typeLabel: {
    fontSize: FontSize.md,
    fontWeight: "500",
    color: Colors.neutral[800],
  },
  typeDuration: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
  },
  typeDescription: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    marginLeft: 20,
  },
  timeNote: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  timeGrid: {
    padding: Spacing.md,
  },
  timeSlot: {
    flex: 1,
    backgroundColor: Colors.primary[100],
    margin: 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    minWidth: 80,
  },
  timeSlotDisabled: {
    backgroundColor: Colors.neutral[100],
  },
  timeSlotText: {
    fontSize: FontSize.sm,
    fontWeight: "500",
    color: Colors.primary[700],
  },
  timeSlotTextDisabled: {
    color: Colors.neutral[400],
  },
})
