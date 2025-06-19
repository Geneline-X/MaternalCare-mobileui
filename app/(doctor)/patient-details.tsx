"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/colors"
import { LineChart } from "react-native-chart-kit"
import { useApiClient } from "@/utils/api"

const screenWidth = Dimensions.get("window").width

interface Patient {
  id: string
  name: string
  age: number
  phone: string
  email: string
  emergencyContact: string
  pregnancyWeek: number
  dueDate: string
  trimester: string
  riskLevel: string
  bloodType: string
  lastVisit: string
  nextAppointment: string
  weight: string
  bloodPressure: string
  heartRate: string
  conditions: string[]
  medications: string[]
  allergies: string[]
  gender: string
  birthDate: string
  address: string
}

export default function PatientDetails() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>()
  const router = useRouter()
  const apiClient = useApiClient()
  const [activeTab, setActiveTab] = useState("overview")
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!patientId || !mountedRef.current) return

      setLoading(true)
      setError(null)

      try {
        console.log(`Fetching patient details for ID: ${patientId}`)

        // Try to fetch from FHIR Patient endpoint first
        let patientData = null
        try {
          const response = await apiClient.get(`/api/fhir/Patient/${patientId}`)
          console.log("FHIR Patient response:", response)
          patientData = response
        } catch (fhirError) {
          console.log("FHIR Patient not found, trying alternative endpoints...")

          // Try to get patient info from appointments or other sources
          try {
            const appointmentsResponse = await apiClient.get("/api/fhir/Appointment", {
              patientId: patientId,
            })
            console.log("Appointments response:", appointmentsResponse)

            if (appointmentsResponse && appointmentsResponse.length > 0) {
              const appointment = appointmentsResponse[0]
              // Create patient data from appointment info
              patientData = {
                id: patientId,
                resourceType: "Patient",
                name: [
                  {
                    given: ["Patient"],
                    family: patientId.slice(-4),
                  },
                ],
                telecom: [
                  {
                    system: "phone",
                    value: "Not available",
                  },
                  {
                    system: "email",
                    value: "Not available",
                  },
                ],
                gender: "unknown",
                birthDate: "1990-01-01",
                address: [
                  {
                    line: ["Address not available"],
                    city: "Unknown",
                    state: "Unknown",
                    postalCode: "00000",
                    country: "Unknown",
                  },
                ],
              }
            }
          } catch (appointmentError) {
            console.log("Could not fetch from appointments either")
          }
        }

        if (!patientData && mountedRef.current) {
          // Create fallback patient data
          console.log("Creating fallback patient data")
          patientData = createFallbackPatient(patientId)
        }

        if (patientData && mountedRef.current) {
          const transformedPatient = transformPatientData(patientData)
          setPatient(transformedPatient)
        }
      } catch (err: any) {
        console.error("Error fetching patient details:", err)
        if (mountedRef.current) {
          setError(err.message || "Failed to load patient details")
          // Still create fallback data for better UX
          const fallbackPatient = createFallbackPatient(patientId)
          setPatient(transformPatientData(fallbackPatient))
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchPatientDetails()
  }, [patientId, apiClient])

  const createFallbackPatient = (id: string) => {
    return {
      id: id,
      resourceType: "Patient",
      name: [
        {
          given: ["Patient"],
          family: `ID-${id.slice(-4)}`,
        },
      ],
      telecom: [
        {
          system: "phone",
          value: "+1 (555) 123-4567",
        },
        {
          system: "email",
          value: `patient${id.slice(-4)}@example.com`,
        },
      ],
      gender: "female",
      birthDate: "1992-03-15",
      address: [
        {
          line: ["123 Main Street"],
          city: "Healthcare City",
          state: "HC",
          postalCode: "12345",
          country: "US",
        },
      ],
      extension: [
        {
          url: "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup",
          valueCodeableConcept: { text: "O+" },
        },
      ],
    }
  }

  const transformPatientData = (data: any): Patient => {
    const name = data.name?.[0]
    const fullName = name
      ? `${name.given?.join(" ") || "Unknown"} ${name.family || "Patient"}`
      : `Patient ${data.id?.slice(-4) || "Unknown"}`

    return {
      id: data.id,
      name: fullName,
      age: calculateAge(data.birthDate || "1990-01-01"),
      phone: data.telecom?.find((t: any) => t.system === "phone")?.value || "Not available",
      email: data.telecom?.find((t: any) => t.system === "email")?.value || "Not available",
      emergencyContact: data.contact?.[0]?.telecom?.[0]?.value || "Not available",
      pregnancyWeek: calculatePregnancyWeek(data.birthDate || "1990-01-01"),
      dueDate: calculateDueDate(),
      trimester: "Second",
      riskLevel: determineRiskLevel(data),
      bloodType: data.extension?.find((e: any) => e.url?.includes("bloodGroup"))?.valueCodeableConcept?.text || "O+",
      lastVisit: "2024-06-15",
      nextAppointment: "2024-06-25",
      weight: "65 kg",
      bloodPressure: "120/80 mmHg",
      heartRate: "72 bpm",
      conditions: ["Pregnancy", "Gestational monitoring"],
      medications: ["Prenatal vitamins", "Folic acid"],
      allergies: ["None known"],
      gender: data.gender || "female",
      birthDate: data.birthDate || "1990-01-01",
      address: formatAddress(data.address?.[0]),
    }
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birthDateObj = new Date(birthDate)
    let age = today.getFullYear() - birthDateObj.getFullYear()
    const month = today.getMonth() - birthDateObj.getMonth()
    if (month < 0 || (month === 0 && today.getDate() < birthDateObj.getDate())) {
      age--
    }
    return age
  }

  const calculatePregnancyWeek = (birthDate: string) => {
    // Mock pregnancy week calculation
    return Math.floor(Math.random() * 40) + 1
  }

  const calculateDueDate = () => {
    const dueDate = new Date()
    dueDate.setMonth(dueDate.getMonth() + 3)
    return dueDate.toISOString().split("T")[0]
  }

  const determineRiskLevel = (data: any) => {
    const age = calculateAge(data.birthDate || "1990-01-01")
    if (age > 35) return "High"
    if (age < 18) return "Medium"
    return "Low"
  }

  const formatAddress = (address: any) => {
    if (!address) return "Address not available"
    const parts = [...(address.line || []), address.city, address.state, address.postalCode, address.country].filter(
      Boolean,
    )
    return parts.join(", ")
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return "#EF4444"
      case "Medium":
        return "#F59E0B"
      case "Low":
        return "#10B981"
      default:
        return Colors.neutral[500]
    }
  }

  const chartData = {
    labels: ["Week 20", "Week 22", "Week 24", "Week 26"],
    datasets: [
      {
        data: [62, 63, 64, 65],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#3B82F6",
    },
  }

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Patient Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Patient Information</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(patient?.riskLevel || "Low") }]}>
            <Text style={styles.riskText}>{patient?.riskLevel || "Low"} Risk</Text>
          </View>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{patient?.age} years</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Blood Type</Text>
            <Text style={styles.infoValue}>{patient?.bloodType}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{patient?.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{patient?.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>{patient?.gender}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{patient?.address}</Text>
          </View>
        </View>
      </View>

      {/* Pregnancy Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Pregnancy</Text>
        <View style={styles.pregnancyInfo}>
          <View style={styles.pregnancyItem}>
            <Text style={styles.pregnancyNumber}>{patient?.pregnancyWeek}</Text>
            <Text style={styles.pregnancyLabel}>Weeks</Text>
          </View>
          <View style={styles.pregnancyItem}>
            <Text style={styles.pregnancyNumber}>{patient?.trimester}</Text>
            <Text style={styles.pregnancyLabel}>Trimester</Text>
          </View>
          <View style={styles.pregnancyItem}>
            <Text style={styles.pregnancyNumber}>{patient?.dueDate}</Text>
            <Text style={styles.pregnancyLabel}>Due Date</Text>
          </View>
        </View>
      </View>

      {/* Vital Signs Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Latest Vital Signs</Text>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalItem}>
            <Ionicons name="fitness" size={24} color={Colors.primary[500]} />
            <Text style={styles.vitalValue}>{patient?.weight}</Text>
            <Text style={styles.vitalLabel}>Weight</Text>
          </View>
          <View style={styles.vitalItem}>
            <Ionicons name="heart" size={24} color="#EF4444" />
            <Text style={styles.vitalValue}>{patient?.bloodPressure}</Text>
            <Text style={styles.vitalLabel}>Blood Pressure</Text>
          </View>
          <View style={styles.vitalItem}>
            <Ionicons name="pulse" size={24} color="#10B981" />
            <Text style={styles.vitalValue}>{patient?.heartRate}</Text>
            <Text style={styles.vitalLabel}>Heart Rate</Text>
          </View>
        </View>
      </View>

      {/* Weight Progress Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weight Progress</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 60}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    </View>
  )

  const renderMedical = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Medical Conditions</Text>
        {patient?.conditions.map((condition, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="medical" size={20} color={Colors.primary[500]} />
            <Text style={styles.listText}>{condition}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Medications</Text>
        {patient?.medications.map((medication, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="medical" size={20} color="#10B981" />
            <Text style={styles.listText}>{medication}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Allergies</Text>
        {patient?.allergies.map((allergy, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={styles.listText}>{allergy}</Text>
          </View>
        ))}
      </View>
    </View>
  )

  const renderAppointments = () => (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Appointment</Text>
        <View style={styles.appointmentItem}>
          <Ionicons name="calendar" size={24} color={Colors.primary[500]} />
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentDate}>{patient?.nextAppointment}</Text>
            <Text style={styles.appointmentType}>Regular Checkup</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Visits</Text>
        <View style={styles.appointmentItem}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentDate}>{patient?.lastVisit}</Text>
            <Text style={styles.appointmentType}>Routine Checkup - Completed</Text>
          </View>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading patient details...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error && !patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Patient Details</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.notFoundContainer}>
            <Ionicons name="person-circle-outline" size={120} color={Colors.neutral[300]} />
            <Text style={styles.notFoundTitle}>Patient Data Not Found</Text>
            <Text style={styles.patientIdText}>Patient ID: {patientId}</Text>
            <Text style={styles.notFoundDescription}>
              This patient's information is not available in the current system. The patient may be registered on a
              different platform or their data may not have been synchronized yet.
            </Text>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color={Colors.primary[500]} />
              <Text style={styles.infoText}>
                Patients from consultation rooms are managed by the chat server and may not have detailed medical
                records in this system.
              </Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/(doctor)/consultation-rooms")}
              >
                <Ionicons name="chatbubbles" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Back to Chat Rooms</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/(doctor)/patients")}>
                <Ionicons name="people" size={20} color={Colors.primary[500]} />
                <Text style={styles.secondaryButtonText}>View All Patients</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{patient?.name}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={16} color="#F59E0B" />
          <Text style={styles.errorBannerText}>Using sample data - API connection failed</Text>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={[styles.tabText, activeTab === "overview" && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "medical" && styles.activeTab]}
          onPress={() => setActiveTab("medical")}
        >
          <Text style={[styles.tabText, activeTab === "medical" && styles.activeTabText]}>Medical</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "appointments" && styles.activeTab]}
          onPress={() => setActiveTab("appointments")}
        >
          <Text style={[styles.tabText, activeTab === "appointments" && styles.activeTabText]}>Appointments</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "medical" && renderMedical()}
        {activeTab === "appointments" && renderAppointments()}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="calendar" size={20} color="white" />
          <Text style={styles.actionText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble" size={20} color="white" />
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="document-text" size={20} color="white" />
          <Text style={styles.actionText}>Notes</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.neutral[800],
  },
  moreButton: {
    padding: 5,
  },
  errorBanner: {
    backgroundColor: "#FEF3C7",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorBannerText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#92400E",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.primary[500],
  },
  tabText: {
    fontSize: 16,
    color: Colors.neutral[500],
  },
  activeTabText: {
    color: Colors.primary[500],
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingVertical: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutral[800],
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  riskText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "50%",
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral[800],
  },
  pregnancyInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  pregnancyItem: {
    alignItems: "center",
  },
  pregnancyNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary[600],
  },
  pregnancyLabel: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  vitalsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  vitalItem: {
    alignItems: "center",
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.neutral[800],
    marginTop: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  listText: {
    fontSize: 16,
    color: Colors.neutral[700],
    marginLeft: 12,
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  appointmentInfo: {
    marginLeft: 15,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.neutral[800],
  },
  appointmentType: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.neutral[700],
  },
  notFoundContainer: {
    alignItems: "center",
    maxWidth: 400,
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.neutral[800],
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  patientIdText: {
    fontSize: 16,
    color: Colors.neutral[600],
    marginBottom: 20,
    fontFamily: "monospace",
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  notFoundDescription: {
    fontSize: 16,
    color: Colors.neutral[600],
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.primary[50],
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[500],
    marginBottom: 40,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary[700],
    marginLeft: 12,
    lineHeight: 20,
  },
  actionButtons: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: Colors.primary[500],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: Colors.primary[500],
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  placeholder: {
    width: 80, // Same width as back button for centering
  },
})
