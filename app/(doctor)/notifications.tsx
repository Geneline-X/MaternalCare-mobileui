"use client"

import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { Colors } from "../../constants/colors"
import { Spacing, BorderRadius, Shadows } from "../../constants/spacing"
import { useApiClient } from "../../utils/api"

interface NotificationItem {
  id: string
  title: string
  message: string
  type: "appointment" | "emergency" | "reminder" | "general"
  priority: "low" | "medium" | "high" | "urgent"
  timestamp: string
  isRead: boolean
  patientName?: string
  actionRequired?: boolean
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const apiClient = useApiClient()

  const fetchNotifications = async () => {
    try {
      setRefreshing(true)

      const response = await apiClient.get("/api/fhir/Communication", {
        _page: 1,
        _count: 50,
        _sort: "sent",
        _order: "desc",
      })
      type PriorityLevels = {
        [key in NotificationItem['priority']]: number;
      };
      
      const priorityOrder: PriorityLevels = { 
        urgent: 4, 
        high: 3, 
        medium: 2, 
        low: 1 
      };
      if (response && response.data) {
        const communications = response.data
        const transformedNotifications = communications.map(transformCommunicationToNotification)
        const sortedNotifications = transformedNotifications.sort((a: NotificationItem, b: NotificationItem) => {
          const priorityOrder: PriorityLevels = { 
            urgent: 4, 
            high: 3, 
            medium: 2, 
            low: 1 
          };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        setNotifications(sortedNotifications)
        setUnreadCount(sortedNotifications.filter((n: NotificationItem) => !n.isRead).length)
      } else {
        // Fallback data
        const fallbackNotifications = [
          {
            id: "1",
            title: "Emergency Alert",
            message: "Patient Sarah Johnson has elevated blood pressure readings",
            type: "emergency" as const,
            priority: "urgent" as const,
            timestamp: new Date().toISOString(),
            isRead: false,
            patientName: "Sarah Johnson",
            actionRequired: true,
          },
          {
            id: "2",
            title: "Appointment Reminder",
            message: "Upcoming appointment with Maria Garcia at 2:00 PM",
            type: "appointment" as const,
            priority: "medium" as const,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isRead: false,
            patientName: "Maria Garcia",
            actionRequired: false,
          },
        ]
        setNotifications(fallbackNotifications)
        setUnreadCount(fallbackNotifications.filter((n) => !n.isRead).length)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      Alert.alert("Error", "Failed to load notifications. Using sample data.")

      // Fallback data
      const fallbackNotifications = [
        {
          id: "1",
          title: "Emergency Alert",
          message: "Patient Sarah Johnson has elevated blood pressure readings",
          type: "emergency" as const,
          priority: "urgent" as const,
          timestamp: new Date().toISOString(),
          isRead: false,
          patientName: "Sarah Johnson",
          actionRequired: true,
        },
        {
          id: "2",
          title: "Appointment Reminder",
          message: "Upcoming appointment with Maria Garcia at 2:00 PM",
          type: "appointment" as const,
          priority: "medium" as const,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: false,
          patientName: "Maria Garcia",
          actionRequired: false,
        },
      ]
      setNotifications(fallbackNotifications)
      setUnreadCount(fallbackNotifications.filter((n) => !n.isRead).length)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  // Transform Communication resource to NotificationItem
  const transformCommunicationToNotification = (comm: any): NotificationItem => {
    const message = comm.payload?.[0]?.contentString || "No message content"
    const category = comm.category?.[0]?.text || "general"
    const timestamp = comm.sent || new Date().toISOString()

    let type: NotificationItem["type"] = "general"
    let priority: NotificationItem["priority"] = "medium"
    let title = "Notification"
    let actionRequired = false

    if (category.includes("appointment") || message.toLowerCase().includes("appointment")) {
      type = "appointment"
      title = "Appointment Update"
      priority = "medium"
    } else if (
      category.includes("emergency") ||
      message.toLowerCase().includes("emergency") ||
      message.toLowerCase().includes("urgent")
    ) {
      type = "emergency"
      title = "Emergency Alert"
      priority = "urgent"
      actionRequired = true
    } else if (category.includes("reminder") || message.toLowerCase().includes("reminder")) {
      type = "reminder"
      title = "Reminder"
      priority = "low"
    } else if (message.toLowerCase().includes("missed")) {
      type = "appointment"
      title = "Missed Appointment"
      priority = "high"
      actionRequired = true
    }

    let patientName: string | undefined
    if (comm.subject?.reference) {
      const [, patientId] = comm.subject.reference.split("/")
      patientName = `Patient ${patientId}`
    }

    return {
      id: comm.id,
      title,
      message,
      type,
      priority,
      timestamp,
      isRead: false,
      patientName,
      actionRequired,
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const onRefresh = React.useCallback(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      Alert.alert("Success", "All notifications marked as read")
    } catch (error) {
      console.error("Error marking all as read:", error)
      Alert.alert("Error", "Failed to mark all as read")
    }
  }

  const getPriorityColor = (priority: NotificationItem["priority"]) => {
    switch (priority) {
      case "urgent":
        return Colors.error[500]
      case "high":
        return Colors.warning[500]
      case "medium":
        return Colors.primary[500]
      case "low":
        return Colors.neutral[400]
      default:
        return Colors.neutral[400]
    }
  }

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "appointment":
        return "calendar-outline"
      case "emergency":
        return "warning-outline"
      case "reminder":
        return "alarm-outline"
      case "general":
        return "information-circle-outline"
      default:
        return "notifications-outline"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const handleNotificationPress = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    if (notification.actionRequired) {
      Alert.alert("Action Required", `${notification.message}\n\nWhat would you like to do?`, [
        { text: "Dismiss", style: "cancel" },
        {
          text: "View Details",
          onPress: () => {
            console.log("Navigate to details for:", notification.id)
          },
        },
        ...(notification.type === "appointment"
          ? [
              {
                text: "Call Patient",
                onPress: () => {
                  console.log("Call patient for:", notification.patientName)
                },
              },
            ]
          : []),
      ])
    }
  }

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.isRead && styles.unreadCard,
        item.actionRequired && styles.actionRequiredCard,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={getTypeIcon(item.type)} size={24} color={getPriorityColor(item.priority)} />
          {item.priority === "urgent" && (
            <View style={styles.urgentBadge}>
              <Ionicons name="flash" size={12} color="white" />
            </View>
          )}
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          {item.patientName && <Text style={styles.patientName}>{item.patientName}</Text>}

          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            {item.actionRequired && (
              <View style={styles.actionBadge}>
                <Text style={styles.actionBadgeText}>Action Required</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={Colors.neutral[400]} />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: Colors.neutral[800],
  },
  unreadBadge: {
    backgroundColor: Colors.error[500],
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Inter-Bold",
  },
  markAllButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
  },
  markAllText: {
    color: Colors.primary[600],
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  notificationsList: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[500],
  },
  actionRequiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error[500],
  },
  notificationHeader: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  iconContainer: {
    position: "relative",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.neutral[100],
    borderRadius: 20,
  },
  urgentBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: Colors.error[500],
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  unreadTitle: {
    fontFamily: "Inter-Bold",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
  },
  patientName: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: Colors.primary[600],
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[700],
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[500],
  },
  actionBadge: {
    backgroundColor: Colors.error[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  actionBadgeText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: Colors.error[700],
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
    fontFamily: "Poppins-SemiBold",
    color: Colors.neutral[600],
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: Colors.neutral[400],
  },
})
