"use client"

import React, { useState } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useUser } from "@clerk/clerk-expo"
import { useRouter } from "expo-router"
import { useChat } from "@/hooks/useChat"
import { Colors } from "@/constants/colors"
import type { ConsultationRoom, ChatNotification } from "@/types/index"

const ConsultationRoomsScreen: React.FC = () => {
  const { user } = useUser()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  const { activeRooms, isConnected, isLoading, error, joinRoom, clearError } = useChat({
    userId: user?.id || "doctor-demo",
    userType: "doctor",
    userName: user?.firstName ? `${user.firstName} ${user.lastName}` : "Doctor",
    callbacks: {
      onError: (err: Error) => {
        console.error("Chat error:", err)
        // Don't show alert for websocket errors in mock mode
        if (!err.message.includes("websocket")) {
          Alert.alert("Error", err.message)
        }
      },
      onConnect: () => {
        console.log("Doctor connected to medical chat")
      },
      onNotification: (notification: ChatNotification) => {
        if (notification.type === "patientRoomCreated") {
          console.log("New patient room created:", notification.data)
        }
      },
    },
  })

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    // The useChat hook will automatically refresh the room list
    setTimeout(() => setRefreshing(false), 1500)
  }, [])

  const handleJoinRoom = async (room: ConsultationRoom) => {
    if (selectedRoom === room.id) return

    try {
      setSelectedRoom(room.id)
      await joinRoom(room.id)

      // Navigate to chat screen with room context
      router.push({
        pathname: "/(doctor)/chat",
        params: {
          roomId: room.id,
          patientId: room.patientId,
          patientName: room.patientName || "Patient",
        },
      })
    } catch (err) {
      console.error("Failed to join room:", err)
      Alert.alert("Error", "Failed to join consultation room")
    } finally {
      setSelectedRoom(null)
    }
  }

  const filteredRooms = activeRooms.filter(
    (room) =>
      room.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.patientId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getRoomStatusColor = (room: ConsultationRoom) => {
    if (room.directMode) return "#22C55E" // Green for doctor mode
    if (room.unreadCount && room.unreadCount > 0) return "#EF4444" // Red for unread
    return "#F59E0B" // Orange for AI mode
  }

  const getRoomStatusText = (room: ConsultationRoom) => {
    if (room.directMode) return "Doctor Active"
    return "AI Assistant"
  }

  const renderRoomItem = ({ item: room }: { item: ConsultationRoom }) => (
    <TouchableOpacity
      style={[styles.roomCard, selectedRoom === room.id && styles.roomCardSelected]}
      onPress={() => handleJoinRoom(room)}
      disabled={selectedRoom === room.id}
    >
      <View style={styles.roomHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.patientAvatar}>
            <Ionicons name="person" size={24} color="white" />
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{room.patientName || `Patient ${room.patientId.slice(-4)}`}</Text>
            <Text style={styles.patientId}>ID: {room.patientId}</Text>
          </View>
        </View>

        <View style={styles.roomStatus}>
          <View style={[styles.statusIndicator, { backgroundColor: getRoomStatusColor(room) }]} />
          <Text style={[styles.statusText, { color: getRoomStatusColor(room) }]}>{getRoomStatusText(room)}</Text>
        </View>
      </View>

      <View style={styles.roomContent}>
        {room.lastMessage && (
          <View style={styles.lastMessage}>
            <Text style={styles.lastMessageText} numberOfLines={2}>
              {room.lastMessage.senderType === "ai" && "🤖 "}
              {room.lastMessage.senderType === "doctor" && "👨‍⚕️ "}
              {room.lastMessage.content}
            </Text>
            <Text style={styles.lastMessageTime}>{formatTime(room.lastMessage.timestamp)}</Text>
          </View>
        )}

        <View style={styles.roomMeta}>
          <View style={styles.roomMetaItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.roomMetaText}>Started {formatTime(room.createdAt)}</Text>
          </View>

          {room.unreadCount && room.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{room.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.roomActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={16} color={Colors.primary[600]} />
          <Text style={styles.actionText}>Join Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="medical-outline" size={16} color="#666" />
          <Text style={styles.actionText}>Patient Info</Text>
        </TouchableOpacity>
      </View>

      {selectedRoom === room.id && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary[600]} />
          <Text style={styles.loadingText}>Joining...</Text>
        </View>
      )}
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Text style={styles.loadingText}>Loading consultation rooms...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Active Consultations</Text>
          <View style={styles.headerSubtitleRow}>
            <Text style={styles.headerSubtitle}>
              {activeRooms.length} patient{activeRooms.length !== 1 ? "s" : ""} waiting
            </Text>
            {!isConnected && (
              <View style={styles.offlineIndicator}>
                <Text style={styles.offlineText}>• Offline Mode</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="wifi-outline" size={16} color="#EF4444" />
          <Text style={styles.connectionText}>Reconnecting to server...</Text>
        </View>
      )}

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Room List */}
      {filteredRooms.length > 0 ? (
        <FlatList
          data={filteredRooms}
          renderItem={renderRoomItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.roomsList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
          </View>
          <Text style={styles.emptyTitle}>No Active Consultations</Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? "No patients match your search criteria"
              : "Patients will appear here when they start a consultation"}
          </Text>
          {searchQuery && (
            <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery("")}>
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeRooms.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeRooms.filter((r) => r.directMode).length}</Text>
          <Text style={styles.statLabel}>Doctor Mode</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeRooms.filter((r) => !r.directMode).length}</Text>
          <Text style={styles.statLabel}>AI Mode</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{activeRooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0)}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  connectionBanner: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  connectionText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#DC2626",
  },
  errorBanner: {
    backgroundColor: "#EF4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    color: "white",
    fontSize: 14,
    flex: 1,
  },
  roomsList: {
    padding: 16,
  },
  roomCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  roomCardSelected: {
    borderColor: Colors.primary[600],
    borderWidth: 2,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  patientId: {
    fontSize: 12,
    color: "#666",
  },
  roomStatus: {
    alignItems: "flex-end",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  roomContent: {
    marginBottom: 12,
  },
  lastMessage: {
    marginBottom: 8,
  },
  lastMessageText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 4,
  },
  lastMessageTime: {
    fontSize: 12,
    color: "#999",
  },
  roomMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roomMetaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomMetaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  roomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary[600],
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  headerSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  offlineIndicator: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  offlineText: {
    fontSize: 10,
    color: "#92400E",
    fontWeight: "500",
  },
})

export default ConsultationRoomsScreen
