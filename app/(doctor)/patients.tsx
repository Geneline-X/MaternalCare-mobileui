"use client"

import { useState, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native"
import { Plus } from "phosphor-react-native"
import { Colors } from "@/constants/colors"
import { useFocusEffect } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { apiClient } from "@/utils/api"

interface Patient {
  id: string
  name: string
  condition: string
  lastVisit: string
  age: number
  phone: string
  pregnancyWeek?: number
  riskLevel: "Low" | "Medium" | "High"
}

const patientsData: Patient[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    condition: "Pregnancy - 24 weeks",
    lastVisit: "2024-01-15",
    age: 28,
    phone: "+1 (555) 123-4567",
    pregnancyWeek: 24,
    riskLevel: "Low",
  },
  {
    id: "2",
    name: "Emily Davis",
    condition: "Pregnancy - 32 weeks",
    lastVisit: "2024-02-01",
    age: 32,
    phone: "+1 (555) 234-5678",
    pregnancyWeek: 32,
    riskLevel: "Medium",
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    condition: "Pregnancy - 16 weeks",
    lastVisit: "2024-02-10",
    age: 25,
    phone: "+1 (555) 345-6789",
    pregnancyWeek: 16,
    riskLevel: "Low",
  },
  {
    id: "4",
    name: "Jennifer Wilson",
    condition: "Pregnancy - 38 weeks",
    lastVisit: "2024-02-15",
    age: 30,
    phone: "+1 (555) 456-7890",
    pregnancyWeek: 38,
    riskLevel: "High",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    condition: "Pregnancy - 20 weeks",
    lastVisit: "2024-02-20",
    age: 27,
    phone: "+1 (555) 567-8901",
    pregnancyWeek: 20,
    riskLevel: "Low",
  },
]

export default function Patients() {
  const router = useRouter()
  const [patients, setPatients] = useState(patientsData)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    apiClient.getPatients().then((res) => {
      setPatients(res)
      setRefreshing(false)
    })
  }, [])

  useFocusEffect(
    useCallback(() => {
      // This will run when the screen comes into focus
      console.log("Patients screen is focused")
      return () => {
        // This will run when the screen goes out of focus
        console.log("Patients screen is unfocused")
      }
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

  const renderPatient = ({ item }: { item: Patient }) => (
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Patients</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(doctor)/add-patient")}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{patients.length}</Text>
          <Text style={styles.summaryLabel}>Total Patients</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{patients.filter((p) => p.riskLevel === "High").length}</Text>
          <Text style={styles.summaryLabel}>High Risk</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {patients.filter((p) => p.pregnancyWeek && p.pregnancyWeek > 36).length}
          </Text>
          <Text style={styles.summaryLabel}>Due Soon</Text>
        </View>
      </View>

      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        style={styles.patientList}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding for navigation
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
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
