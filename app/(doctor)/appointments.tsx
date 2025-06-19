"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { useApiClient } from "../../utils/api"
import { requestManager } from "../../utils/requestManager"

interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  duration: number
  appointmentType: string // Backend uses 'appointmentType' not 'type'
  status: "pending" | "confirmed" | "fulfilled" | "cancelled" | "no_show"
  location?: string
  notes?: string
  reason?: string
  doctorInfo?: {
    id: string
    name: string
    email: string
    role: string
  }
  patientName?: string
}

interface AppointmentSummary {
  totalAppointments: number
  todayAppointments: number
  upcomingAppointments: number
  completedThisWeek: number
}

type FilterType = "all" | "today" | "upcoming" | "completed" | "cancelled"
type SortType = "date" | "patient" | "type" | "status"

const statusColors = {
  pending: "#FF9800",
  confirmed: "#4CAF50",
  fulfilled: "#2196F3", // Backend uses 'fulfilled' instead of 'completed'
  cancelled: "#F44336",
  no_show: "#9E9E9E",
}

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  fulfilled: "Completed", // Display as 'Completed' but backend uses 'fulfilled'
  cancelled: "Cancelled",
  no_show: "No Show",
}

export default function Appointments() {
  const router = useRouter()
  const apiClient = useApiClient()
  const mountedRef = useRef(true)
  const loadingRef = useRef(false)

  // State
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [summary, setSummary] = useState<AppointmentSummary | null>(null)
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("date")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Fallback data
  const getFallbackAppointments = (): Appointment[] => [
    {
      id: "1",
      patientId: "p1",
      patientName: "Sarah Johnson",
      date: "2025-06-20",
      time: "09:00",
      duration: 30,
      appointmentType: "Routine Checkup",
      status: "confirmed",
      location: "Clinic Room 1",
      notes: "Regular prenatal checkup",
      doctorId: "doc1",
    },
    {
      id: "2",
      patientId: "p2",
      patientName: "Maria Garcia",
      date: "2025-06-20",
      time: "10:30",
      duration: 45,
      appointmentType: "Ultrasound",
      status: "pending",
      location: "Ultrasound Room",
      notes: "20-week anatomy scan",
      doctorId: "doc1",
    },
    {
      id: "3",
      patientId: "p3",
      patientName: "Emily Chen",
      date: "2025-06-20",
      time: "14:00",
      duration: 30,
      appointmentType: "Follow-up",
      status: "confirmed",
      location: "Clinic Room 2",
      doctorId: "doc1",
    },
    {
      id: "4",
      patientId: "p4",
      patientName: "Jessica Williams",
      date: "2025-06-21",
      time: "11:00",
      duration: 60,
      appointmentType: "Initial Consultation",
      status: "pending",
      location: "Clinic Room 1",
      notes: "First prenatal visit",
      doctorId: "doc1",
    },
    {
      id: "5",
      patientId: "p5",
      patientName: "Amanda Brown",
      date: "2025-06-19",
      time: "15:30",
      duration: 30,
      appointmentType: "Routine Checkup",
      status: "fulfilled",
      location: "Clinic Room 1",
      doctorId: "doc1",
    },
    {
      id: "6",
      patientId: "p6",
      patientName: "Lisa Davis",
      date: "2025-06-18",
      time: "10:00",
      duration: 30,
      appointmentType: "Follow-up",
      status: "cancelled",
      location: "Clinic Room 2",
      notes: "Patient requested reschedule",
      doctorId: "doc1",
    },
  ]

  const getFallbackSummary = (): AppointmentSummary => ({
    totalAppointments: 45,
    todayAppointments: 3,
    upcomingAppointments: 12,
    completedThisWeek: 8,
  })

  // Load appointments data
  const loadAppointments = async () => {
    if (loadingRef.current) {
      console.log("Appointments load already in progress, skipping...")
      return
    }

    try {
      loadingRef.current = true
      setError(null)

      // Load appointments
      try {
        const appointmentsResponse = await requestManager.queueRequest("appointments-list", () =>
          apiClient.get("/api/fhir/Appointment", {
            _page: 1,
            _count: 100,
            _sort: "date",
            _order: "asc",
          }),
        )

        if (mountedRef.current) {
          if (appointmentsResponse && appointmentsResponse.success && appointmentsResponse.data) {
            setAppointments((appointmentsResponse.data.data || appointmentsResponse.data).map(transformAppointment))
          } else {
            setAppointments(getFallbackAppointments())
          }
        }
      } catch (error) {
        console.error("Failed to load appointments:", error)
        if (mountedRef.current) {
          setAppointments(getFallbackAppointments())
        }
      }

      // Load summary
      try {
        const summaryResponse = await requestManager.queueRequest("appointments-summary", () =>
          apiClient.get("/api/fhir/dashboard/metrics"),
        )

        if (mountedRef.current) {
          if (summaryResponse && summaryResponse.success && summaryResponse.data) {
            setSummary(summaryResponse.data)
          } else {
            setSummary(getFallbackSummary())
          }
        }
      } catch (error) {
        console.error("Failed to load summary:", error)
        if (mountedRef.current) {
          setSummary(getFallbackSummary())
        }
      }
    } catch (error: any) {
      console.error("Error loading appointments:", error)
      if (mountedRef.current) {
        setError(error.message || "Failed to load appointments")
        setAppointments(getFallbackAppointments())
        setSummary(getFallbackSummary())
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
      loadingRef.current = false
    }
  }

  // Transform backend data to frontend format
  const transformAppointment = (backendAppointment: any): Appointment => ({
    id: backendAppointment.id,
    patientId: backendAppointment.patientId,
    doctorId: backendAppointment.doctorId,
    date: backendAppointment.date,
    time: backendAppointment.time,
    duration: backendAppointment.duration || 30,
    appointmentType: backendAppointment.appointmentType || backendAppointment.type,
    status: backendAppointment.status,
    location: backendAppointment.location || "Clinic",
    notes: backendAppointment.notes,
    reason: backendAppointment.reason,
    doctorInfo: backendAppointment.doctorInfo,
    // Derive patientName from patientId if needed
    patientName: backendAppointment.patientName || `Patient ${backendAppointment.patientId}`,
  })

  // Initial load
  useEffect(() => {
    loadAppointments()
  }, [])

  // Filter and search appointments
  useEffect(() => {
    let filtered = [...appointments]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (appointment) =>
          appointment.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.appointmentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          appointment.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (activeFilter !== "all") {
      const today = new Date().toISOString().split("T")[0]

      switch (activeFilter) {
        case "today":
          filtered = filtered.filter((appointment) => appointment.date === today)
          break
        case "upcoming":
          filtered = filtered.filter(
            (appointment) =>
              appointment.date >= today && (appointment.status === "pending" || appointment.status === "confirmed"),
          )
          break
        case "completed":
          filtered = filtered.filter((appointment) => appointment.status === "fulfilled")
          break
        case "cancelled":
          filtered = filtered.filter(
            (appointment) => appointment.status === "cancelled" || appointment.status === "no_show",
          )
          break
      }
    }

    // Apply sorting with nullish coalescing for optional properties
    filtered.sort((a: Appointment, b: Appointment): number => {
      switch (sortBy) {
        case "date": {
          const timeA = new Date(a.date + " " + a.time).getTime()
          const timeB = new Date(b.date + " " + b.time).getTime()
          return timeA - timeB
        }
        case "patient": {
          const nameA = a.patientName ?? ''
          const nameB = b.patientName ?? ''
          return nameA.localeCompare(nameB)
        }
        case "type": {
          const typeA = a.appointmentType ?? ''
          const typeB = b.appointmentType ?? ''
          return typeA.localeCompare(typeB)
        }
        case "status": {
          return a.status.localeCompare(b.status)
        }
        default:
          return 0
      }
    })

    setFilteredAppointments(filtered)
  }, [appointments, searchQuery, activeFilter, sortBy])

  // Refresh handler
  const onRefresh = async () => {
    if (loadingRef.current) return
    setRefreshing(true)
    await loadAppointments()
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    }
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Render summary cards
  const renderSummaryCard = (title: string, value: number, icon: keyof typeof Ionicons.glyphMap, color: string) => (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.summaryContent}>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
    </View>
  )

  // Render filter chip
  const renderFilterChip = (filter: FilterType, label: string, count?: number) => (
    <TouchableOpacity
      style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[styles.filterChipText, activeFilter === filter && styles.activeFilterChipText]}>
        {label} {count !== undefined && `(${count})`}
      </Text>
    </TouchableOpacity>
  )

  // Render appointment item
  const renderAppointmentItem = ({ item }: { item: Appointment }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => router.push(`./patient-details?id=${item.patientId}`)}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentTime}>
          <Text style={styles.timeText}>{formatTime(item.time)}</Text>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.statusText}>{statusLabels[item.status]}</Text>
        </View>
      </View>

      <View style={styles.appointmentBody}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.appointmentType}>{item.appointmentType}</Text>
          <View style={styles.appointmentDetails}>
            <Ionicons name="location-outline" size={14} color={Colors.neutral[500]} />
            <Text style={styles.locationText}>{item.location}</Text>
            <Ionicons name="time-outline" size={14} color={Colors.neutral[500]} style={{ marginLeft: 12 }} />
            <Text style={styles.durationText}>{item.duration} min</Text>
          </View>
          {item.notes && (
            <Text style={styles.notesText} numberOfLines={2}>
              {item.notes}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.appointmentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation()
            // Handle reschedule action
          }}
        >
          <Ionicons name="calendar-outline" size={16} color={Colors.primary[500]} />
          <Text style={styles.actionButtonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation()
            router.push(`./chat?patientId=${item.patientId}`)
          }}
        >
          <Ionicons name="chatbubble-outline" size={16} color={Colors.success[500]} />
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.neutral[800]} />
        </TouchableOpacity>
        <Text style={styles.title}>Appointments</Text>
        <TouchableOpacity style={styles.scheduleButton} onPress={() => router.push("./schedule-visit")}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Summary Cards */}
        {summary && (
          <View style={styles.summarySection}>
            <View style={styles.summaryGrid}>
              {renderSummaryCard("Total", summary.totalAppointments, "calendar", Colors.primary[500])}
              {renderSummaryCard("Today", summary.todayAppointments, "today", Colors.warning[500])}
              {renderSummaryCard("Upcoming", summary.upcomingAppointments, "time", Colors.success[500])}
              {renderSummaryCard("Completed", summary.completedThisWeek, "checkmark-circle", Colors.primary[500])}
            </View>
          </View>
        )}

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.neutral[400]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search appointments..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={Colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {renderFilterChip("all", "All", appointments.length)}
            {renderFilterChip(
              "today",
              "Today",
              appointments.filter((a) => a.date === new Date().toISOString().split("T")[0]).length,
            )}
            {renderFilterChip(
              "upcoming",
              "Upcoming",
              appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length,
            )}
            {renderFilterChip("completed", "Completed", appointments.filter((a) => a.status === "fulfilled").length)}
            {renderFilterChip(
              "cancelled",
              "Cancelled",
              appointments.filter((a) => a.status === "cancelled" || a.status === "no_show").length,
            )}
          </ScrollView>
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeFilter === "all"
                ? "All Appointments"
                : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Appointments`}
              <Text style={styles.countText}> ({filteredAppointments.length})</Text>
            </Text>
            <TouchableOpacity style={styles.sortButton} onPress={() => setShowFilterModal(true)}>
              <Ionicons name="funnel-outline" size={16} color={Colors.neutral[600]} />
              <Text style={styles.sortButtonText}>Sort</Text>
            </TouchableOpacity>
          </View>

          {filteredAppointments.length > 0 ? (
            <FlatList
              data={filteredAppointments}
              renderItem={renderAppointmentItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={Colors.neutral[300]} />
              <Text style={styles.emptyStateTitle}>No appointments found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? "Try adjusting your search terms" : "Schedule your first appointment"}
              </Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.push("./schedule-visit")}>
                <Text style={styles.emptyStateButtonText}>Schedule Appointment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Appointments</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={Colors.neutral[600]} />
              </TouchableOpacity>
            </View>
            <View style={styles.sortOptions}>
              {[
                { key: "date", label: "Date & Time" },
                { key: "patient", label: "Patient Name" },
                { key: "type", label: "Appointment Type" },
                { key: "status", label: "Status" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.sortOption, sortBy === option.key && styles.activeSortOption]}
                  onPress={() => {
                    setSortBy(option.key as SortType)
                    setShowFilterModal(false)
                  }}
                >
                  <Text style={[styles.sortOptionText, sortBy === option.key && styles.activeSortOptionText]}>
                    {option.label}
                  </Text>
                  {sortBy === option.key && <Ionicons name="checkmark" size={20} color={Colors.primary[500]} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push("./schedule-visit")}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.neutral[600],
    fontFamily: "Inter-Medium",
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
  scheduleButton: {
    backgroundColor: Colors.primary[500],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: Colors.error[50],
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error[500],
  },
  errorText: {
    color: Colors.error[700],
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  summarySection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: "48%",
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.sm,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  summaryTitle: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
    marginLeft: Spacing.sm,
  },
  filtersContainer: {
    marginBottom: Spacing.sm,
  },
  filterChip: {
    backgroundColor: Colors.neutral[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary[500],
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
  },
  activeFilterChipText: {
    color: Colors.white,
  },
  appointmentsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  countText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  sortButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
    marginLeft: 4,
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  appointmentTime: {
    alignItems: "flex-start",
  },
  timeText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
  appointmentBody: {
    marginBottom: Spacing.sm,
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
  appointmentType: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  appointmentDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  locationText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginLeft: 4,
  },
  durationText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginLeft: 4,
  },
  notesText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
    fontStyle: "italic",
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral[50],
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[600],
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 40,
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
  sortOptions: {
    padding: Spacing.lg,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },
  activeSortOption: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  sortOptionText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[700],
  },
  activeSortOptionText: {
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: Colors.primary[500],
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.lg,
  },
})
