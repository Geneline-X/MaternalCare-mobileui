"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native"
import { useRouter } from "expo-router"
import {
  ArrowLeft,
  Plus,
  Smartphone,
  Watch,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  Settings,
  Trash2,
  RefreshCw,
} from "lucide-react-native"
import { Colors } from "../../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../../constants/spacing"
import { useTheme } from "@/contexts/ThemeContext"
import { useTranslation } from "@/contexts/TranslationContext"

interface ConnectedDevice {
  id: string
  name: string
  type: "smartwatch" | "fitness_tracker" | "blood_pressure" | "glucose_meter" | "scale"
  brand: string
  model: string
  isConnected: boolean
  lastSync: string
  batteryLevel?: number
  dataTypes: string[]
}

const mockDevices: ConnectedDevice[] = [
  {
    id: "1",
    name: "Apple Watch Series 9",
    type: "smartwatch",
    brand: "Apple",
    model: "Series 9",
    isConnected: true,
    lastSync: "2024-01-15T10:30:00Z",
    batteryLevel: 85,
    dataTypes: ["Heart Rate", "Steps", "Sleep", "Activity"],
  },
  {
    id: "2",
    name: "Omron Blood Pressure Monitor",
    type: "blood_pressure",
    brand: "Omron",
    model: "HEM-7156T",
    isConnected: true,
    lastSync: "2024-01-15T08:15:00Z",
    batteryLevel: 60,
    dataTypes: ["Blood Pressure", "Heart Rate"],
  },
  {
    id: "3",
    name: "Fitbit Charge 5",
    type: "fitness_tracker",
    brand: "Fitbit",
    model: "Charge 5",
    isConnected: false,
    lastSync: "2024-01-14T16:45:00Z",
    batteryLevel: 25,
    dataTypes: ["Steps", "Heart Rate", "Sleep", "Stress"],
  },
]

