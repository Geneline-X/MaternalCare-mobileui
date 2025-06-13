"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from "react-native"
import { useUser } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import { useRouter } from "expo-router"

const Dashboard: React.FC = () => {
  const { user } = useUser()
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }, [])

  // For now, assume all users are doctors since we don't have role management
  const isDoctor = true

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerText}>Welcome back,</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push("/notifications")}>
                <Ionicons name="notifications-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push("/settings")}>
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.role}>{isDoctor ? "Healthcare Provider" : "Patient"}</Text>
        </View>

        {/* Avatar and Greeting */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                user?.imageUrl ||
                "https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
            }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={20} color="#aaa" />
              <Text style={styles.searchPlaceholder}>Search doctor</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="person-add-outline" size={24} color="#2F80ED" />
            </View>
            <Text style={styles.actionText}>Add Patient</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="heart-outline" size={24} color="#2F80ED" />
            </View>
            <Text style={styles.actionText}>Add Pregnancy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIcon}>
              <Ionicons name="calendar-outline" size={24} color="#2F80ED" />
            </View>
            <Text style={styles.actionText}>Schedule Visit</Text>
          </TouchableOpacity>
        </View>

        {/* Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isDoctor ? "Today's Appointments" : "Next Appointment"}</Text>
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <Ionicons name={isDoctor ? "calendar-outline" : "medkit-outline"} size={24} color="#2F80ED" />
              <Text style={styles.cardTitle}>
                {isDoctor ? "3 appointments scheduled" : "Dr. Charlie Start - Tomorrow, 10:30 AM"}
              </Text>
            </View>
            <Text style={styles.cardSubtext}>
              {isDoctor ? "Tap to manage your schedule" : "Heart Specialist | Video Call"}
            </Text>
          </View>
        </View>

        {/* Analytics Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics Overview</Text>
          <View style={styles.card}>
            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#2F80ED",
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerText: {
    color: "#DDE9FF",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
  },
  userName: {
    color: "white",
    fontSize: 24,
    fontFamily: "Poppins-SemiBold",
  },
  role: {
    color: "#A8C3FF",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Inter-Medium",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#F2F4F7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: "#999",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  actionButton: {
    alignItems: "center",
    width: "30%",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#2F80ED",
    textAlign: "center",
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: "Poppins-Medium",
    color: "#2F80ED",
  },
  cardSubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#666",
  },
  chart: {},
})
