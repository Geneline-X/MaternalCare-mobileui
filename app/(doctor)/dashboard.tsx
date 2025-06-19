"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Dimensions } from "react-native"
import { useUser } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useApiClient } from "../../utils/api"
import { requestManager } from "../../utils/requestManager"

// Types based on your backend
interface DashboardMetrics {
  totalPregnancies: number
  totalPatients: number
  highRiskCases: number
  scheduledAppointments: number
  newPatientsThisMonth: number
  completedPregnanciesThisMonth: number
}

interface ChartData {
  labels: string[]
  datasets: Array<{
    data: number[]
    color?: (opacity?: number) => string
    strokeWidth?: number
  }>
}

interface DashboardAnalytics {
  monthlyTrends: ChartData
  weeklyVisits: ChartData
}

interface TodaySchedule {
  appointments: Array<{
    id: string
    patientId: string
    patientName: string
    time: string
    type: string
    status: "confirmed" | "pending" | "cancelled"
    duration: number
    notes?: string
  }>
}

interface DoctorProfile {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  profession: string
  experienceYears: number
  specialties: string[]
  bio: string
}

const Dashboard: React.FC = () => {
  const { user } = useUser()
  const apiClient = useApiClient()
  const router = useRouter()
  const mountedRef = useRef(true)
  const loadingRef = useRef(false)

  // State
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [todaySchedule, setTodaySchedule] = useState<TodaySchedule | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Fallback data
  const getFallbackAnalytics = (): DashboardAnalytics => ({
    monthlyTrends: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          data: [20, 45, 28, 80, 99, 43],
          color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
    weeklyVisits: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          data: [12, 19, 15, 25, 22, 18, 20],
          color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
        },
      ],
    },
  })

  const getFallbackMetrics = (): DashboardMetrics => ({
    totalPregnancies: 45,
    totalPatients: 128,
    highRiskCases: 8,
    scheduledAppointments: 12,
    newPatientsThisMonth: 15,
    completedPregnanciesThisMonth: 6,
  })

  const getFallbackSchedule = (): TodaySchedule => ({
    appointments: [
      {
        id: "1",
        patientId: "p1",
        patientName: "Sarah Johnson",
        time: "09:00",
        type: "Routine Checkup",
        status: "confirmed",
        duration: 30,
      },
      {
        id: "2",
        patientId: "p2",
        patientName: "Maria Garcia",
        time: "10:30",
        type: "Ultrasound",
        status: "pending",
        duration: 45,
      },
      {
        id: "3",
        patientId: "p3",
        patientName: "Emily Chen",
        time: "14:00",
        type: "Follow-up",
        status: "confirmed",
        duration: 30,
      },
    ],
  })

  // Get fallback profile from Clerk user data
  const getFallbackProfile = (): DoctorProfile => ({
    id: user?.id || "",
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Dr. Unknown",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    profession: "Maternal Health Specialist",
    experienceYears: 0,
    specialties: ["Maternal Health"],
    bio: "",
  })

  // Load doctor profile with multiple strategies
  const loadDoctorProfile = async () => {
    if (!user?.id) {
      console.log("No user ID available")
      setDoctorProfile(getFallbackProfile())
      return
    }

    try {
      console.log("Attempting to load doctor profile for user:", user.id)

      // Strategy 1: Try to get all doctors and find current user
      try {
        const doctorsResponse = await requestManager.queueRequest("all-doctors", () =>
          apiClient.get("/api/users/doctors"),
        )

        if (doctorsResponse && doctorsResponse.success && doctorsResponse.data) {
          // Find the current user in the doctors list
          const currentDoctor = doctorsResponse.data.find(
            (doctor: any) => doctor.clerkId === user.id || doctor.email === user.emailAddresses?.[0]?.emailAddress,
          )

          if (currentDoctor) {
            console.log("Found doctor profile in doctors list:", currentDoctor)
            setDoctorProfile({
              id: currentDoctor.id || currentDoctor._id,
              name: currentDoctor.name || `${currentDoctor.firstName || ""} ${currentDoctor.lastName || ""}`.trim(),
              firstName: currentDoctor.firstName || "",
              lastName: currentDoctor.lastName || "",
              email: currentDoctor.email || "",
              profession: currentDoctor.profession || "Maternal Health Specialist",
              experienceYears: currentDoctor.experienceYears || 0,
              specialties: currentDoctor.specialties || ["Maternal Health"],
              bio: currentDoctor.bio || "",
            })
            return
          }
        }
      } catch (error) {
        console.log("Failed to get doctors list:", error)
      }

      // Strategy 2: Try direct ID lookup (if we have a MongoDB ID)
      if (user.publicMetadata?.mongoId) {
        try {
          const profileResponse = await requestManager.queueRequest("doctor-profile-direct", () =>
            apiClient.get(`/api/users/doctors/${user.publicMetadata.mongoId}`),
          )

          if (profileResponse && profileResponse.success) {
            console.log("Found doctor profile by MongoDB ID:", profileResponse.data)
            setDoctorProfile(profileResponse.data)
            return
          }
        } catch (error) {
          console.log("Failed to get doctor by MongoDB ID:", error)
        }
      }

      // Strategy 3: Fallback to Clerk user data
      console.log("Using fallback profile from Clerk user data")
      setDoctorProfile(getFallbackProfile())
    } catch (error) {
      console.error("Error loading doctor profile:", error)
      setDoctorProfile(getFallbackProfile())
    }
  }

  // Load dashboard data with request management
  const loadDashboardData = async () => {
    if (loadingRef.current) {
      console.log("Dashboard load already in progress, skipping...")
      return
    }

    try {
      loadingRef.current = true
      setError(null)

      // Load doctor profile first
      await loadDoctorProfile()

      // Load metrics with request queue
      try {
        const metricsResponse = await requestManager.queueRequest("dashboard-metrics", () =>
          apiClient.get("/api/fhir/dashboard/metrics"),
        )

        if (mountedRef.current) {
          if (metricsResponse && metricsResponse.success) {
            setMetrics(metricsResponse.data)
          } else {
            setMetrics(getFallbackMetrics())
          }
        }
      } catch (error) {
        console.error("Failed to load metrics:", error)
        if (mountedRef.current) {
          setMetrics(getFallbackMetrics())
        }
      }

      // Load analytics with delay
      try {
        const analyticsResponse = await requestManager.queueRequest("dashboard-analytics", () =>
          apiClient.get("/api/fhir/dashboard/analytics"),
        )

        if (mountedRef.current) {
          if (analyticsResponse && analyticsResponse.success && analyticsResponse.data) {
            setAnalytics(analyticsResponse.data)
          } else {
            setAnalytics(getFallbackAnalytics())
          }
        }
      } catch (error) {
        console.error("Failed to load analytics:", error)
        if (mountedRef.current) {
          setAnalytics(getFallbackAnalytics())
        }
      }

      // Load today's schedule
      try {
        const scheduleResponse = await requestManager.queueRequest("dashboard-schedule", () =>
          apiClient.get("/api/fhir/dashboard/schedule/today"),
        )

        if (mountedRef.current) {
          if (scheduleResponse && scheduleResponse.success) {
            setTodaySchedule(scheduleResponse.data)
          } else {
            setTodaySchedule(getFallbackSchedule())
          }
        }
      } catch (error) {
        console.error("Failed to load schedule:", error)
        if (mountedRef.current) {
          setTodaySchedule(getFallbackSchedule())
        }
      }
    } catch (error: any) {
      console.error("Error loading dashboard data:", error)
      if (mountedRef.current) {
        setError(error.message || "Failed to load dashboard data")
        // Set fallback data
        setMetrics(getFallbackMetrics())
        setAnalytics(getFallbackAnalytics())
        setTodaySchedule(getFallbackSchedule())
        setDoctorProfile(getFallbackProfile())
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
      loadingRef.current = false
    }
  }

  // Initial load - only once
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Refresh handler
  const onRefresh = async () => {
    if (loadingRef.current) return

    setRefreshing(true)
    await loadDashboardData()
  }

  const renderOverviewCard = (
    title: string,
    value: number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    subtitle?: string,
  ) => (
    <View style={[styles.overviewCard, { borderLeftColor: color }]}>
      <View style={styles.overviewCardHeader}>
        <View style={[styles.overviewCardIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.overviewCardContent}>
          <Text style={styles.overviewCardValue}>{value}</Text>
          <Text style={styles.overviewCardTitle}>{title}</Text>
          {subtitle && <Text style={styles.overviewCardSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.doctorProfile}>
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImage}>
                  <Ionicons name="person" size={32} color="white" />
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.doctorName}>
                  Dr. {doctorProfile?.firstName || user?.firstName || "Unknown"}{" "}
                  {doctorProfile?.lastName || user?.lastName || ""}
                </Text>
                <Text style={styles.profession}>{doctorProfile?.profession || "Maternal Health Specialist"}</Text>
                <Text style={styles.credentials}>
                  MD, OBGYN • {doctorProfile?.experienceYears || 0} years experience
                </Text>
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Available</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push("./notifications")}>
                <Ionicons name="notifications-outline" size={24} color="white" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push("./settings")}>
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Debug Info - Remove in production */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Debug Info:</Text>
            <Text style={styles.debugText}>User ID: {user?.id}</Text>
            <Text style={styles.debugText}>Email: {user?.emailAddresses?.[0]?.emailAddress}</Text>
            <Text style={styles.debugText}>Profile Loaded: {doctorProfile ? "Yes" : "No"}</Text>
            {doctorProfile && <Text style={styles.debugText}>Profile Name: {doctorProfile.name}</Text>}
          </View>
        )}

        {/* Overview Cards */}
        {metrics && (
          <View style={styles.overviewSection}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.overviewGrid}>
              {renderOverviewCard("Total Pregnancies", metrics.totalPregnancies, "heart", "#E91E63", "Active cases")}
              {renderOverviewCard("Total Patients", metrics.totalPatients, "people", "#2F80ED", "Registered")}
              {renderOverviewCard("High-Risk Cases", metrics.highRiskCases, "warning", "#FF5722", "This month")}
              {renderOverviewCard(
                "Scheduled Appointments",
                metrics.scheduledAppointments,
                "calendar",
                "#4CAF50",
                "Upcoming",
              )}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("./add-patient")}>
            <View style={[styles.actionIcon, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="person-add-outline" size={24} color="#2F80ED" />
            </View>
            <Text style={styles.actionText}>Add Patient</Text>
            <Text style={styles.actionSubtext}>Register new patient</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("./add-pregnancy")}>
            <View style={[styles.actionIcon, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="heart-outline" size={24} color="#F57C00" />
            </View>
            <Text style={styles.actionText}>Add Pregnancy</Text>
            <Text style={styles.actionSubtext}>Register pregnancy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("./schedule-visit")}>
            <View style={[styles.actionIcon, { backgroundColor: "#E8F5E8" }]}>
              <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Schedule Visit</Text>
            <Text style={styles.actionSubtext}>Book appointment</Text>
          </TouchableOpacity>
        </View>

        {/* Analytics Chart */}
        {analytics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Analytics</Text>
            <TouchableOpacity style={styles.chartCard} onPress={() => router.push("./report-analytics")}>
              <View style={styles.chartTapHint}>
                <Ionicons name="analytics-outline" size={16} color="#666" />
                <Text style={styles.chartTapText}>Tap to view detailed analytics</Text>
              </View>

              <LineChart
                data={analytics.monthlyTrends}
                width={Dimensions.get("window").width - 80}
                height={200}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#2F80ED",
                  },
                }}
                bezier
                style={styles.chart}
              />

              <View style={styles.chartInsights}>
                <View style={styles.insightItem}>
                  <Text style={styles.insightValue}>+12%</Text>
                  <Text style={styles.insightLabel}>vs last month</Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightValue}>89</Text>
                  <Text style={styles.insightLabel}>avg visits/month</Text>
                </View>
                <View style={styles.insightItem}>
                  <Text style={styles.insightValue}>4.8</Text>
                  <Text style={styles.insightLabel}>satisfaction</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Schedule */}
        {todaySchedule && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <View style={styles.card}>
              {todaySchedule.appointments.length > 0 ? (
                todaySchedule.appointments.map((appointment) => (
                  <View key={appointment.id} style={styles.scheduleItem}>
                    <View style={styles.scheduleTime}>
                      <Text style={styles.scheduleTimeText}>
                        {appointment.time.split(":")[0]}:{appointment.time.split(":")[1]}
                      </Text>
                      <Text style={styles.scheduleAmPm}>
                        {Number.parseInt(appointment.time.split(":")[0]) >= 12 ? "PM" : "AM"}
                      </Text>
                    </View>
                    <View style={styles.scheduleDetails}>
                      <Text style={styles.schedulePatient}>{appointment.patientName}</Text>
                      <Text style={styles.scheduleType}>{appointment.type}</Text>
                      <View style={styles.scheduleStatus}>
                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                appointment.status === "confirmed"
                                  ? "#4CAF50"
                                  : appointment.status === "pending"
                                    ? "#FF9800"
                                    : "#F44336",
                            },
                          ]}
                        />
                        <Text style={styles.statusText}>{appointment.status}</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.scheduleAction}>
                      <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptySchedule}>
                  <Text style={styles.emptyScheduleText}>No appointments scheduled for today</Text>
                </View>
              )}

              <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("./appointments")}>
                <Text style={styles.viewAllText}>View All Appointments</Text>
                <Ionicons name="arrow-forward" size={16} color="#2F80ED" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  scroll: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Inter-Medium",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    margin: 20,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  errorText: {
    color: "#C62828",
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  debugContainer: {
    backgroundColor: "#E3F2FD",
    margin: 20,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  debugText: {
    color: "#1565C0",
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginBottom: 4,
  },
  header: {
    backgroundColor: "#2F80ED",
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  doctorProfile: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "white",
  },
  profileInfo: {
    flex: 1,
  },
  doctorName: {
    color: "white",
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 2,
  },
  profession: {
    color: "#A8C3FF",
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 2,
  },
  credentials: {
    color: "#A8C3FF",
    fontSize: 12,
    fontFamily: "Inter-Regular",
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 6,
  },
  statusText: {
    color: "#A8C3FF",
    fontSize: 12,
    fontFamily: "Inter-Medium",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontFamily: "Inter-Bold",
  },
  overviewSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  overviewCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  overviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  overviewCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  overviewCardContent: {
    flex: 1,
  },
  overviewCardValue: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginBottom: 2,
  },
  overviewCardTitle: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: "#666",
    marginBottom: 2,
  },
  overviewCardSubtitle: {
    fontSize: 10,
    fontFamily: "Inter-Regular",
    color: "#999",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 24,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "31%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    fontFamily: "Inter-SemiBold",
    color: "#333",
    textAlign: "center",
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 10,
    fontFamily: "Inter-Regular",
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  chartTapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  chartTapText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#666",
    marginLeft: 6,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartInsights: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  insightItem: {
    alignItems: "center",
  },
  insightValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#2F80ED",
    marginBottom: 2,
  },
  insightLabel: {
    fontSize: 10,
    fontFamily: "Inter-Medium",
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
  },
  scheduleTime: {
    alignItems: "center",
    marginRight: 16,
    minWidth: 50,
  },
  scheduleTimeText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  scheduleAmPm: {
    fontSize: 10,
    fontFamily: "Inter-Medium",
    color: "#666",
  },
  scheduleDetails: {
    flex: 1,
  },
  schedulePatient: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: "#333",
    marginBottom: 2,
  },
  scheduleType: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#666",
    marginBottom: 4,
  },
  scheduleStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  scheduleAction: {
    padding: 8,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: "#2F80ED",
    marginRight: 6,
  },
  emptySchedule: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyScheduleText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Inter-Regular",
  },
})
