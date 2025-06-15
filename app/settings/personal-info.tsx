"use client"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Link } from "expo-router"
import { useAuth } from "../../contexts/AuthContext"
import { User, Mail, Phone, Calendar, MapPin, Edit3 } from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"

export default function PersonalInfo() {
  const { user } = useAuth()


  const infoItems = [
    {
      icon: User,
      label: "Full Name",
      value: user?.name || "Not provided",
    },
    {
      icon: Mail,
      label: "Email",
      value: user?.email || "Not provided",
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: "+1 (555) 123-4567",
    },
    {
      icon: Calendar,
      label: "Date of Birth",
      value: "January 15, 1995",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "123 Main St, City, State 12345",
    },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          {infoItems.map((item, index) => (
            <View key={index} style={[styles.infoItem, index === infoItems.length - 1 && styles.lastItem]}>
              <View style={styles.infoLeft}>
                <View style={styles.iconContainer}>
                  <item.icon size={20} color={Colors.primary[600]} />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Link href="./edit-profile" asChild>
          <TouchableOpacity style={styles.editButton}>
            <Edit3 size={20} color={Colors.white} />
            <Text style={styles.editButtonText}>Edit Information</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  content: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    marginBottom: Spacing.xl,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.neutral[800],
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
})
