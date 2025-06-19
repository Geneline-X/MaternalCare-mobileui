"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { SafeAreaView } from "react-native-safe-area-context"
import { useApiClient } from "../../utils/api"
import { useToast } from "react-native-toast-notifications"
import type {
  HealthMetric,
  HealthStatus,
  TrendDirection,
  HealthMetricsSummary,
  HealthMetricsTrends,
} from "../../types/api"

export default function HealthMonitoring() {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<HealthStatus | "all">("all")
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([])
  const [summary, setSummary] = useState<HealthMetricsSummary | null>(null)
  const [trends, setTrends] = useState<HealthMetricsTrends | null>(null)
  const [loading, setLoading] = useState(true)
  const apiClient = useApiClient()
  const toast = useToast()

  const fetchHealthData = async () => {
    try {
      setRefreshing(true)

      // Different cache TTLs for different data types
      const cacheOptions = {
        metrics: { ttl: 5 * 60 * 1000 }, // 5 minutes for health metrics (more dynamic)
        summary: { ttl: 15 * 60 * 1000 }, // 15 minutes for summary
        trends: { ttl: 30 * 60 * 1000 }, // 30 minutes for trends
      }

      const [metricsResponse, summaryResponse, trendsResponse] = await Promise.all([
        apiClient.get(
          "/api/fhir/health-metrics", 
          {
            _page: 1,
            _count: 50,
            ...(selectedFilter !== "all" && { status: selectedFilter }),
          },
          cacheOptions.metrics,
        ),
        apiClient.get("/api/fhir/health-metrics/summary", {}, cacheOptions.summary),
        apiClient.get("/api/fhir/health-metrics/trends", { weeks: 7 }, cacheOptions.trends),
      ])

      // Handle wrapped responses - the API client now handles this automatically
      if (metricsResponse.success && metricsResponse.data) {
        // Backend returns { data: [...], pagination: {...} }
        setHealthMetrics(metricsResponse.data.data || metricsResponse.data)
      }

      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data)
      }

      if (trendsResponse.success && trendsResponse.data) {
        setTrends(trendsResponse.data)
      }
    } catch (error) {
      console.error("Error fetching health data:", error)
      if ((error as Error).message?.includes("429")) {
        toast.show("Rate limit reached. Showing cached data.", { type: "warning" })
      } else {
        toast.show("Failed to load health metrics", { type: "danger" })
      }
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
  }, [selectedFilter])

  const onRefresh = React.useCallback(() => {
    fetchHealthData()
  }, [selectedFilter])

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case "high":
      case "critical":
        return Colors.error[500]
      case "low":
        return Colors.warning[500]
      case "normal":
        return Colors.success[500]
      default:
        return Colors.neutral[500]
    }
  }

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case "high":
      case "critical":
        return "arrow-up-circle"
      case "low":
        return "arrow-down-circle"
      case "normal":
        return "checkmark-circle"
      default:
        return "help-circle"
    }
  }

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case "increasing":
        return "trending-up"
      case "decreasing":
        return "trending-down"
      case "stable":
        return "remove"
      default:
        return "help"
    }
  }

  const alertCount = summary ? summary.lowCount + summary.highCount + summary.criticalCount : 0

  const renderHealthMetric = ({ item }: { item: HealthMetric }) => (
    <TouchableOpacity style={[styles.metricCard, item.status !== "normal" && styles.alertCard]}>
      <View style={styles.metricHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.patientId}>ID: {item.patientId}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color="white" />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.metricDetails}>
        <View style={styles.metricValue}>
          <Text style={styles.metricName}>{item.metric}</Text>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: getStatusColor(item.status) }]}>{item.value}</Text>
            <View style={styles.trendContainer}>
              <Ionicons name={getTrendIcon(item.trend)} size={16} color={getStatusColor(item.status)} />
            </View>
          </View>
        </View>

        <View style={styles.metricMeta}>
          <Text style={styles.normalRange}>Normal: {item.normalRange}</Text>
          <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
      </View>

      {item.status !== "normal" && (
        <View style={styles.alertActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call-outline" size={16} color={Colors.primary[600]} />
            <Text style={styles.actionText}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="medical-outline" size={16} color={Colors.primary[600]} />
            <Text style={styles.actionText}>Review</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading health metrics...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Monitoring</Text>
        <TouchableOpacity style={styles.alertButton}>
          <Ionicons name="notifications" size={24} color={Colors.error[500]} />
          {alertCount > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{alertCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Summary Cards */}
        {summary && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Ionicons name="heart" size={24} color={Colors.success[600]} />
              <Text style={styles.summaryValue}>{summary.normalCount}</Text>
              <Text style={styles.summaryLabel}>Normal</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: Colors.warning[500] }]}>
              <Ionicons name="warning" size={24} color={Colors.warning[600]} />
              <Text style={styles.summaryValue}>{summary.lowCount}</Text>
              <Text style={styles.summaryLabel}>Low</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: Colors.error[500] }]}>
              <Ionicons name="alert-circle" size={24} color={Colors.error[600]} />
              <Text style={styles.summaryValue}>{summary.highCount + summary.criticalCount}</Text>
              <Text style={styles.summaryLabel}>High</Text>
            </View>
          </View>
        )}

        {/* Alerts Trend Chart */}
        {trends && (
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Weekly Alert Trends</Text>
            <View style={styles.chartCard}>
              <LineChart
                data={trends}
                width={Dimensions.get("window").width - 60}
                height={180}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#ffffff",
                  backgroundGradientTo: "#ffffff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: "#EF4444",
                  },
                }}
                bezier
                style={styles.chart}
              />
              <Text style={styles.chartDescription}>Number of abnormal readings per day</Text>
            </View>
          </View>
        )}

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.filterButtons}>
            {(["all", "high", "low", "normal"] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Metrics List */}
        <FlatList
          data={healthMetrics}
          renderItem={renderHealthMetric}
          keyExtractor={(item) => item.id}
          style={styles.metricsList}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No health metrics found</Text>
              <Text style={styles.emptySubtext}>Health data will appear here when available</Text>
            </View>
          }
        />
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
  },
  alertButton: {
    position: "relative",
    padding: Spacing.sm,
  },
  alertBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: Colors.error[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  alertBadgeText: {
    color: "white",
    fontSize: 10,
    fontFamily: "Inter-Bold",
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: Colors.success[500],
    ...Shadows.sm,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
    marginTop: Spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  chartSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.sm,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartDescription: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  filterButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  metricsList: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  metricCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error[500],
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  patientId: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: Colors.white,
  },
  metricDetails: {
    marginBottom: Spacing.sm,
  },
  metricValue: {
    marginBottom: Spacing.xs,
  },
  metricName: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  normalRange: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
  },
  timestamp: {
    fontSize: 10,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
  },
  alertActions: {
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
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.primary[600],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.neutral[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.neutral[400],
  },
})
