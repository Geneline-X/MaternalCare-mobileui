"use client"

import * as React from "react"
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
} from "react-native"
import { useUser, useAuth } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart } from "react-native-chart-kit"
import { useRouter } from "expo-router"
import type { SearchResult, DashboardData } from "../../types/app"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomBottomNavigation from "../../components/CustomBottomNavigation"


// Mock data for dashboard analytics
const mockDashboardData: DashboardData = {
  totalPregnancies: 47,
  totalPatients: 124,
  highRiskCases: 8,
  scheduledAppointments: 23,
  monthlyTrends: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  },
  weeklyVisits: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [12, 19, 15, 25, 22, 8, 5],
        color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
      },
    ],
  },
}

// Mock data for search functionality
const mockSearchData: SearchResult[] = [
  {
    id: "1",
    type: "patient",
    title: "Sarah Johnson",
    subtitle: "28 years • 32 weeks pregnant",
    category: "High Risk Patient",
  },
  {
    id: "2",
    type: "patient",
    title: "Emily Davis",
    subtitle: "24 years • 28 weeks pregnant",
    category: "Low Risk Patient",
  },
  {
    id: "3",
    type: "appointment",
    title: "Sarah Johnson - Prenatal Checkup",
    subtitle: "Today, 2:00 PM",
    category: "Upcoming Appointment",
  },
  {
    id: "4",
    type: "health",
    title: "Blood Pressure Reading",
    subtitle: "Sarah Johnson - 140/90 mmHg",
    category: "Vital Signs",
  },
]

const Dashboard: React.FC = () => {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedChart, setSelectedChart] = useState<"trends" | "visits">("trends")
  const router = useRouter()

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500)
  }, [])

  const isDoctor = (user?.unsafeMetadata?.role as string) === "doctor"

  // Real-time search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = mockSearchData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setSearchResults(filtered)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery])

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
        router.push(`./dynamic-forms`)
        break
    }
  }

  const handleChartPress = () => {
    router.push("./reports-analytics")
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

  const renderOverviewCard = (title: string, value: number, icon: keyof typeof Ionicons.glyphMap, color: string, subtitle?: string) => (
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 }]} // Add padding for navigation
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
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewGrid}>
            {renderOverviewCard(
              "Total Pregnancies",
              mockDashboardData.totalPregnancies,
              "heart",
              "#E91E63",
              "Active cases",
            )}
            {renderOverviewCard("Total Patients", mockDashboardData.totalPatients, "people", "#2F80ED", "Registered")}
            {renderOverviewCard("High-Risk Cases", mockDashboardData.highRiskCases, "warning", "#FF5722", "This month")}
            {renderOverviewCard(
              "Scheduled Appointments",
              mockDashboardData.scheduledAppointments,
              "calendar",
              "#4CAF50",
              "Upcoming",
            )}
          </View>
        </View>

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
              <LineChart
                data={mockDashboardData.monthlyTrends}
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
              <BarChart
                data={mockDashboardData.weeklyVisits}
                width={Dimensions.get("window").width - 80}
                height={200}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 }
                }}
                style={styles.chart}
                yAxisLabel="Visits"
                yAxisSuffix=""
              />
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

        {/* Today's Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={styles.card}>
            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Text style={styles.scheduleTimeText}>10:00</Text>
                <Text style={styles.scheduleAmPm}>AM</Text>
              </View>
              <View style={styles.scheduleDetails}>
                <Text style={styles.schedulePatient}>Sarah Johnson</Text>
                <Text style={styles.scheduleType}>Prenatal Checkup</Text>
                <View style={styles.scheduleStatus}>
                  <View style={[styles.statusDot, { backgroundColor: "#4CAF50" }]} />
                  <Text style={styles.statusText}>Confirmed</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.scheduleAction}>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.scheduleItem}>
              <View style={styles.scheduleTime}>
                <Text style={styles.scheduleTimeText}>2:30</Text>
                <Text style={styles.scheduleAmPm}>PM</Text>
              </View>
              <View style={styles.scheduleDetails}>
                <Text style={styles.schedulePatient}>Emily Davis</Text>
                <Text style={styles.scheduleType}>Ultrasound</Text>
                <View style={styles.scheduleStatus}>
                  <View style={[styles.statusDot, { backgroundColor: "#FF9800" }]} />
                  <Text style={styles.statusText}>Pending</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.scheduleAction}>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("./appointments")}>
              <Text style={styles.viewAllText}>View All Appointments</Text>
              <Ionicons name="arrow-forward" size={16} color="#2F80ED" />
            </TouchableOpacity>
          </View>
        </View>
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

      <CustomBottomNavigation />
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
