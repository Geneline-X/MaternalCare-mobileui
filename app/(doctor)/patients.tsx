"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native"
import { Plus } from "phosphor-react-native"
import { Colors } from "@/constants/colors"
import { useFocusEffect } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { useApiClient } from "@/utils/api"
import { requestManager } from "@/utils/requestManager"

interface PatientListItem {
  id: string
  name: string
  age: number
  phone: string
  condition: string
  riskLevel: "High" | "Medium" | "Low"
  lastVisit: string
}

interface PatientSummary {
  totalPatients: number
  highRiskPatients: number
  dueSoonPatients: number
}

export default function Patients() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [summary, setSummary] = useState<PatientSummary | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const apiClient = useApiClient()
  const mountedRef = useRef(true)
  const loadingRef = useRef(false)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Fallback data
  const getFallbackPatients = (): PatientListItem[] => [
    {
      id: "1",
      name: "Sarah Johnson",
      age: 28,
      phone: "+1234567890",
      condition: "Pregnancy - 32 weeks",
      riskLevel: "Low",
      lastVisit: "2024-01-15",
    },
    {
      id: "2",
      name: "Maria Garcia",
      age: 35,
      phone: "+1234567891",
      condition: "Pregnancy - 28 weeks",
      riskLevel: "High",
      lastVisit: "2024-01-10",
    },
    {
      id: "3",
      name: "Emily Chen",
      age: 31,
      phone: "+1234567892",
      condition: "Pregnancy - 24 weeks",
      riskLevel: "Medium",
      lastVisit: "2024-01-12",
    },
    {
      id: "4",
      name: "Jessica Williams",
      age: 29,
      phone: "+1234567893",
      condition: "Pregnancy - 36 weeks",
      riskLevel: "Low",
      lastVisit: "2024-01-14",
    },
  ]

  const getFallbackSummary = (): PatientSummary => ({
    totalPatients: 4,
    highRiskPatients: 1,
    dueSoonPatients: 2,
  })

  const fetchPatients = async () => {
    if (loadingRef.current) {
      console.log("Patients load already in progress, skipping...")
      return
    }

    try {
      loadingRef.current = true
      setRefreshing(true)

      // Try to fetch patients from FHIR endpoint
      try {
        const response = await apiClient.get("/api/users/patients")
        
        if (mountedRef.current) {
          if (response && Array.isArray(response)) {
            const transformedPatients = response.map((patient: any) => {
              // Parse the patient data from the API response
              const firstName = patient.firstName || '';
              const lastName = patient.lastName || '';
              const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed Patient';
              
              // Calculate age from date of birth if available
              let age = 30; // Default age
              if (patient.dateOfBirth) {
                const birthDate = new Date(patient.dateOfBirth);
                if (!isNaN(birthDate.getTime())) {
                  const today = new Date();
                  age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                }
              }

              
              // Map the patient data to our UI format
              return {
                id: patient.id || `patient-${Math.random().toString(36).substr(2, 9)}`,
                name: fullName,
                age: age,
                phone: patient.phoneNumber || "Not provided",
                condition: patient.condition || "Pregnancy - Active",
                riskLevel: (patient.riskLevel || "Medium") as "Low" | "Medium" | "High",
                lastVisit: patient.lastVisitDate || new Date().toISOString().split("T")[0],
              };
            });
            
            setPatients(transformedPatients);
          } else {
            console.log("No patient data found in the expected format, using fallback");
            setPatients(getFallbackPatients());
          }
        }
      } catch (error) {
        console.error("Failed to load patients:", error)
        if (mountedRef.current) {
          setPatients(getFallbackPatients())
        }
      }

      // Try to fetch summary - but don't fail if endpoint doesn't exist
      try {
        const summaryResponse = await requestManager.queueRequest("patients-summary", () =>
          apiClient.get("/api/fhir/patients/summary"),
        )

        if (mountedRef.current) {
          if (summaryResponse && summaryResponse.data) {
            setSummary(summaryResponse.data)
          } else {
            setSummary(getFallbackSummary())
          }
        }
      } catch (error) {
        console.log("Summary endpoint not available, using calculated summary")
        if (mountedRef.current) {
          // Calculate summary from current patients
          const currentPatients = patients.length > 0 ? patients : getFallbackPatients()
          setSummary({
            totalPatients: currentPatients.length,
            highRiskPatients: currentPatients.filter((p) => p.riskLevel === "High").length,
            dueSoonPatients: Math.ceil(currentPatients.length * 0.3), // Estimate 30% due soon
          })
        }
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      if (mountedRef.current) {
        setPatients(getFallbackPatients())
        setSummary(getFallbackSummary())
      }
    } finally {
      if (mountedRef.current) {
        setRefreshing(false)
        setLoading(false)
      }
      loadingRef.current = false
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (!loading && !loadingRef.current) {
        fetchPatients()
      }
    }, [loading]),
  )

  const onRefresh = useCallback(() => {
    if (loadingRef.current) return
    fetchPatients()
  }, [])

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
