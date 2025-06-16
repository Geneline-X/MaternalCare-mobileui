"use client"

import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "@/constants/colors"
import { LineChart } from "react-native-chart-kit"

const screenWidth = Dimensions.get("window").width

// Mock patient data - in real app, this would come from API
const getPatientData = (patientId: string) => {
  const patients = {
    "1": {
      id: "1",
      name: "Sarah Johnson",
      age: 28,
      phone: "+1 (555) 123-4567",
      email: "sarah.johnson@email.com",
      emergencyContact: "John Johnson - +1 (555) 987-6543",
      pregnancyWeek: 24,
      dueDate: "2024-08-15",
      trimester: "Second",
      riskLevel: "Low",
      bloodType: "O+",
      lastVisit: "2024-01-15",
      nextAppointment: "2024-02-15",
      weight: "65 kg",
      bloodPressure: "120/80",
      heartRate: "72 bpm",
      conditions: ["Gestational Diabetes"],
      medications: ["Prenatal Vitamins", "Iron Supplements"],
      allergies: ["Penicillin"],
    },
    "2": {
      id: "2",
      name: "Emily Davis",
      age: 32,
      phone: "+1 (555) 234-5678",
      email: "emily.davis@email.com",
      emergencyContact: "Michael Davis - +1 (555) 876-5432",
      pregnancyWeek: 32,
      dueDate: "2024-06-20",
      trimester: "Third",
      riskLevel: "Medium",
      bloodType: "A+",
      lastVisit: "2024-02-01",
      nextAppointment: "2024-02-08",
      weight: "72 kg",
      bloodPressure: "130/85",
      heartRate: "78 bpm",
      conditions: ["Hypertension"],
      medications: ["Prenatal Vitamins", "Blood Pressure Medication"],
      allergies: ["None"],
    },
    // Add more patients as needed
  }

  return patients[patientId as keyof typeof patients] || patients["1"]
}

export default function PatientDetails() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const patient = getPatientData(patientId || "1")

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
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(patient.riskLevel) }]}>
            <Text style={styles.riskText}>{patient.riskLevel} Risk</Text>
          </View>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{patient.age} years</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Blood Type</Text>
            <Text style={styles.infoValue}>{patient.bloodType}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{patient.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{patient.email}</Text>
          </View>
        </View>
      </View>

      {/* Pregnancy Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Pregnancy</Text>
        <View style={styles.pregnancyInfo}>
          <View style={styles.pregnancyItem}>
            <Text style={styles.pregnancyNumber}>{patient.pregnancyWeek}</Text>
            <Text style={styles.pregnancyLabel}>Weeks</Text>
          </View>
          <View style={styles.pregnancyItem}>
            <Text style={styles.pregnancyNumber}>{patient.trimester}</Text>
            <Text style={styles.pregnancyLabel}>Trimester</Text>
          </View>
          <View style={styles.pregnancyItem}>
            <Text style={styles.pregnancyNumber}>{patient.dueDate}</Text>
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
            <Text style={styles.vitalValue}>{patient.weight}</Text>
            <Text style={styles.vitalLabel}>Weight</Text>
          </View>
          <View style={styles.vitalItem}>
            <Ionicons name="heart" size={24} color="#EF4444" />
            <Text style={styles.vitalValue}>{patient.bloodPressure}</Text>
            <Text style={styles.vitalLabel}>Blood Pressure</Text>
          </View>
          <View style={styles.vitalItem}>
            <Ionicons name="pulse" size={24} color="#10B981" />
            <Text style={styles.vitalValue}>{patient.heartRate}</Text>
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
        {patient.conditions.map((condition, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="medical" size={20} color={Colors.primary[500]} />
            <Text style={styles.listText}>{condition}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Medications</Text>
        {patient.medications.map((medication, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="medical" size={20} color="#10B981" />
            <Text style={styles.listText}>{medication}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Allergies</Text>
        {patient.allergies.map((allergy, index) => (
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
            <Text style={styles.appointmentDate}>{patient.nextAppointment}</Text>
            <Text style={styles.appointmentType}>Regular Checkup</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Visits</Text>
        <View style={styles.appointmentItem}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentDate}>{patient.lastVisit}</Text>
            <Text style={styles.appointmentType}>Routine Checkup - Completed</Text>
          </View>
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{patient.name}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
      </View>

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
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.neutral[800],
  },
  moreButton: {
    padding: 5,
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
})
