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
} from "react-native"
import { useUser, useAuth } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart } from "react-native-chart-kit"
import { useRouter } from "expo-router"
import type { SearchResult } from "../../types/app"
import { SafeAreaView } from "react-native-safe-area-context"

// Mock data for patient dashboard
const mockPatientData = {
  pregnancyWeek: 24,
  dueDate: "2024-08-15",
  nextAppointment: "2024-01-20",
  babySize: "Corn cob",
  healthMetrics: {
    bloodPressure: "120/80",
    weight: "65kg",
    heartRate: "72 bpm",
    babyHeartRate: "140 bpm",
  },
  weeklyProgress: {
    labels: ["Week 18", "Week 19", "Week 20", "Week 21", "Week 22", "Week 23", "Week 24"],
    datasets: [
      {
        data: [62, 63, 64, 64.5, 65, 65.2, 65.5],
        color: (opacity = 1) => `rgba(233, 30, 99, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  },
  symptoms: {
    labels: ["Nausea", "Fatigue", "Back Pain", "Headache", "Mood"],
    datasets: [
      {
        data: [2, 4, 3, 1, 2],
        color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
      },
    ],
  },
}

// Mock search data for patients
const mockPatientSearchData: SearchResult[] = [
  {
    id: "1",
    type: "appointment",
    title: "Next Appointment",
    subtitle: "Dr. Sarah Johnson - Jan 20, 2:00 PM",
    category: "Upcoming",
  },
  {
    id: "2",
    type: "health",
    title: "Blood Pressure Log",
    subtitle: "120/80 mmHg - Normal",
    category: "Health Metrics",
  },
  {
    id: "3",
    type: "form",
    title: "Symptom Tracker",
    subtitle: "Log daily symptoms",
    category: "Health Forms",
  },
]

const PatientHome: React.FC = () => {
  const { user } = useUser()
  const { signOut } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedChart, setSelectedChart] = useState<"progress" | "symptoms">("progress")
  const router = useRouter()

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }, [])

  // Real-time search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = mockPatientSearchData.filter(
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
      case "appointment":
        router.push("./appointment")
        break
      case "health":
        // Navigate to health tracking
        break
      case "form":
        // Navigate to forms
        break
    }
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
    value: string,
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

  const calculateWeeksRemaining = () => {
    const totalWeeks = 40
    return totalWeeks - mockPatientData.pregnancyWeek
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
            <View style={styles.patientProfile}>
              <View style={styles.profileImageContainer}>
                <View style={styles.profileImage}>
                  <Ionicons name="person" size={32} color="white" />
                </View>
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.patientName}>
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Sarah Johnson"}
                </Text>
                <Text style={styles.pregnancyInfo}>Week {mockPatientData.pregnancyWeek} • Second Trimester</Text>
                <Text style={styles.dueDate}>Due: {new Date(mockPatientData.dueDate).toLocaleDateString()}</Text>
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Healthy Pregnancy</Text>
                </View>
              </View>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push("./notifications")}>
                <Ionicons name="notifications-outline" size={24} color="white" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>2</Text>
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
              placeholder="Search appointments, health data, symptoms..."
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
                <TouchableOpacity style={styles.suggestionTag} onPress={() => setSearchQuery("appointment")}>
                  <Text style={styles.suggestionTagText}>Appointments</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionTag} onPress={() => setSearchQuery("symptoms")}>
                  <Text style={styles.suggestionTagText}>Symptoms</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.suggestionTag} onPress={() => setSearchQuery("health")}>
                  <Text style={styles.suggestionTagText}>Health</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Pregnancy Overview</Text>
          <View style={styles.overviewGrid}>
            {renderOverviewCard(
              "Current Week",
              `${mockPatientData.pregnancyWeek}`,
              "calendar",
              "#E91E63",
              "Second trimester",
            )}
            {renderOverviewCard("Weeks Remaining", `${calculateWeeksRemaining()}`, "time", "#2F80ED", "Until due date")}
            {renderOverviewCard("Baby Size", mockPatientData.babySize, "heart", "#FF5722", "Approximately")}
            {renderOverviewCard("Next Appointment", "Jan 20", "medical", "#4CAF50", "Dr. Sarah Johnson")}
          </View>
        </View>

        {/* Enhanced Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("./appointment")}>
            <View style={[styles.actionIcon, { backgroundColor: "#E3F2FD" }]}>
              <Ionicons name="calendar-outline" size={24} color="#2F80ED" />
            </View>
            <Text style={styles.actionText}>Appointments</Text>
            <Text style={styles.actionSubtext}>Schedule & view</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="clipboard-outline" size={24} color="#F57C00" />
            </View>
            <Text style={styles.actionText}>Log Symptoms</Text>
            <Text style={styles.actionSubtext}>Track daily</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/(patient)/chat")}>
            <View style={[styles.actionIcon, { backgroundColor: "#E8F5E8" }]}>
              <Ionicons name="chatbubble-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Chat Doctor</Text>
            <Text style={styles.actionSubtext}>Ask questions</Text>
          </TouchableOpacity>
        </View>

        {/* Health Progress Chart */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Health Progress</Text>
            <View style={styles.chartToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, selectedChart === "progress" && styles.toggleButtonActive]}
                onPress={() => setSelectedChart("progress")}
              >
                <Text style={[styles.toggleText, selectedChart === "progress" && styles.toggleTextActive]}>Weight</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, selectedChart === "symptoms" && styles.toggleButtonActive]}
                onPress={() => setSelectedChart("symptoms")}
              >
                <Text style={[styles.toggleText, selectedChart === "symptoms" && styles.toggleTextActive]}>
                  Symptoms
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartTapHint}>
              <Ionicons name="analytics-outline" size={16} color="#666" />
              <Text style={styles.chartTapText}>Track your pregnancy journey</Text>
            </View>

            {selectedChart === "progress" ? (
              <LineChart
                data={mockPatientData.weeklyProgress}
                width={Dimensions.get("window").width - 80}
                height={200}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(233, 30, 99, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#E91E63",
                  },
                }}
                bezier
                style={styles.chart}
              />
            ) : (
              <BarChart
                data={mockPatientData.symptoms}
                width={Dimensions.get("window").width - 80}
                height={200}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                }}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix="/5"
              />
            )}

            <View style={styles.chartInsights}>
              <View style={styles.insightItem}>
                <Text style={styles.insightValue}>+0.5kg</Text>
                <Text style={styles.insightLabel}>this week</Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightValue}>65.5kg</Text>
                <Text style={styles.insightLabel}>current weight</Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightValue}>Normal</Text>
                <Text style={styles.insightLabel}>progress</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Health Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Health Metrics</Text>
          <View style={styles.card}>
            <View style={styles.healthMetricItem}>
              <View style={styles.metricInfo}>
                <View style={styles.metricIcon}>
                  <Ionicons name="heart" size={20} color="#E91E63" />
                </View>
                <View>
                  <Text style={styles.metricTitle}>Blood Pressure</Text>
                  <Text style={styles.metricDate}>Today, 9:00 AM</Text>
                </View>
              </View>
              <Text style={styles.metricValue}>{mockPatientData.healthMetrics.bloodPressure}</Text>
            </View>

            <View style={styles.healthMetricItem}>
              <View style={styles.metricInfo}>
                <View style={styles.metricIcon}>
                  <Ionicons name="fitness" size={20} color="#2F80ED" />
                </View>
                <View>
                  <Text style={styles.metricTitle}>Weight</Text>
                  <Text style={styles.metricDate}>Today, 8:30 AM</Text>
                </View>
              </View>
              <Text style={styles.metricValue}>{mockPatientData.healthMetrics.weight}</Text>
            </View>

            <View style={styles.healthMetricItem}>
              <View style={styles.metricInfo}>
                <View style={styles.metricIcon}>
                  <Ionicons name="pulse" size={20} color="#4CAF50" />
                </View>
                <View>
                  <Text style={styles.metricTitle}>Baby Heart Rate</Text>
                  <Text style={styles.metricDate}>Yesterday, 2:00 PM</Text>
                </View>
              </View>
              <Text style={styles.metricValue}>{mockPatientData.healthMetrics.babyHeartRate}</Text>
            </View>
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
    </SafeAreaView>
  )
}

export default PatientHome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#E91E63",
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
  patientProfile: {
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
  patientName: {
    color: "white",
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 2,
  },
  pregnancyInfo: {
    color: "#FFB3D1",
    fontSize: 14,
    fontFamily: "Inter-Medium",
    marginBottom: 2,
  },
  dueDate: {
    color: "#FFB3D1",
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
    color: "#FFB3D1",
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
    backgroundColor: "#FCE4EC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionTagText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#E91E63",
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
    backgroundColor: "#E91E63",
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
    color: "#E91E63",
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
  healthMetricItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
  },
  metricInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metricTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: "#333",
    marginBottom: 2,
  },
  metricDate: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#666",
  },
  metricValue: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#333",
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
    color: "#E91E63",
  },
})
