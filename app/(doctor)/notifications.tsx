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
  Modal,
  ScrollView,
  Platform,
} from "react-native"
import { useRouter } from "expo-router"
import { useUser } from "@clerk/clerk-expo"
import {
  ArrowLeft,
  Bell,
  Plus,
  Filter,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  Heart,
  MessageSquare,
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
  type: "appointment" | "patient_update" | "emergency" | "reminder" | "system"
  timestamp: string
  isRead: boolean
  priority: "low" | "medium" | "high"
  patientName?: string
  actionRequired?: boolean
}

interface ComposeNotification {
  recipient: string
  subject: string
  message: string
  priority: "low" | "medium" | "high"
  type: "appointment" | "patient_update" | "reminder" | "general"
}

const mockNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "High-Risk Patient Alert",
    message: "Sarah Johnson's blood pressure readings are concerning. Immediate attention required.",
    type: "emergency",
    timestamp: "2024-01-15T10:30:00Z",
    isRead: false,
    priority: "high",
    patientName: "Sarah Johnson",
    actionRequired: true,
  },
  {
    id: "2",
    title: "Appointment Reminder",
    message: "You have 3 appointments scheduled for today starting at 2:00 PM.",
    type: "appointment",
    timestamp: "2024-01-15T08:00:00Z",
    isRead: false,
    priority: "medium",
  },
  {
    id: "3",
    title: "Patient Update",
    message: "Emily Davis completed her prenatal vitamins intake for the week.",
    type: "patient_update",
    timestamp: "2024-01-14T16:45:00Z",
    isRead: true,
    priority: "low",
    patientName: "Emily Davis",
  },
  {
    id: "4",
    title: "Lab Results Available",
    message: "New lab results are available for Maria Rodriguez. Review required.",
    type: "patient_update",
    timestamp: "2024-01-14T14:20:00Z",
    isRead: true,
    priority: "medium",
    patientName: "Maria Rodriguez",
    actionRequired: true,
  },
  {
    id: "5",
    title: "System Maintenance",
    message: "Scheduled system maintenance will occur tonight from 11 PM to 2 AM.",
    type: "system",
    timestamp: "2024-01-14T09:00:00Z",
    isRead: true,
    priority: "low",
  },
]

export default function NotificationsScreen() {
  const router = useRouter()
  const { user } = useUser()
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread" | "high_priority">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCompose, setShowCompose] = useState(false)
  const [expoPushToken, setExpoPushToken] = useState<string>("")
  const notificationListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null)
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null)

  const [composeForm, setComposeForm] = useState<ComposeNotification>({
    recipient: "",
    subject: "",
    message: "",
    priority: "medium",
    type: "general",
  })

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
        lightColor: "#FF231F7C",
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

  const sendPushNotification = async (expoPushToken: string, title: string, body: string) => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: title,
      body: body,
      data: { someData: "goes here" },
    }

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })
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
          notification.patientName?.toLowerCase().includes(searchQuery.toLowerCase()),
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
    const iconColor =
      priority === "high" ? Colors.error[500] : priority === "medium" ? Colors.warning[500] : Colors.primary[500]

    switch (type) {
      case "emergency":
        return <AlertCircle size={24} color={Colors.error[500]} />
      case "appointment":
        return <Calendar size={24} color={iconColor} />
      case "patient_update":
        return <Heart size={24} color={iconColor} />
      case "reminder":
        return <Clock size={24} color={iconColor} />
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

  const handleSendNotification = async () => {
    if (!composeForm.recipient || !composeForm.subject || !composeForm.message) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    try {
      // In a real app, you would send this to your backend API
      // For demo purposes, we'll send a push notification to the current device
      if (expoPushToken) {
        await sendPushNotification(expoPushToken, composeForm.subject, composeForm.message)
        Alert.alert("Success", "Notification sent successfully!")
      }

      // Reset form
      setComposeForm({
        recipient: "",
        subject: "",
        message: "",
        priority: "medium",
        type: "general",
      })
      setShowCompose(false)
    } catch (error) {
      Alert.alert("Error", "Failed to send notification")
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
          {item.patientName && <Text style={styles.patientName}>Patient: {item.patientName}</Text>}
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
        <TouchableOpacity style={styles.composeButton} onPress={() => setShowCompose(true)}>
          <Plus size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
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
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.primary[600]} />
        </TouchableOpacity>
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
            High Priority
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions Row */}
      {unreadCount > 0 && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <CheckCircle size={16} color={Colors.primary[600]} />
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

      {/* Compose Modal */}
      <Modal visible={showCompose} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCompose(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Send Notification</Text>
            <TouchableOpacity onPress={handleSendNotification}>
              <Text style={styles.modalSendText}>Send</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Recipient *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter patient name or doctor ID"
                value={composeForm.recipient}
                onChangeText={(text) => setComposeForm({ ...composeForm, recipient: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Subject *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter notification subject"
                value={composeForm.subject}
                onChangeText={(text) => setComposeForm({ ...composeForm, subject: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.typeButtons}>
                {["general", "appointment", "patient_update", "reminder"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, composeForm.type === type && styles.activeTypeButton]}
                    onPress={() => setComposeForm({ ...composeForm, type: type as any })}
                  >
                    <Text style={[styles.typeButtonText, composeForm.type === type && styles.activeTypeButtonText]}>
                      {type.replace("_", " ").toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.priorityButtons}>
                {["low", "medium", "high"].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[styles.priorityButton, composeForm.priority === priority && styles.activePriorityButton]}
                    onPress={() => setComposeForm({ ...composeForm, priority: priority as any })}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        composeForm.priority === priority && styles.activePriorityButtonText,
                      ]}
                    >
                      {priority.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Message *</Text>
              <TextInput
                style={[styles.formInput, styles.messageInput]}
                placeholder="Enter your message..."
                value={composeForm.message}
                onChangeText={(text) => setComposeForm({ ...composeForm, message: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
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
    backgroundColor: Colors.error[500],
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
  composeButton: {
    backgroundColor: Colors.primary[500],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sm,
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
  filterButton: {
    backgroundColor: Colors.white,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.neutral[200],
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
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
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
    color: Colors.primary[600],
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
    borderLeftColor: Colors.primary[500],
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
  patientName: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.primary[600],
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
    backgroundColor: Colors.warning[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: "flex-start",
  },
  actionBadgeText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: Colors.warning[700],
  },
  unreadDot: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: Colors.neutral[800],
  },
  modalSendText: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: Colors.primary[600],
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[800],
    backgroundColor: Colors.neutral[50],
  },
  messageInput: {
    height: 100,
    textAlignVertical: "top",
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  activeTypeButton: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  typeButtonText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  activeTypeButtonText: {
    color: Colors.white,
  },
  priorityButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    alignItems: "center",
  },
  activePriorityButton: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  priorityButtonText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.neutral[600],
  },
  activePriorityButtonText: {
    color: Colors.white,
  },
})
