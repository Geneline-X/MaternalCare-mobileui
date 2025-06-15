"use client"

import { useState, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from "react-native"
import { Plus } from "phosphor-react-native"
import { Colors } from "@/constants/colors"
import { useFocusEffect } from "@react-navigation/native"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomBottomNavigation from "../../components/CustomBottomNavigation"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useNavigation } from "@react-navigation/native"

export type RootStackParamList = {
  Patients: undefined;
  PatientDetails: { patientId: string };
  AddPatient: undefined;
  // Add other screens here as needed
};

export type PatientsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Patients'
>;

interface Patient {
  id: string;
  name: string;
  condition: string;
  lastVisit: string;
}

const patientsData: Patient[] = [
  { id: "1", name: "John Doe", condition: "Diabetes", lastVisit: "2024-01-15" },
  { id: "2", name: "Jane Smith", condition: "Hypertension", lastVisit: "2024-02-01" },
  { id: "3", name: "Robert Jones", condition: "Asthma", lastVisit: "2024-02-10" },
  { id: "4", name: "Emily Brown", condition: "Arthritis", lastVisit: "2024-02-15" },
  { id: "5", name: "Michael Davis", condition: "Migraine", lastVisit: "2024-02-20" },
  { id: "6", name: "Linda Wilson", condition: "Depression", lastVisit: "2024-02-25" },
  { id: "7", name: "David Garcia", condition: "Anxiety", lastVisit: "2024-03-01" },
  { id: "8", name: "Barbara Rodriguez", condition: "Insomnia", lastVisit: "2024-03-05" },
  { id: "9", name: "Anthony Williams", condition: "Allergies", lastVisit: "2024-03-10" },
  { id: "10", name: "Elizabeth Martinez", condition: "Eczema", lastVisit: "2024-03-15" },
]

export default function Patients() {
  const navigation = useNavigation<PatientsScreenNavigationProp>()
  const [patients, setPatients] = useState(patientsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    // Simulate fetching data
    setTimeout(() => {
      setPatients(patientsData) // Reset to original data
      setRefreshing(false)
    }, 1000)
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

  const filteredPatients = patients.filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => navigation.navigate("PatientDetails", { patientId: item.id })}
    >
      <View>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientCondition}>{item.condition}</Text>
      </View>
      <Text style={styles.patientLastVisit}>Last Visit: {item.lastVisit}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddPatient")}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total Patients: {patients.length}</Text>
        <Text style={styles.summaryText}>Displaying: {filteredPatients.length}</Text>
      </View>

      <FlatList
        data={filteredPatients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        style={styles.patientList}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding for navigation
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />

      <CustomBottomNavigation />
    </SafeAreaView>
  )
}

const viewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.neutral[100],
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  patientList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  patientItem: {
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const textStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.neutral[800],
  },
  summaryText: {
    fontSize: 16,
    color: Colors.neutral[800],
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[800],
  },
  patientCondition: {
    fontSize: 16,
    color: Colors.neutral[600],
  },
  patientLastVisit: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
});

const styles = {
  ...viewStyles,
  ...textStyles,
} as const;
