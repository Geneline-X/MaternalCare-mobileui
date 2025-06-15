"use client"

import * as React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart, PieChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import type { AnalyticsMetrics, ChartDataset, PieChartData, ReportInsight, ExportOptions } from "../../types/app"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomBottomNavigation from "../../components/CustomBottomNavigation"

const screenWidth = Dimensions.get("window").width

const mockAnalyticsData = {
  patientTrends: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [45, 52, 48, 61, 58, 67],
        color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  } as ChartDataset,
  riskDistribution: [
    {
      name: "Low Risk",
      population: 65,
      color: "#4CAF50",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Medium Risk",
      population: 25,
      color: "#FF9800",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "High Risk",
      population: 10,
      color: "#F44336",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
  ] as PieChartData[],
  gestationalAge: {
    labels: ["<12w", "12-24w", "24-32w", "32-36w", ">36w"],
    datasets: [
      {
        data: [8, 15, 22, 18, 12],
        color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
      },
    ],
  } as ChartDataset,
  monthlyMetrics: {
    totalPatients: 124,
    newPatients: 18,
    completedPregnancies: 12,
    averageVisits: 4.2,
    satisfactionScore: 4.8,
  } as AnalyticsMetrics,
}

const insights: ReportInsight[] = [
  {
    id: "1",
    type: "positive",
    title: "Positive Trends",
    description: "Overall health metrics showing improvement",
    actionItems: [
      "15% increase in prenatal visit attendance",
      "Average blood pressure readings improved by 8%",
      "Patient satisfaction scores increased to 4.8/5",
    ],
  },
  {
    id: "2",
    type: "concern",
    title: "Areas of Concern",
    description: "Issues requiring attention",
    actionItems: [
      "12% of patients show elevated glucose levels",
      "3 patients missed their last scheduled appointments",
      "Weight gain monitoring needs improvement",
    ],
  },
  {
    id: "3",
    type: "recommendation",
    title: "Recommendations",
    description: "Suggested improvements",
    actionItems: [
      "Implement automated appointment reminders",
      "Increase glucose monitoring frequency for at-risk patients",
      "Develop nutrition counseling program",
    ],
  },
]

