"use client"

import { useState, useCallback, useEffect } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native"
import { Plus } from "phosphor-react-native"
import { Colors } from "@/constants/colors"
import { useFocusEffect } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useApiClient } from "@/utils/api"
import { useToast } from "react-native-toast-notifications"
import type { PatientListItem, PaginatedResponse, PatientSummary } from "@/types/api"

export default function Patients() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [summary, setSummary] = useState<PatientSummary | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const apiClient = useApiClient()
  const toast = useToast()

  const fetchPatients = async () => {
    try {
      setRefreshing(true)

      // Use caching with 10 minutes TTL for patients data
      const cacheOptions = { ttl: 10 * 60 * 1000 } // 10 minutes

      const [patientsResponse, summaryResponse] = await Promise.all([
        apiClient.get<PaginatedResponse<PatientListItem>>(
          "/api/fhir/Patient",
          {
            _page: 1,
            _count: 50,
            _include: "Patient:pregnancy",
          },
          cacheOptions,
        ),
        apiClient.get<PatientSummary>("/api/patients/summary", {}, cacheOptions),
      ])

      if (patientsResponse.success && patientsResponse.data) {
        setPatients(patientsResponse.data.data)
      }

      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data)
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      if ((error as Error).message?.includes("429")) {
        toast.show("Rate limit reached. Using cached data if available.", { type: "warning" })
      } else {
        toast.show("Failed to load patients", { type: "danger" })
      }
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const onRefresh = useCallback(() => {
    fetchPatients()
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchPatients()
    }, []),
  )

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

  const renderPatient = ({ item }: { item: PatientListItem }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => {
        console.log(`Navigating to patient details for: ${item.name} (ID: ${item.id})`)
        router.push({
          pathname: "/(doctor)/patient-details",
          params: { patientId: item.id },
        })
      }}
    >
      <View style={styles.patientInfo}>
        <View style={styles.patientHeader}>
          <Text style={styles.patientName}>{item.name}</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.riskLevel) }]}>
            <Text style={styles.riskText}>{item.riskLevel}</Text>
          </View>
        </View>
        <Text style={styles.patientCondition}>{item.condition}</Text>
        <Text style={styles.patientAge}>
          Age: {item.age} • Phone: {item.phone}
        </Text>
      </View>
      <View style={styles.patientMeta}>
        <Text style={styles.patientLastVisit}>Last Visit</Text>
        <Text style={styles.patientDate}>{item.lastVisit}</Text>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Patients</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(doctor)/add-patient")}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.totalPatients}</Text>
            <Text style={styles.summaryLabel}>Total Patients</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.highRiskPatients}</Text>
            <Text style={styles.summaryLabel}>High Risk</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{summary.dueSoonPatients}</Text>
            <Text style={styles.summaryLabel}>Due Soon</Text>
          </View>
        </View>
      )}

      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        style={styles.patientList}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No patients found</Text>
            <Text style={styles.emptySubtext}>Add your first patient to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const viewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  addButton: {
    backgroundColor: Colors.primary[500],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary[600],
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginTop: 4,
  },
  patientList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  patientItem: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  patientInfo: {
    flex: 1,
  },
  patientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  riskText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  patientMeta: {
    alignItems: "flex-end",
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
    paddingTop: 100,
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

const textStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.neutral[800],
  },
  patientCondition: {
    fontSize: 14,
    color: Colors.primary[600],
    fontWeight: "500",
    marginBottom: 2,
  },
  patientAge: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  patientLastVisit: {
    fontSize: 12,
    color: Colors.neutral[500],
    marginBottom: 2,
  },
  patientDate: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral[700],
  },
})

const styles = {
  ...viewStyles,
  ...textStyles,
} as const
