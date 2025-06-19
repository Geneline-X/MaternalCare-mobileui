"use client"

import type * as React from "react"
import { useState, useCallback, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from "react-native"
import { useUser, useAuth } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart } from "react-native-chart-kit"
import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useApiClient } from "../../utils/api"

// API Response Types
interface DashboardMetrics {
  totalPregnancies: number
  totalPatients: number
  highRiskCases: number
  scheduledAppointments: number
  newPatientsThisMonth: number
  completedPregnanciesThisMonth: number
}

interface ChartDataset {
  data: number[]
  color?: (opacity?: number) => string
  strokeWidth?: number
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
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

interface SearchResult {
  id: string
  type: "patient" | "appointment" | "health" | "form"
  title: string
  subtitle: string
  category: string
}

const Dashboard: React.FC = () => {
  const { user } = useUser()
  const { getToken } = useAuth()
  const apiClient = useApiClient()
  const router = useRouter()

  // State management
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedChart, setSelectedChart] = useState<"trends" | "visits">("trends")
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [todaySchedule, setTodaySchedule] = useState<TodaySchedule | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fallback analytics data
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

  // Validate chart data
  const validateChartData = (data: ChartData): boolean => {
    return !!(
      data &&
      Array.isArray(data.labels) &&
      data.labels.length > 0 &&
      Array.isArray(data.datasets) &&
      data.datasets.length > 0 &&
      Array.isArray(data.datasets[0].data) &&
      data.datasets[0].data.length === data.labels.length
    )
  }

  // Load dashboard data with caching
  const loadDashboardData = useCallback(
    async (forceRefresh = false) => {
      try {
        setError(null)

        // Define cache TTLs for different data types
        const CACHE_OPTIONS = {
          metrics: { ttl: 10 * 60 * 1000, forceRefresh }, // 10 minutes for metrics
          analytics: { ttl: 30 * 60 * 1000, forceRefresh }, // 30 minutes for analytics
          schedule: { ttl: 5 * 60 * 1000, forceRefresh }, // 5 minutes for schedule
        }

        // Metrics with caching
        try {
          const metricsResponse = await apiClient.get<{ success: boolean; data: DashboardMetrics }>(
            "/api/fhir/dashboard/metrics",
            {},
            CACHE_OPTIONS.metrics,
          )
          if (metricsResponse?.success && metricsResponse.data?.data) {
            setMetrics(metricsResponse.data.data)
          }
        } catch (metricsError) {
          console.error("Failed to load metrics:", metricsError)
        }

        // Analytics with caching and validation
        try {
          const analyticsResponse = await apiClient.get<{ success: boolean; data: DashboardAnalytics }>(
            "/api/fhir/dashboard/analytics",
            {},
            CACHE_OPTIONS.analytics,
          )

          if (analyticsResponse?.success && analyticsResponse.data?.data) {
            const analyticsData = analyticsResponse.data.data
            console.log("Raw analytics data:", analyticsData)

            // Validate analytics data structure
            if (
              analyticsData.monthlyTrends &&
              analyticsData.weeklyVisits &&
              validateChartData(analyticsData.monthlyTrends) &&
              validateChartData(analyticsData.weeklyVisits)
            ) {
              setAnalytics(analyticsData)
              console.log("Analytics data loaded successfully")
            } else {
              console.warn("Invalid analytics data structure, using fallback")
              setAnalytics(getFallbackAnalytics())
            }
          } else {
            console.warn("Analytics response failed, using fallback")
            setAnalytics(getFallbackAnalytics())
          }
        } catch (analyticsError) {
          console.error("Failed to load analytics:", analyticsError)
          setAnalytics(getFallbackAnalytics())
        }

        // Today's Schedule with caching
        try {
          const scheduleResponse = await apiClient.get<{ success: boolean; data: TodaySchedule }>(
            "/api/fhir/dashboard/schedule/today",
            {},
            CACHE_OPTIONS.schedule,
          )
          if (scheduleResponse?.success && scheduleResponse.data?.data) {
            setTodaySchedule(scheduleResponse.data.data)
          }
        } catch (scheduleError) {
          console.error("Failed to load schedule:", scheduleError)
        }
      } catch (error: any) {
        console.error("Error loading dashboard data:", error)
        setError(error.message || "Failed to load dashboard data")

        // Set fallback analytics even on error
        if (!analytics) {
          setAnalytics(getFallbackAnalytics())
        }
      } finally {
        setLoading(false)
      }
    },
    [apiClient, analytics],
  )

