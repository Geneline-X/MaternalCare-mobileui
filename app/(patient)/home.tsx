"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { Bell, Settings, Calendar, Heart, Activity } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing } from "../../constants/spacing"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth, useUser } from "@clerk/clerk-expo"

interface DashboardData {
  patient: {
    name: string
  }
  pregnancySummary: {
    active: boolean
    estimatedDueDate: string
    gestationalAge: string
    nextAppointment: string
  }
  recentObservations: Array<{
    id: string
    type: string
    value: string
    date: string
  }>
  upcomingAppointments: Array<{
    id: string
    date: string
    type: string
    doctor: string
  }>
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

interface InfoRowProps {
  label: string
  value: string
}

export default function PatientDashboard() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  // Handle authentication redirect in useEffect, not during render
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/sign-in")
      return
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    // Only set dashboard data if user is authenticated
    if (isLoaded && isSignedIn) {
      setDashboardData({
        patient: {
          name: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Patient",
        },
        pregnancySummary: {
          active: true,
          estimatedDueDate: "2023-12-15",
          gestationalAge: "24 weeks",
          nextAppointment: "2023-06-15T10:00:00Z",
        },
        recentObservations: [
          { id: "1", type: "Blood Pressure", value: "120/80 mmHg", date: "2023-06-01" },
          { id: "2", type: "Weight", value: "65 kg", date: "2023-06-01" },
          { id: "3", type: "Heart Rate", value: "72 bpm", date: "2023-06-01" },
        ],
        upcomingAppointments: [
          {
            id: "apt-1",
            date: "2023-06-15T10:00:00Z",
            type: "Prenatal Checkup",
            doctor: "Dr. Sarah Wilson",
          },
          {
            id: "apt-2",
            date: "2023-06-20T14:30:00Z",
            type: "Ultrasound",
            doctor: "Dr. Michael Brown",
          },
        ],
      })
    }
  }, [isLoaded, isSignedIn, user])

  // Show loading while auth is being checked
  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    )
  }

  // Don't render anything if not signed in (redirect will happen in useEffect)
  if (!isSignedIn) {
    return null
  }

  // Show loading while dashboard data is being set
  if (!dashboardData) {
    return (
      <View style={styles.loading}>
        <Text>Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.primary[600], Colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>{dashboardData.patient.name}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/notifications")}>
                <View style={styles.iconContainer}>
                  <Bell size={20} color={Colors.white} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/settings")}>
                <View style={styles.iconContainer}>
                  <Settings size={20} color={Colors.white} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/(patient)/appointment")}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.primary[50] }]}>
            <Calendar size={24} color={Colors.primary[600]} />
          </View>
          <Text style={styles.actionText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.success[50] }]}>
            <Heart size={24} color={Colors.success[600]} />
          </View>
          <Text style={styles.actionText}>Health</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.warning[50] }]}>
            <Activity size={24} color={Colors.warning[600]} />
          </View>
          <Text style={styles.actionText}>Activity</Text>
        </TouchableOpacity>
      </View>

      {/* Pregnancy Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pregnancy Summary</Text>
        <LinearGradient
          colors={[Colors.primary[500], Colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: Colors.white }]}>Status</Text>
              <Text style={[styles.summaryValue, { color: Colors.white }]}>
                {dashboardData.pregnancySummary.active ? "Active" : "Completed"}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: Colors.white }]}>Due Date</Text>
              <Text style={[styles.summaryValue, { color: Colors.white }]}>
                {formatDate(dashboardData.pregnancySummary.estimatedDueDate)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: Colors.white }]}>Gestational Age</Text>
              <Text style={[styles.summaryValue, { color: Colors.white }]}>
                {dashboardData.pregnancySummary.gestationalAge}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        {dashboardData.upcomingAppointments.map((appointment) => (
          <TouchableOpacity
            key={appointment.id}
            style={styles.appointmentCard}
            onPress={() => router.push("/(patient)/appointment")}
          >
            <LinearGradient
              colors={[Colors.primary[400], Colors.primary[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.appointmentGradient}
            >
              <View style={styles.appointmentHeader}>
                <Text style={[styles.appointmentType, { color: Colors.white }]}>{appointment.type}</Text>
                <Text style={[styles.appointmentDate, { color: Colors.white }]}>{formatDate(appointment.date)}</Text>
              </View>
              <Text style={[styles.appointmentDoctor, { color: Colors.white }]}>with {appointment.doctor}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Observations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Observations</Text>
        <LinearGradient
          colors={[Colors.primary[500], Colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {dashboardData.recentObservations.map((observation) => (
            <View key={observation.id} style={styles.observationItem}>
              <View>
                <Text style={[styles.observationType, { color: Colors.white }]}>{observation.type}</Text>
                <Text style={[styles.observationDate, { color: Colors.white }]}>{formatDate(observation.date)}</Text>
              </View>
              <Text style={[styles.observationValue, { color: Colors.white }]}>{observation.value}</Text>
            </View>
          ))}
        </LinearGradient>
      </View>
    </ScrollView>
  )
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
)

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: Spacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral[50],
  },
  header: {
    borderRadius: 24,
    marginBottom: Spacing.xl,
    overflow: "hidden",
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGradient: {
    padding: Spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 14,
    color: Colors.white,
    marginBottom: Spacing.xs,
    fontFamily: "Inter-Regular",
    opacity: 0.9,
  },
  name: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.white,
    fontFamily: "Inter-SemiBold",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  actionButton: {
    alignItems: "center",
    width: "30%",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  actionText: {
    fontSize: 12,
    color: Colors.neutral[700],
    fontWeight: "500",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
    fontFamily: "Inter-SemiBold",
  },
  card: {
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  summaryItem: {
    width: "50%",
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
    fontFamily: "Inter-Regular",
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  appointmentCard: {
    borderRadius: 16,
    marginBottom: Spacing.md,
    overflow: "hidden",
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appointmentGradient: {
    padding: Spacing.lg,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  appointmentType: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  appointmentDate: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    opacity: 0.9,
  },
  appointmentDoctor: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    opacity: 0.9,
  },
  observationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  observationType: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.xs,
    fontFamily: "Inter-Medium",
  },
  observationDate: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    opacity: 0.9,
  },
  observationValue: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 14,
    color: Colors.neutral[700],
    fontFamily: "Inter-Regular",
  },
  value: {
    fontSize: 14,
    color: Colors.neutral[900],
    fontFamily: "Inter-Medium",
  },
})
