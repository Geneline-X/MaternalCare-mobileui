"use client"

import React from "react"

import { useState, useRef } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native"
import { useColorScheme } from "react-native"
import { Colors } from "../../constants/colors"
import { Calendar, Clock, User, AlertCircle } from "lucide-react-native"
import { useRouter, useFocusEffect } from "expo-router"
import { useAuth } from "@clerk/clerk-expo"

interface Doctor {
  id: string
  name: string
  email: string
  role: string
  specialization?: string
}

interface Appointment {
  id: string
  resourceType: string
  patientId: string
  doctorId: string
  status: "pending" | "confirmed" | "cancelled" | "fulfilled" | "noshow"
  appointmentType: string
  date: string
  time: string
  duration: number
  reason: string
  notes?: string
  doctorInfo?: Doctor
  preferredContact?: "phone" | "email"
  reminderEnabled?: boolean
}

const API_BASE_URL = "https://maternalcare-backend.onrender.com/api"

export default function AppointmentsScreen() {
  const colorScheme = useColorScheme()
  const router = useRouter()
  const { getToken } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchAppointments = async (isRefresh = false) => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      if (!isRefresh) {
        setLoading(true)
      }
      setError(null)

      const token = await getToken()
      if (!token) {
        throw new Error("No authentication token available")
      }

      console.log("Fetching appointments from:", `${API_BASE_URL}/fhir/Appointment`)

      const response = await fetch(`${API_BASE_URL}/fhir/Appointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: abortControllerRef.current.signal,
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Appointments data:", data)

      setAppointments(Array.isArray(data) ? data : [])
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Request was aborted")
        return
      }

      console.error("Error fetching appointments:", err)
      setError(err.message || "Failed to load appointments")
      setAppointments([]) // Set empty array on error
    } finally {
      setLoading(false)
      if (isRefresh) {
        setRefreshing(false)
      }
    }
  }

  // Use useFocusEffect instead of useEffect to load data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments()

      // Cleanup function
      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
      }
    }, []),
  )

  const onRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    await fetchAppointments(true)
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken()
            if (!token) {
              throw new Error("No authentication token available")
            }

            console.log("Cancelling appointment:", appointmentId)
            console.log("API URL:", `${API_BASE_URL}/fhir/Appointment/${appointmentId}`)

            const response = await fetch(`${API_BASE_URL}/fhir/Appointment/${appointmentId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              method: "DELETE",
            })

            console.log("Cancel response status:", response.status)
            console.log("Cancel response statusText:", response.statusText)

            if (!response.ok) {
              // Try to get error details from response body
              let errorMessage = `HTTP ${response.status}: ${response.statusText}`
              try {
                const errorData = await response.text()
                console.log("Error response body:", errorData)
                if (errorData) {
                  errorMessage += ` - ${errorData}`
                }
              } catch (parseError) {
                console.log("Could not parse error response")
              }
              throw new Error(errorMessage)
            }

            // Check if response has content
            const responseText = await response.text()
            console.log("Cancel response body:", responseText)

            // Remove from local state
            setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId))
            Alert.alert("Success", "Appointment cancelled successfully.")
          } catch (err: any) {
            console.error("Error cancelling appointment:", err)
            console.error("Error details:", {
              message: err.message,
              name: err.name,
              stack: err.stack,
            })
            Alert.alert("Error", err.message || "Failed to cancel appointment. Please try again.")
          }
        },
      },
    ])
  }

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return Colors.warning?.[500] || "#f59e0b"
      case "confirmed":
        return Colors.primary?.[500] || "#3b82f6"
      case "fulfilled":
        return Colors.success?.[500] || "#10b981"
      case "cancelled":
        return Colors.error?.[500] || "#ef4444"
      case "noshow":
        return Colors.neutral?.[500] || "#6b7280"
      default:
        return Colors.neutral?.[500] || "#6b7280"
    }
  }

  const getStatusLabel = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "confirmed":
        return "Confirmed"
      case "fulfilled":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      case "noshow":
        return "No Show"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    try {
      if (timeString.includes(":") && timeString.length <= 5) {
        return timeString
      }
      const date = new Date(timeString)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return timeString
    }
  }

  const upcomingAppointments = appointments.filter((apt) => apt.status === "pending" || apt.status === "confirmed")
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "fulfilled" || apt.status === "cancelled" || apt.status === "noshow",
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary?.[500] || "#3b82f6"} />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => router.push("/(patient)/create-appointment")}>
          <Text style={styles.newButtonText}>New Appointment</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color={Colors.error?.[500] || "#ef4444"} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchAppointments()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        {upcomingAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No upcoming appointments</Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push("/(patient)/create-appointment")}
            >
              <Text style={styles.emptyStateButtonText}>Book your first appointment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          upcomingAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.card}
              onPress={() => console.log("View appointment:", appointment.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.appointmentType}>{appointment.appointmentType}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(appointment.status)}</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Calendar size={16} color={Colors.neutral?.[600] || "#6b7280"} />
                  <Text style={styles.infoText}>{formatDate(appointment.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={16} color={Colors.neutral?.[600] || "#6b7280"} />
                  <Text style={styles.infoText}>{formatTime(appointment.time)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <User size={16} color={Colors.neutral?.[600] || "#6b7280"} />
                  <Text style={styles.infoText}>
                    {appointment.doctorInfo?.name || `Doctor ID: ${appointment.doctorId}`}
                  </Text>
                </View>
                {appointment.reason && <Text style={styles.reasonText}>{appointment.reason}</Text>}
              </View>
              {(appointment.status === "pending" || appointment.status === "confirmed") && (
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelAppointment(appointment.id)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past</Text>
        {pastAppointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No past appointments</Text>
          </View>
        ) : (
          pastAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.card}
              onPress={() => console.log("View appointment:", appointment.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.appointmentType}>{appointment.appointmentType}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(appointment.status)}</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Calendar size={16} color={Colors.neutral?.[600] || "#6b7280"} />
                  <Text style={styles.infoText}>{formatDate(appointment.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Clock size={16} color={Colors.neutral?.[600] || "#6b7280"} />
                  <Text style={styles.infoText}>{formatTime(appointment.time)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <User size={16} color={Colors.neutral?.[600] || "#6b7280"} />
                  <Text style={styles.infoText}>
                    {appointment.doctorInfo?.name || `Doctor ID: ${appointment.doctorId}`}
                  </Text>
                </View>
                {appointment.reason && <Text style={styles.reasonText}>{appointment.reason}</Text>}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  newButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#b91c1c",
    flex: 1,
  },
  retryButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    padding: 16,
    marginBottom: 90,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  appointmentType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
  },
  reasonText: {
    fontSize: 14,
    color: "#374151",
    fontStyle: "italic",
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
})
