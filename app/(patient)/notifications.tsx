"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { useUser } from "@clerk/clerk-expo"
import {
  ArrowLeft,
  Bell,
  Search,
  AlertCircle,
  CheckCircle,
  Calendar,
  Heart,
  MessageSquare,
  Baby,
} from "lucide-react-native"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

interface NotificationItem {
  id: string
  title: string
  message: string
  type: "appointment" | "health_reminder" | "baby_development" | "medication" | "checkup" | "system"
  timestamp: string
  isRead: boolean
  priority: "low" | "medium" | "high"
  doctorName?: string
  actionRequired?: boolean
}

const mockPatientNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Appointment Reminder",
    message: "You have an appointment with Dr. Sarah Johnson tomorrow at 2:00 PM. Please arrive 15 minutes early.",
    type: "appointment",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
    priority: "high",
    doctorName: "Dr. Sarah Johnson",
    actionRequired: true,
  },
  {
    id: "2",
    title: "Take Your Prenatal Vitamins",
    message: "Don't forget to take your daily prenatal vitamins. It's important for your baby's development.",
    type: "medication",
    timestamp: "2024-01-15T08:00:00Z",
    isRead: false,
    priority: "medium",
  },
  {
    id: "3",
    title: "Baby Development Update",
    message: "Week 24: Your baby is now about the size of a corn cob! Their hearing is developing rapidly.",
    type: "baby_development",
    timestamp: "2024-01-14T16:45:00Z",
    isRead: true,
    priority: "low",
  },
  {
    id: "4",
    title: "Blood Pressure Check",
    message: "Time for your weekly blood pressure check. Please log your readings in the app.",
    type: "health_reminder",
    timestamp: "2024-01-14T14:20:00Z",
    isRead: true,
    priority: "medium",
    actionRequired: true,
  },
  {
    id: "5",
    title: "Lab Results Available",
    message: "Your recent lab results are now available. Everything looks normal!",
    type: "checkup",
    timestamp: "2024-01-14T09:00:00Z",
    isRead: true,
    priority: "medium",
    doctorName: "Dr. Sarah Johnson",
  },
  {
    id: "6",
    title: "Hydration Reminder",
    message: "Remember to drink plenty of water throughout the day. Aim for 8-10 glasses daily.",
    type: "health_reminder",
    timestamp: "2024-01-13T12:00:00Z",
    isRead: true,
    priority: "low",
  },
]

export default function PatientNotificationsScreen() {
  const router = useRouter()
  const { user } = useUser()
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockPatientNotifications)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread" | "high_priority">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expoPushToken, setExpoPushToken] = useState<string>("")
  const notificationListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null)
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null)

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token)
      }
    })

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification)
      // Add new notification to the list
      const newNotification: NotificationItem = {
        id: Date.now().toString(),
        title: notification.request.content.title || "New Notification",
        message: notification.request.content.body || "",
        type: "system",
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: "medium",
      }
      setNotifications((prev) => [newNotification, ...prev])
    })

    // Listen for notification responses
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response)
    })

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])

  const registerForPushNotificationsAsync = async () => {
    let token

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#E91E63",
      })
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }
      if (finalStatus !== "granted") {
        Alert.alert("Failed to get push token for push notification!")
        return
      }
      token = (await Notifications.getExpoPushTokenAsync()).data
      console.log("Expo Push Token:", token)
    } else {
      Alert.alert("Must use physical device for Push Notifications")
    }

    return token
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    switch (filter) {
      case "unread":
        filtered = filtered.filter((notification) => !notification.isRead)
        break
      case "high_priority":
        filtered = filtered.filter((notification) => notification.priority === "high")
        break
      default:
        break
    }

    return filtered
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconColor = priority === "high" ? Colors.error[500] : priority === "medium" ? Colors.warning[500] : "#E91E63"

    switch (type) {
      case "appointment":
        return <Calendar size={24} color={iconColor} />
      case "health_reminder":
        return <Heart size={24} color={iconColor} />
      case "baby_development":
        return <Baby size={24} color={iconColor} />
      case "medication":
        return <AlertCircle size={24} color={iconColor} />
      case "checkup":
        return <CheckCircle size={24} color={iconColor} />
      case "system":
        return <Bell size={24} color={iconColor} />
      default:
        return <MessageSquare size={24} color={iconColor} />
    }
  }

  const formatTimestamp = (timestamp: string) => {
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

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadNotification]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>{getNotificationIcon(item.type, item.priority)}</View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
          {item.doctorName && <Text style={styles.doctorName}>From: {item.doctorName}</Text>}
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          {item.actionRequired && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionBadgeText}>Action Required</Text>
            </View>
          )}
        </View>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  )

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const filteredNotifications = getFilteredNotifications()

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.neutral[600]} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.activeFilterTab]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterTabText, filter === "all" && styles.activeFilterTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "unread" && styles.activeFilterTab]}
          onPress={() => setFilter("unread")}
        >
          <Text style={[styles.filterTabText, filter === "unread" && styles.activeFilterTabText]}>Unread</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "high_priority" && styles.activeFilterTab]}
          onPress={() => setFilter("high_priority")}
        >
          <Text style={[styles.filterTabText, filter === "high_priority" && styles.activeFilterTabText]}>
            Important
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions Row */}
      {unreadCount > 0 && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <CheckCircle size={16} color="#E91E63" />
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color={Colors.neutral[400]} />
            <Text style={styles.emptyStateText}>No notifications found</Text>
            <Text style={styles.emptyStateSubtext}>You're all caught up!</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[800],
  },
  unreadBadge: {
    backgroundColor: "#E91E63",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: "Inter-Bold",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
    marginLeft: Spacing.sm,
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  activeFilterTab: {
    backgroundColor: "#E91E63",
    borderColor: "#E91E63",
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  activeFilterTabText: {
    color: Colors.white,
  },
  actionsRow: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#E91E63",
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
    position: "relative",
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#E91E63",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    marginRight: Spacing.md,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadTitle: {
    fontFamily: "Inter-Bold",
  },
  timestamp: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
  },
  doctorName: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#E91E63",
    marginBottom: Spacing.xs,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[600],
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  actionBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
  },
  actionBadgeText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: "#F57C00",
  },
  unreadDot: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E91E63",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxxl,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[600],
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
    marginTop: Spacing.xs,
  },
})
