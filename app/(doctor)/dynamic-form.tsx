"use client"

import { useState, useEffect, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ViewStyle, TextStyle } from "react-native"
import { Colors } from "../../constants/colors"
import { useFocusEffect } from "@react-navigation/native"
import { useToast } from "react-native-toast-notifications"
import { router } from "expo-router"
import { Plus } from "lucide-react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomBottomNavigation from "../../components/CustomBottomNavigation"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { FormTemplate } from "../../types/app"

const DynamicFormsScreen = () => {
  const [forms, setForms] = useState<FormTemplate[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const toast = useToast()
  const { isSignedIn, userId } = useAuth()
  const { user } = useUser()

  const mockForms: FormTemplate[] = [
  {
    id: "1",
    title: "Prenatal Care Form",
    description: "Initial prenatal assessment form",
    version: "1.0",
    status: "active",
    completedCount: 0,
    totalSent: 0,
    lastUpdated: new Date().toISOString(),
    fields: [],
    createdBy: "admin",
  },
  {
    id: "2",
    title: "Postnatal Care Form",
    description: "Follow-up care form for postpartum patients",
    version: "1.0",
    status: "active",
    completedCount: 0,
    totalSent: 0,
    lastUpdated: new Date().toISOString(),
    fields: [],
    createdBy: "admin",
  },
];

const fetchForms = () => {
    setRefreshing(true)
    try {
      setForms(mockForms);
    } catch (error) {
      toast.show("Failed to fetch forms", { type: "danger" })
    } finally {
      setRefreshing(false)
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

  const handleDeleteForm = (id: string) => {
    try {
      setForms((prevForms) => prevForms.filter((form) => form.id !== id))
      toast.show("Form deleted successfully", { type: "success" })
    } catch (error) {
      toast.show("Failed to delete form", { type: "danger" })
    }
  }

  const renderForm = ({ item }: { item: FormTemplate }) => (
    <TouchableOpacity style={styles.formItem} onPress={() => router.push(`./form/${item.id}`)}>
      <View style={styles.formContent}>
        <Text style={styles.formTitle}>{item.title}</Text>
        <Text style={styles.formDescription}>{item.description}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteForm(item.id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Forms</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("./create")}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>{/* You can add stats here if needed */}</View>

      <FlatList
        data={forms}
        renderItem={renderForm}
        keyExtractor={(item: FormTemplate) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding for navigation
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />

      <CustomBottomNavigation />
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
  formList: {
    flex: 1,
    backgroundColor: Colors.white,
  } as ViewStyle,
  formItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary[200],
  } as ViewStyle,
  formContent: {
    flex: 1,
  } as ViewStyle,
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary[600],
  } as TextStyle,
  formDescription: {
    fontSize: 14,
    color: Colors.secondary[500],
    marginTop: 5,
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
})

export default DynamicFormsScreen