export default function ConnectedDevices() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const [devices, setDevices] = useState<ConnectedDevice[]>(mockDevices)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = () => {
    setRefreshing(true)
    // Simulate API call to refresh device status
    setTimeout(() => {
      setRefreshing(false)
      Alert.alert("Success", "Device status updated")
    }, 2000)
  }

  const getDeviceIcon = (type: string, isConnected: boolean) => {
    const iconColor = isConnected ? Colors.success[600] : Colors.neutral[400]

    switch (type) {
      case "smartwatch":
        return <Watch size={24} color={iconColor} />
      case "fitness_tracker":
        return <Activity size={24} color={iconColor} />
      case "blood_pressure":
        return <Activity size={24} color={iconColor} />
      case "glucose_meter":
        return <Activity size={24} color={iconColor} />
      case "scale":
        return <Activity size={24} color={iconColor} />
      default:
        return <Smartphone size={24} color={iconColor} />
    }
  }

  const handleConnectDevice = (deviceId: string) => {
    setDevices(
      devices.map((device) =>
        device.id === deviceId
          ? { ...device, isConnected: !device.isConnected, lastSync: new Date().toISOString() }
          : device,
      ),
    )
  }

  const handleRemoveDevice = (deviceId: string) => {
    Alert.alert("Remove Device", "Are you sure you want to remove this device? All associated data will be deleted.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setDevices(devices.filter((device) => device.id !== deviceId)),
      },
    ])
  }

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const DeviceCard = ({ device }: { device: ConnectedDevice }) => (
    <View style={[styles.deviceCard, isDarkMode && styles.deviceCardDark]}>
      <View style={styles.deviceHeader}>
        <View style={styles.deviceInfo}>
          <View style={styles.deviceIconContainer}>
            {getDeviceIcon(device.type, device.isConnected)}
            <View style={[styles.connectionStatus, device.isConnected ? styles.connected : styles.disconnected]} />
          </View>
          <View style={styles.deviceDetails}>
            <Text style={[styles.deviceName, isDarkMode && styles.deviceNameDark]}>{device.name}</Text>
            <Text style={[styles.deviceModel, isDarkMode && styles.deviceModelDark]}>
              {device.brand} {device.model}
            </Text>
            <View style={styles.deviceStatus}>
              {device.isConnected ? (
                <Wifi size={12} color={Colors.success[600]} />
              ) : (
                <WifiOff size={12} color={Colors.neutral[400]} />
              )}
              <Text style={[styles.statusText, isDarkMode && styles.statusTextDark]}>
                {device.isConnected ? "Connected" : "Disconnected"}
              </Text>
              {device.batteryLevel && (
                <>
                  <Battery size={12} color={Colors.neutral[400]} />
                  <Text style={[styles.batteryText, isDarkMode && styles.batteryTextDark]}>{device.batteryLevel}%</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={styles.deviceActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleConnectDevice(device.id)}>
            {device.isConnected ? (
              <WifiOff size={16} color={Colors.neutral[600]} />
            ) : (
              <Wifi size={16} color={Colors.primary[600]} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert("Device Settings", "Configure device settings")}
          >
            <Settings size={16} color={Colors.neutral[600]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleRemoveDevice(device.id)}>
            <Trash2 size={16} color={Colors.error[600]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.deviceData}>
        <Text style={[styles.dataTitle, isDarkMode && styles.dataTitleDark]}>Data Types:</Text>
        <View style={styles.dataTypes}>
          {device.dataTypes.map((dataType, index) => (
            <View key={index} style={styles.dataTypeChip}>
              <Text style={styles.dataTypeText}>{dataType}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.lastSync, isDarkMode && styles.lastSyncDark]}>
          Last sync: {formatLastSync(device.lastSync)}
        </Text>
      </View>
    </View>
  )

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? Colors.white : Colors.neutral[600]} />
        </TouchableOpacity>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>Connected Devices</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert("Add Device", "Scan for new devices")}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Section */}
        <View style={[styles.statsSection, isDarkMode && styles.statsSectionDark]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDarkMode && styles.statValueDark]}>{devices.length}</Text>
            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Total Devices</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDarkMode && styles.statValueDark, { color: Colors.success[600] }]}>
              {devices.filter((d) => d.isConnected).length}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Connected</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDarkMode && styles.statValueDark, { color: Colors.warning[600] }]}>
              {devices.filter((d) => !d.isConnected).length}
            </Text>
            <Text style={[styles.statLabel, isDarkMode && styles.statLabelDark]}>Offline</Text>
          </View>
        </View>

        {/* Devices List */}
        <View style={styles.devicesSection}>
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </View>

        {/* Add Device Section */}
        <View style={[styles.addDeviceSection, isDarkMode && styles.addDeviceSectionDark]}>
          <Text style={[styles.addDeviceTitle, isDarkMode && styles.addDeviceTitleDark]}>Add New Device</Text>
          <Text style={[styles.addDeviceDescription, isDarkMode && styles.addDeviceDescriptionDark]}>
            Connect health monitoring devices to automatically sync your health data
          </Text>
          <TouchableOpacity style={styles.scanButton} onPress={() => Alert.alert("Scan", "Scanning for devices...")}>
            <RefreshCw size={20} color={Colors.white} />
            <Text style={styles.scanButtonText}>Scan for Devices</Text>
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View style={[styles.infoSection, isDarkMode && styles.infoSectionDark]}>
          <Text style={[styles.infoTitle, isDarkMode && styles.infoTitleDark]}>Supported Devices</Text>
          <Text style={[styles.infoText, isDarkMode && styles.infoTextDark]}>
            • Apple Watch and other smartwatches{"\n"}• Fitness trackers (Fitbit, Garmin, etc.){"\n"}• Blood pressure
            monitors{"\n"}• Glucose meters{"\n"}• Smart scales{"\n"}• Heart rate monitors
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  containerDark: {
    backgroundColor: Colors.neutral[900],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  headerDark: {
    backgroundColor: Colors.neutral[800],
    borderBottomColor: Colors.neutral[700],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  titleDark: {
    color: Colors.white,
  },
  addButton: {
    backgroundColor: Colors.primary[600],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  statsSection: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    justifyContent: "space-around",
    ...Shadows.sm,
  },
  statsSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
  },
  statValueDark: {
    color: Colors.white,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
    marginTop: 2,
  },
  statLabelDark: {
    color: Colors.neutral[400],
  },
  devicesSection: {
    paddingHorizontal: Spacing.lg,
  },
  deviceCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  deviceCardDark: {
    backgroundColor: Colors.neutral[800],
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  deviceInfo: {
    flexDirection: "row",
    flex: 1,
  },
  deviceIconContainer: {
    position: "relative",
    marginRight: Spacing.md,
  },
  connectionStatus: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  connected: {
    backgroundColor: Colors.success[500],
  },
  disconnected: {
    backgroundColor: Colors.neutral[400],
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: 2,
  },
  deviceNameDark: {
    color: Colors.white,
  },
  deviceModel: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    marginBottom: Spacing.sm,
  },
  deviceModelDark: {
    color: Colors.neutral[400],
  },
  deviceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  statusTextDark: {
    color: Colors.neutral[400],
  },
  batteryText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  batteryTextDark: {
    color: Colors.neutral[400],
  },
  deviceActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  deviceData: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    paddingTop: Spacing.md,
  },
  dataTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
  },
  dataTitleDark: {
    color: Colors.white,
  },
  dataTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dataTypeChip: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  dataTypeText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.primary[700],
  },
  lastSync: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
  },
  lastSyncDark: {
    color: Colors.neutral[400],
  },
  addDeviceSection: {
    backgroundColor: Colors.primary[50],
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  addDeviceSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  addDeviceTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: Colors.primary[700],
    marginBottom: Spacing.sm,
  },
  addDeviceTitleDark: {
    color: Colors.white,
  },
  addDeviceDescription: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.primary[600],
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  addDeviceDescriptionDark: {
    color: Colors.neutral[300],
  },
  scanButton: {
    backgroundColor: Colors.primary[600],
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  scanButtonText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.white,
  },
  infoSection: {
    backgroundColor: Colors.neutral[100],
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  infoSectionDark: {
    backgroundColor: Colors.neutral[800],
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    marginBottom: Spacing.sm,
  },
  infoTitleDark: {
    color: Colors.white,
  },
  infoText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    lineHeight: 20,
  },
  infoTextDark: {
    color: Colors.neutral[300],
  },
})