  // Search functionality with caching
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        setShowSearchResults(false)
        return
      }

      try {
        const response = await apiClient.get<{
          success: boolean
          data: { results: SearchResult[]; totalCount: number; searchTime: number }
        }>(
          `/api/fhir/search`,
          { q: query, limit: 10 },
          { ttl: 2 * 60 * 1000 }, // 2 minutes cache for search results
        )

        if (response?.success && response.data?.data?.results) {
          setSearchResults(response.data.data.results)
          setShowSearchResults(true)
        } else {
          setSearchResults([])
        }
      } catch (error: any) {
        console.error("Search error:", error)
        setSearchResults([])
        if (error.message?.includes("429")) {
          Alert.alert("Rate Limit", "Too many requests. Please try again later.")
        }
      }
    },
    [apiClient],
  )

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, performSearch])

  // Initial data load
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadDashboardData(true) // Force refresh to bypass cache
    setRefreshing(false)
  }, [loadDashboardData])

  const getSearchIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "patient":
        return "person-outline"
      case "appointment":
        return "calendar-outline"
      case "health":
        return "heart-outline"
      case "form":
        return "document-outline"
      default:
        return "search-outline"
    }
  }

  const getSearchIconColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "patient":
        return "#2F80ED"
      case "appointment":
        return "#F2994A"
      case "health":
        return "#27AE60"
      case "form":
        return "#9C27B0"
      default:
        return "#6C757D"
    }
  }

  const handleSearchResultPress = (item: SearchResult) => {
    setShowSearchResults(false)
    setSearchQuery("")

    switch (item.type) {
      case "patient":
        router.push(`./patients`)
        break
      case "appointment":
        router.push(`./schedule-visit`)
        break
      case "health":
        router.push(`./health-monitoring`)
        break
      case "form":
        router.push(`./dynamic-form`)
        break
    }
  }

  const handleChartPress = () => {
    router.push("./report-analytics")
  }

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.searchResultItem} onPress={() => handleSearchResultPress(item)}>
      <View style={[styles.searchResultIcon, { backgroundColor: `${getSearchIconColor(item.type)}15` }]}>
        <Ionicons name={getSearchIcon(item.type)} size={20} color={getSearchIconColor(item.type)} />
      </View>
      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultTitle}>{item.title}</Text>
        <Text style={styles.searchResultSubtitle}>{item.subtitle}</Text>
        <Text style={styles.searchResultCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  )

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
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Enhanced Header */}
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
                  {user?.firstName && user?.lastName ? `Dr. ${user.firstName} ${user.lastName}` : "Dr. David Wilson"}
                </Text>
                <Text style={styles.profession}>Maternal Health Specialist</Text>
                <Text style={styles.credentials}>MD, OBGYN • 12 years experience</Text>
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

        {/* Enhanced Search Bar */}
        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={20} color="#aaa" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients, appointments, health data..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>

          {searchQuery.length === 0 && (
            <View style={styles.searchSuggestions}>
              <Text style={styles.suggestionsTitle}>Quick Search:</Text>
              <View style={styles.suggestionTags}>
                <TouchableOpacity style={styles.suggestionTag} onPress={() => setSearchQuery("high risk")}>
                  <Text style={styles.suggestionTagText}>High Risk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionTag} onPress={() => setSearchQuery("today")}>
                  <Text style={styles.suggestionTagText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionTag} onPress={() => setSearchQuery("due soon")}>
                  <Text style={styles.suggestionTagText}>Due Soon</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

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

        {/* Enhanced Quick Actions */}
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

        {/* Patient Analytics Chart */}
        {analytics && (
          <View style={styles.section}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Patient Analytics</Text>
              <View style={styles.chartToggle}>
                <TouchableOpacity
                  style={[styles.toggleButton, selectedChart === "trends" && styles.toggleButtonActive]}
                  onPress={() => setSelectedChart("trends")}
                >
                  <Text style={[styles.toggleText, selectedChart === "trends" && styles.toggleTextActive]}>Trends</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, selectedChart === "visits" && styles.toggleButtonActive]}
                  onPress={() => setSelectedChart("visits")}
                >
                  <Text style={[styles.toggleText, selectedChart === "visits" && styles.toggleTextActive]}>Visits</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.chartCard} onPress={handleChartPress}>
              <View style={styles.chartTapHint}>
                <Ionicons name="analytics-outline" size={16} color="#666" />
                <Text style={styles.chartTapText}>Tap to view detailed analytics</Text>
              </View>

              {selectedChart === "trends" ? (
                validateChartData(analytics.monthlyTrends) ? (
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
                ) : (
                  <View style={styles.chartError}>
                    <Text style={styles.chartErrorText}>Chart data unavailable</Text>
                  </View>
                )
              ) : validateChartData(analytics.weeklyVisits) ? (
                <BarChart
                  data={analytics.weeklyVisits}
                  width={Dimensions.get("window").width - 80}
                  height={200}
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                  }}
                  style={styles.chart}
                  yAxisLabel=""
                  yAxisSuffix=""
                />
              ) : (
                <View style={styles.chartError}>
                  <Text style={styles.chartErrorText}>Chart data unavailable</Text>
                </View>
              )}

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
                todaySchedule.appointments.map((appointment, index) => (
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

      {/* Search Results Modal */}
      <Modal
        visible={showSearchResults}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSearchResults(false)}
      >
        <TouchableOpacity
          style={styles.searchModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSearchResults(false)}
        >
          <View style={styles.searchResultsContainer}>
            <View style={styles.searchResultsHeader}>
              <Text style={styles.searchResultsTitle}>Search Results ({searchResults.length})</Text>
              <TouchableOpacity onPress={() => setShowSearchResults(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              style={styles.searchResultsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 40,
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
  searchCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 16,
    marginTop: -30,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#333",
    marginLeft: 8,
  },
  searchSuggestions: {
    marginTop: 12,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#666",
    marginBottom: 8,
  },
  suggestionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionTagText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#2F80ED",
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
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartToggle: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#2F80ED",
  },
  toggleText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#666",
  },
  toggleTextActive: {
    color: "white",
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
  chartError: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginVertical: 8,
  },
  chartErrorText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Inter-Medium",
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
  // Search Results Modal Styles
  searchModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    margin: 20,
    maxHeight: "70%",
    width: "90%",
  },
  searchResultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchResultsTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#333",
  },
  searchResultsList: {
    maxHeight: 400,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#333",
    marginBottom: 2,
  },
  searchResultSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#666",
    marginBottom: 2,
  },
  searchResultCategory: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#2F80ED",
  },
})