export default function ReportsAnalytics() {
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1month" | "3months" | "6months" | "1year">("6months")
  const [selectedChart, setSelectedChart] = useState<"trends" | "risk" | "age">("trends")

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }, [])

  const handleExportPDF = () => {
    const exportOptions: ExportOptions = {
      format: "pdf",
      includeCharts: true,
      includePatientData: true,
      includeHealthMetrics: true,
      dateRange: {
        start: "2024-01-01",
        end: "2024-06-30",
      },
    }

    Alert.alert("Export PDF", "Generate a comprehensive report in PDF format?", [
      { text: "Cancel", style: "cancel" },
      { text: "Export", onPress: () => console.log("Exporting PDF...", exportOptions) },
    ])
  }

  const handleExportCSV = () => {
    const exportOptions: ExportOptions = {
      format: "csv",
      includeCharts: false,
      includePatientData: true,
      includeHealthMetrics: true,
      dateRange: {
        start: "2024-01-01",
        end: "2024-06-30",
      },
    }

    Alert.alert("Export CSV", "Export raw data in CSV format?", [
      { text: "Cancel", style: "cancel" },
      { text: "Export", onPress: () => console.log("Exporting CSV...", exportOptions) },
    ])
  }

  const renderMetricCard = (title: string, value: string | number, icon: keyof typeof Ionicons.glyphMap, color: string, subtitle?: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricTitle}>{title}</Text>
          {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  )

  const renderInsightCard = (insight: ReportInsight) => {
    const getInsightIcon = (type: ReportInsight["type"]) => {
      switch (type) {
        case "positive":
          return "trending-up"
        case "concern":
          return "warning"
        case "recommendation":
          return "bulb"
        default:
          return "information-circle"
      }
    }

    const getInsightColor = (type: ReportInsight["type"]) => {
      switch (type) {
        case "positive":
          return Colors.success[600]
        case "concern":
          return Colors.warning[600]
        case "recommendation":
          return Colors.primary[600]
        default:
          return Colors.neutral[600]
      }
    }

    return (
      <View key={insight.id} style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name={getInsightIcon(insight.type)} size={24} color={getInsightColor(insight.type)} />
          <Text style={styles.insightTitle}>{insight.title}</Text>
        </View>
        {insight.actionItems?.map((item, index) => (
          <Text key={index} style={styles.insightText}>
            • {item}
          </Text>
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
            <Ionicons name="document-text-outline" size={20} color={Colors.primary[600]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportCSV}>
            <Ionicons name="download-outline" size={20} color={Colors.primary[600]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding for navigation
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Timeframe Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Time Period</Text>
          <View style={styles.filterButtons}>
            {[
              { key: "1month" as const, label: "1M" },
              { key: "3months" as const, label: "3M" },
              { key: "6months" as const, label: "6M" },
              { key: "1year" as const, label: "1Y" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterButton, selectedTimeframe === filter.key && styles.filterButtonActive]}
                onPress={() => setSelectedTimeframe(filter.key)}
              >
                <Text
                  style={[styles.filterButtonText, selectedTimeframe === filter.key && styles.filterButtonTextActive]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              "Total Patients",
              mockAnalyticsData.monthlyMetrics.totalPatients,
              "people",
              "#2F80ED",
              "Active cases",
            )}
            {renderMetricCard(
              "New Patients",
              mockAnalyticsData.monthlyMetrics.newPatients,
              "person-add",
              "#4CAF50",
              "This month",
            )}
            {renderMetricCard(
              "Completed",
              mockAnalyticsData.monthlyMetrics.completedPregnancies,
              "checkmark-circle",
              "#9C27B0",
              "Deliveries",
            )}
            {renderMetricCard(
              "Avg Visits",
              mockAnalyticsData.monthlyMetrics.averageVisits,
              "calendar",
              "#FF9800",
              "Per patient",
            )}
            {renderMetricCard(
              "Satisfaction",
              `${mockAnalyticsData.monthlyMetrics.satisfactionScore}/5`,
              "star",
              "#FFC107",
              "Patient rating",
            )}
          </View>
        </View>

        {/* Chart Selection */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Analytics Charts</Text>
            <View style={styles.chartToggle}>
              {[
                { key: "trends" as const, label: "Trends" },
                { key: "risk" as const, label: "Risk" },
                { key: "age" as const, label: "Age" },
              ].map((chart) => (
                <TouchableOpacity
                  key={chart.key}
                  style={[styles.toggleButton, selectedChart === chart.key && styles.toggleButtonActive]}
                  onPress={() => setSelectedChart(chart.key)}
                >
                  <Text style={[styles.toggleText, selectedChart === chart.key && styles.toggleTextActive]}>
                    {chart.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chartCard}>
            {selectedChart === "trends" && (
              <>
                <Text style={styles.chartTitle}>Patient Trends (6 Months)</Text>
                <LineChart
                  data={mockAnalyticsData.patientTrends}
                  width={screenWidth - 80}
                  height={220}
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
                <Text style={styles.chartDescription}>Monthly patient visit trends showing steady growth</Text>
              </>
            )}

            {selectedChart === "risk" && (
              <>
                <Text style={styles.chartTitle}>Risk Distribution</Text>
                <PieChart
                  data={mockAnalyticsData.riskDistribution}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
                <Text style={styles.chartDescription}>Patient risk level distribution across all active cases</Text>
              </>
            )}

            {selectedChart === "age" && (
              <>
                <Text style={styles.chartTitle}>Gestational Age Distribution</Text>
                <BarChart
                  data={mockAnalyticsData.gestationalAge}
                  width={screenWidth - 80}
                  height={220}
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
                  yAxisLabel="Patients"
                  yAxisSuffix=""
                />
                <Text style={styles.chartDescription}>Patient distribution by gestational age groups</Text>
              </>
            )}
          </View>
        </View>

        {/* Population Health Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Population Health Insights</Text>
          {insights.map(renderInsightCard)}
        </View>

        {/* Export Options */}
        <View style={styles.exportSection}>
          <Text style={styles.sectionTitle}>Export Options</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity style={styles.exportCard} onPress={handleExportPDF}>
              <Ionicons name="document-text" size={32} color={Colors.error[500]} />
              <Text style={styles.exportTitle}>PDF Report</Text>
              <Text style={styles.exportDescription}>Comprehensive analytics report with charts and insights</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportCard} onPress={handleExportCSV}>
              <Ionicons name="grid" size={32} color={Colors.success[500]} />
              <Text style={styles.exportTitle}>CSV Data</Text>
              <Text style={styles.exportDescription}>Raw data export for external analysis tools</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomBottomNavigation />
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
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  exportButton: {
    padding: Spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
  },
  content: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
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
  metricsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.md,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  metricCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: "48%",
    borderLeftWidth: 4,
    ...Shadows.sm,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  metricTitle: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 10,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
  },
  chartSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  chartToggle: {
    flexDirection: "row",
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  toggleText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  toggleTextActive: {
    color: Colors.white,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.sm,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
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
  insightsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  insightCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginLeft: Spacing.sm,
  },
  insightText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginBottom: 4,
    lineHeight: 20,
  },
  exportSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  exportButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  exportCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.sm,
  },
  exportTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    textAlign: "center",
    lineHeight: 16,
  },
})
