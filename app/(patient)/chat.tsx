"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native"
import { Audio } from "expo-av"
import { Ionicons } from "@expo/vector-icons"
import { useUser } from "@clerk/clerk-expo"
import { useChat } from "@/hooks/useChat"
import { blobToBase64 } from "@/utils/audioUtils"
import { Colors } from "@/constants/colors"
import type { MedicalContext, ChatNotification } from "@/types/index"

const PatientChatScreen: React.FC = () => {
  const { user } = useUser()
  const [newMessage, setNewMessage] = useState<string>("")
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [showDoctorNotification, setShowDoctorNotification] = useState(false)
  const [doctorName, setDoctorName] = useState<string>("")

  const mediaRecorderRef = useRef<Audio.Recording | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  // Mock medical context - in real app, this would come from patient profile
  const medicalContext: MedicalContext = {
    pregnancyStatus: "confirmed",
    gestationalAge: "28 weeks",
    dueDate: "2025-08-15",
    highRisk: true,
    conditions: [{ name: "Gestational Diabetes" }],
    medications: [{ name: "Prenatal Vitamins", dosage: "1 tablet daily" }],
    allergies: [{ name: "Penicillin" }],
    vitalSigns: {
      bloodPressure: "130/85",
      heartRate: "78",
      temperature: "98.6",
      weight: "155",
    },
  }

  const [hasCreatedRoom, setHasCreatedRoom] = useState(false)

  const {
    messages,
    isConnected,
    isLoading,
    error,
    directMode,
    sendMessage,
    sendVoiceMessage,
    createConsultation,
    clearError,
  } = useChat({
    userId: user?.id || "patient-demo",
    userType: "patient",
    userName: user?.firstName ? `${user.firstName} ${user.lastName}` : "Patient",
    medicalContext,
    callbacks: {
      onError: (err: Error) => {
        console.error("Chat error:", err)
        // Don't show alert for connection errors in mock mode
        if (!err.message.includes("websocket")) {
          Alert.alert("Error", err.message)
        }
      },
      onConnect: () => {
        console.log("Connected to medical chat")
      },
      onNotification: (notification: ChatNotification) => {
        if (notification.type === "doctorJoined") {
          setShowDoctorNotification(true)
          setDoctorName(notification.data?.doctorName || "Doctor")
          setTimeout(() => setShowDoctorNotification(false), 5000)
        }
      },
    },
  })

  // Auto-create consultation room on mount
  useEffect(() => {
    const initializeConsultation = async () => {
      if (!hasCreatedRoom && isConnected && !isLoading) {
        try {
          const newRoomId = await createConsultation()
          setRoomId(newRoomId)
          setHasCreatedRoom(true)
          console.log("Created consultation room:", newRoomId)
        } catch (err) {
          console.error("Failed to create consultation:", err)
          // Don't show error for mock mode
          if (err instanceof Error && !err.message.includes("mock")) {
            Alert.alert("Error", "Failed to start consultation. Using offline mode.")
          }
        }
      }
    }

    initializeConsultation()
  }, [isConnected, isLoading, hasCreatedRoom, createConsultation])

  // Format time for message timestamp
  const formatTime = (timestamp: string | number): string => {
    // Convert to number if it's a string that can be parsed as a number
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    const date = new Date(timestampNum);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return '--:--';
    }
    
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Handle sending a text message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return

    sendMessage(newMessage.trim())
    setNewMessage("")
  }, [newMessage, sendMessage])

  // Handle starting voice recording
  const handleStartRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission required", "Microphone access is needed to record voice messages")
        return
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)

      mediaRecorderRef.current = recording
      setIsRecording(true)
    } catch (err) {
      console.error("Failed to start recording:", err)
      Alert.alert("Error", "Failed to start recording")
      setIsRecording(false)
    }
  }, [])

  // Handle stopping voice recording
  const handleStopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current) return

    try {
      await mediaRecorderRef.current.stopAndUnloadAsync()
      const uri = mediaRecorderRef.current.getURI()

      if (uri) {
        const { sound, status } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false })

        try {
          const response = await fetch(uri)
          const blob = await response.blob()
          const base64Audio = await blobToBase64(blob)

          const duration = status.isLoaded ? (status.durationMillis ?? 0) : 0
          await sendVoiceMessage(base64Audio, duration)

          await sound.unloadAsync()
        } catch (err) {
          console.error("Failed to process audio data:", err)
          Alert.alert("Error", "Failed to process audio data")
        }
      }
    } catch (err) {
      console.error("Failed to stop recording:", err)
      Alert.alert("Error", "Failed to stop recording")
    } finally {
      setIsRecording(false)
      mediaRecorderRef.current = null
    }
  }, [sendVoiceMessage])

  // Get message sender info
  const getMessageSender = (message: any) => {
    if (message.senderType === "ai") {
      return { name: "AI Assistant", isAI: true }
    } else if (message.senderType === "doctor") {
      return { name: message.senderName || "Doctor", isAI: false }
    } else {
      return { name: "You", isAI: false }
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Text style={styles.loadingText}>Starting consultation...</Text>
        <Text style={styles.loadingSubtext}>Connecting you with our AI assistant</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.assistantInfo}>
            <View style={[styles.assistantAvatar, directMode && styles.doctorAvatar]}>
              <Ionicons name={directMode ? "medical" : "chatbubble-ellipses"} size={24} color="white" />
            </View>
            <View>
              <Text style={styles.assistantName}>{directMode ? `Dr. ${doctorName}` : "AI Medical Assistant"}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? "#22C55E" : "#EF4444" }]} />
                <Text style={styles.statusText}>{directMode ? "Doctor Available" : "AI Assistant Active"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Doctor Joined Notification */}
      {showDoctorNotification && (
        <View style={styles.notificationBanner}>
          <Ionicons name="medical" size={20} color="#22C55E" />
          <Text style={styles.notificationText}>Dr. {doctorName} has joined the conversation</Text>
        </View>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.connectionBanner}>
          <Ionicons name="wifi-outline" size={16} color="#EF4444" />
          <Text style={styles.connectionText}>Reconnecting...</Text>
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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }}
        >
          {/* Welcome Message */}
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="medical" size={32} color={Colors.primary[600]} />
              </View>
              <Text style={styles.welcomeTitle}>Welcome to Your Medical Consultation</Text>
              <Text style={styles.welcomeText}>
                I'm your AI medical assistant. I can help answer questions about your pregnancy and health. A doctor may
                join our conversation at any time.
              </Text>
              <View style={styles.welcomeTips}>
                <Text style={styles.tipsTitle}>You can ask me about:</Text>
                <Text style={styles.tipItem}>• Pregnancy symptoms and concerns</Text>
                <Text style={styles.tipItem}>• Medication questions</Text>
                <Text style={styles.tipItem}>• Appointment scheduling</Text>
                <Text style={styles.tipItem}>• General health advice</Text>
              </View>
            </View>
          )}

          {messages.map((message, index) => {
            const sender = getMessageSender(message)
            const isMyMessage = message.sender === "patient"

            return (
              <View
                key={`${message.id}-${index}`}
                style={[styles.messageContainer, isMyMessage ? styles.patientMessage : styles.assistantMessage]}
              >
                {!isMyMessage && (
                  <View style={styles.senderInfo}>
                    <Text style={[styles.senderName, sender.isAI ? styles.aiSenderName : styles.doctorSenderName]}>
                      {sender.name}
                    </Text>
                    {sender.isAI && (
                      <View style={styles.aiTag}>
                        <Text style={styles.aiTagText}>AI</Text>
                      </View>
                    )}
                  </View>
                )}

                {message.contentType === "voice" ? (
                  <TouchableOpacity
                    style={styles.voiceMessage}
                    onPress={async () => {
                      try {
                        const { sound } = await Audio.Sound.createAsync({ uri: message.audioUrl! }, { shouldPlay: true })
                        await sound.playAsync()
                        sound.setOnPlaybackStatusUpdate((status) => {
                          if (!status.isLoaded) return
                          if (status.didJustFinish) {
                            sound.unloadAsync().catch(console.error)
                          }
                        })
                      } catch (err) {
                        console.error("Error playing audio:", err)
                        Alert.alert("Error", "Failed to play voice message")
                      }
                    }}
                  >
                    <View style={styles.voiceMessageContent}>
                      <Ionicons name="play" size={20} color={isMyMessage ? "white" : Colors.primary[600]} />
                      <Text style={[styles.voiceDuration, { color: isMyMessage ? "white" : Colors.primary[600] }]}>
                        {message.metadata?.duration ? `${Math.floor(Number(message.metadata.duration) / 1000)}s` : "Play"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <Text
                    style={[styles.messageText, isMyMessage ? styles.patientMessageText : styles.assistantMessageText]}
                  >
                    {message.content}
                  </Text>
                )}

                <Text style={[styles.timestamp, isMyMessage ? styles.patientTimestamp : styles.assistantTimestamp]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            )
          })}
        </ScrollView>

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Ask about your health, symptoms, or concerns..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              onSubmitEditing={handleSendMessage}
            />
            {newMessage.trim() ? (
              <TouchableOpacity
                style={[styles.sendButton, !isConnected && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!isConnected}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
                onPressIn={handleStartRecording}
                onPressOut={handleStopRecording}
                disabled={!isConnected}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={20}
                  color={isRecording ? "white" : Colors.primary[600]}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Actions */}
          <ScrollView horizontal style={styles.quickActions} showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setNewMessage("I'm experiencing some pain")}
            >
              <Text style={styles.quickActionText}>Pain/Discomfort</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setNewMessage("I have questions about my medication")}
            >
              <Text style={styles.quickActionText}>Medication</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setNewMessage("I'd like to schedule an appointment")}
            >
              <Text style={styles.quickActionText}>Appointment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setNewMessage("I have general health questions")}
            >
              <Text style={styles.quickActionText}>General Health</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    padding: 20,
    backgroundColor: "#F8FAFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  assistantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  assistantAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  doctorAvatar: {
    backgroundColor: "#22C55E",
  },
  assistantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBanner: {
    backgroundColor: "#F0FDF4",
    borderColor: "#22C55E",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  notificationText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#15803D",
    fontWeight: "500",
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
  messagesContainer: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  welcomeTips: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  messageContainer: {
    maxWidth: "85%",
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
  },
  patientMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary[600],
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: 8,
  },
  aiSenderName: {
    color: Colors.primary[600],
  },
  doctorSenderName: {
    color: "#22C55E",
  },
  aiTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiTagText: {
    fontSize: 10,
    color: Colors.primary[600],
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  patientMessageText: {
    color: "white",
  },
  assistantMessageText: {
    color: "#333",
  },
  voiceMessage: {
    marginBottom: 4,
  },
  voiceMessageContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  voiceDuration: {
    marginLeft: 8,
    fontSize: 14,
  },
  timestamp: {
    fontSize: 11,
    alignSelf: "flex-end",
  },
  patientTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  assistantTimestamp: {
    color: "#999",
  },
  inputContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8F9FA",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 50,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#F0F0F0",
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  voiceButtonRecording: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[700],
    transform: [{ scale: 1.1 }],
  },
  quickActions: {
    maxHeight: 40,
  },
  quickActionButton: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: "500",
  },
})

export default PatientChatScreen
