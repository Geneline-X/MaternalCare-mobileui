"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { Colors } from "../../constants/colors"
import { useFocusEffect } from "@react-navigation/native"
import { router } from "expo-router"
import { Plus } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useApiClient } from "../../utils/api"

interface FormListItem {
  id: string
  title: string
  description: string
  completedCount: number
  totalSent: number
  version: string
}

const DynamicFormsScreen = () => {
  const [forms, setForms] = useState<FormListItem[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const apiClient = useApiClient()

  const fetchForms = async () => {
    try {
      setRefreshing(true)

      const response = await apiClient.get("/api/fhir/forms/templates", {
        _page: 1,
        _count: 20,
        status: "active",
      })

      if (response && response.data) {
        setForms(response.data)
      } else if (response && Array.isArray(response)) {
        setForms(response)
      } else {
        // Fallback data
        setForms([
          {
            id: "1",
            title: "Patient Health Assessment",
            description: "Comprehensive health evaluation form",
            completedCount: 12,
            totalSent: 15,
            version: "1.0",
          },
          {
            id: "2",
            title: "Prenatal Care Survey",
            description: "Weekly prenatal health monitoring",
            completedCount: 8,
            totalSent: 10,
            version: "1.1",
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      Alert.alert("Error", "Failed to fetch forms. Using sample data.")
      // Fallback data
      setForms([
        {
          id: "1",
          title: "Patient Health Assessment",
          description: "Comprehensive health evaluation form",
          completedCount: 12,
          totalSent: 15,
          version: "1.0",
        },
        {
          id: "2",
          title: "Prenatal Care Survey",
          description: "Weekly prenatal health monitoring",
          completedCount: 8,
          totalSent: 10,
          version: "1.1",
        },
      ])
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForms()
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchForms()
    }, []),
  )

  const onRefresh = useCallback(() => {
    fetchForms()
  }, [])

  const handleDeleteForm = async (id: string) => {
    try {
      await apiClient.delete(`/api/fhir/forms/templates/${id}`)
      setForms((prevForms) => prevForms.filter((form) => form.id !== id))
      Alert.alert("Success", "Form deleted successfully")
    } catch (error) {
      console.error("Error deleting form:", error)
      Alert.alert("Error", "Failed to delete form")
    }
  }

  const renderForm = ({ item }: { item: FormListItem }) => (
    <TouchableOpacity style={styles.formItem} onPress={() => router.push(`./form/${item.id}`)}>
      <View style={styles.formContent}>
        <Text style={styles.formTitle}>{item.title}</Text>
        <Text style={styles.formDescription}>{item.description}</Text>
        <View style={styles.formStats}>
          <Text style={styles.formStat}>Completed: {item.completedCount}</Text>
          <Text style={styles.formStat}>Sent: {item.totalSent}</Text>
        </View>
        <Text style={styles.formVersion}>Version: {item.version}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteForm(item.id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading forms...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Forms</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("./create")}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Total Forms: {forms.length}</Text>
      </View>

      <FlatList
        data={forms}
        renderItem={renderForm}
        keyExtractor={(item: FormListItem) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No forms available</Text>
            <Text style={styles.emptySubtext}>Create your first form to get started</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  } as ViewStyle,
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary[600],
  } as TextStyle,
  addButton: {
    backgroundColor: Colors.primary[500],
    padding: 10,
    borderRadius: 8,
  } as ViewStyle,
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  } as ViewStyle,
  statsText: {
    fontSize: 14,
    color: Colors.secondary[600],
  } as TextStyle,
  formItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[200],
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  formContent: {
    flex: 1,
  } as ViewStyle,
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary[600],
    marginBottom: 4,
  } as TextStyle,
  formDescription: {
    fontSize: 14,
    color: Colors.secondary[500],
    marginBottom: 8,
  } as TextStyle,
  formStats: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 4,
  } as ViewStyle,
  formStat: {
    fontSize: 12,
    color: Colors.secondary[600],
  } as TextStyle,
  formVersion: {
    fontSize: 12,
    color: Colors.secondary[400],
  } as TextStyle,
  deleteButton: {
    backgroundColor: Colors.error[500],
    padding: 10,
    borderRadius: 8,
  } as ViewStyle,
  deleteButtonText: {
    color: Colors.white,
    fontWeight: "bold",
  } as TextStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  } as ViewStyle,
  loadingText: {
    fontSize: 16,
    color: Colors.secondary[600],
  } as TextStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  } as ViewStyle,
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary[600],
    marginBottom: 8,
  } as TextStyle,
  emptySubtext: {
    fontSize: 14,
    color: Colors.secondary[400],
  } as TextStyle,
})

export default DynamicFormsScreen
