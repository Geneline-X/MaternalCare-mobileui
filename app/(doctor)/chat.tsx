"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams } from "expo-router"
import { useUser } from "@clerk/clerk-expo"
import { Audio } from "expo-av"
import { Colors } from "../../constants/colors"
import { StyleSheet } from "react-native"
import { useChat } from "@/hooks/useChat"
import { blobToBase64 } from "@/utils/audioUtils"
import type { ChatNotification } from "@/types/index"

const DoctorChatScreen = () => {
  const params = useLocalSearchParams()
  const { user } = useUser()
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showModeToggle, setShowModeToggle] = useState(false)
  const mediaRecorderRef = useRef<Audio.Recording | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  const roomId = params.roomId as string
  const patientId = params.patientId as string
  const patientName = (params.patientName as string) || "Patient"

  const {
    messages,
    isConnected,
    isLoading,
    error,
    directMode,
    sendMessage,
    sendVoiceMessage,
    joinRoom,
    toggleDoctorMode,
    clearError,
  } = useChat({
    roomId,
    userId: user?.id || "doctor-demo",
    userType: "doctor",
    userName: user?.firstName ? `${user.firstName} ${user.lastName}` : "Doctor",
    callbacks: {
      onError: (err: Error) => {
        console.error("Doctor chat error:", err)
        // Don't show alert for websocket errors in mock mode
        if (!err.message.includes("websocket")) {
          Alert.alert("Error", err.message)
        }
      },
      onConnect: () => {
        console.log("Doctor connected to chat")
      },
      onNotification: (notification: ChatNotification) => {
        if (notification.type === "doctorModeChanged") {
          console.log("Doctor mode changed:", notification.data?.directMode)
        }
      },
    },
  })

  // Join room on mount
  useEffect(() => {
    const joinRoomAsync = async () => {
      if (roomId && isConnected && !isLoading) {
        try {
          await joinRoom(roomId)
          console.log("Successfully joined room:", roomId)
        } catch (err) {
          console.error("Failed to join room:", err)
          // Don't show error for mock mode
          if (err instanceof Error && !err.message.includes("mock")) {
            Alert.alert("Error", "Failed to join consultation room")
          }
        }
      }
    }

    joinRoomAsync()
  }, [roomId, isConnected, isLoading]) // Remove joinRoom from dependencies to prevent loops

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleSendMessage = useCallback(() => {
    if (!inputText.trim()) return

    sendMessage(inputText.trim())
    setInputText("")
  }, [inputText, sendMessage])

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

  const handleToggleMode = async () => {
    try {
      await toggleDoctorMode(!directMode)
      Alert.alert(
        "Mode Changed",
        directMode
          ? "AI assistant is now handling the conversation"
          : "You are now directly communicating with the patient",
      )
    } catch (err) {
      console.error("Failed to toggle mode:", err)
      Alert.alert("Error", "Failed to change communication mode")
    }
  }

  const getMessageSender = (message: any) => {
    if (message.senderType === "ai") {
      return { name: "AI Assistant", isAI: true, isDoctor: false }
    } else if (message.senderType === "doctor") {
      return { name: message.senderName || "Doctor", isAI: false, isDoctor: true }
    } else {
      return { name: patientName, isAI: false, isDoctor: false }
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Text style={styles.loadingText}>Joining consultation...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.patientInfo}>
            <View style={styles.patientAvatar}>
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.patientName}>{patientName}</Text>
              <Text style={styles.patientStatus}>{directMode ? "Direct Communication" : "AI Assistant Active"}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.modeToggleButton} onPress={() => setShowModeToggle(!showModeToggle)}>
              <Ionicons name={directMode ? "person" : "chatbubble-ellipses"} size={20} color={Colors.primary[600]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.callButton}>
              <Ionicons name="call" size={20} color={Colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Toggle Panel */}
        {showModeToggle && (
          <View style={styles.modeTogglePanel}>
            <View style={styles.modeToggleContent}>
              <Text style={styles.modeToggleTitle}>Communication Mode</Text>
              <View style={styles.modeToggleRow}>
                <View style={styles.modeInfo}>
                  <Text style={styles.modeLabel}>{directMode ? "Direct Mode" : "AI Assistant Mode"}</Text>
                  <Text style={styles.modeDescription}>
                    {directMode
                      ? "You are directly communicating with the patient"
                      : "AI assistant is handling the conversation"}
                  </Text>
                </View>
                <Switch
                  value={directMode}
                  onValueChange={handleToggleMode}
                  trackColor={{ false: "#E5E7EB", true: Colors.primary[200] }}
                  thumbColor={directMode ? Colors.primary[600] : "#9CA3AF"}
                />
              </View>
            </View>
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

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="medical" size={32} color={Colors.primary[600]} />
              </View>
              <Text style={styles.welcomeTitle}>Consultation Room</Text>
              <Text style={styles.welcomeText}>
                You can view the AI conversation history and take over to communicate directly with {patientName}.
              </Text>
              <TouchableOpacity style={styles.takeoverButton} onPress={handleToggleMode}>
                <Text style={styles.takeoverButtonText}>{directMode ? "Let AI Handle" : "Take Over Conversation"}</Text>
              </TouchableOpacity>
            </View>
          )}

          {messages.map((message, index) => {
            const sender = getMessageSender(message)
            const isMyMessage = message.sender === "doctor" && message.senderId === user?.id

            return (
              <View
                key={`${message.id}-${index}`}
                style={[
                  styles.messageContainer,
                  isMyMessage ? styles.doctorMessage : sender.isAI ? styles.aiMessage : styles.patientMessage,
                ]}
              >
                {!isMyMessage && (
                  <View style={styles.senderInfo}>
                    <Text
                      style={[
                        styles.senderName,
                        sender.isAI
                          ? styles.aiSenderName
                          : sender.isDoctor
                            ? styles.doctorSenderName
                            : styles.patientSenderName,
                      ]}
                    >
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
                    style={[
                      styles.messageText,
                      isMyMessage
                        ? styles.doctorMessageText
                        : sender.isAI
                          ? styles.aiMessageText
                          : styles.patientMessageText,
                    ]}
                  >
                    {message.content}
                  </Text>
                )}

                <Text style={[styles.timestamp, isMyMessage ? styles.doctorTimestamp : styles.otherTimestamp]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            )
          })}
        </ScrollView>

        {/* Input Container - Only show when in direct mode */}
        {directMode && (
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message to the patient..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              {inputText.trim() ? (
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
                  onPress={isRecording ? handleStopRecording : handleStartRecording}
                  onLongPress={handleStartRecording}
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
          </View>
        )}

        {/* AI Mode Info */}
        {!directMode && (
          <View style={styles.aiModeInfo}>
            <View style={styles.aiModeContent}>
              <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary[600]} />
              <Text style={styles.aiModeText}>
                AI assistant is handling this conversation. Toggle to direct mode to take over.
              </Text>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  keyboardContainer: {
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  patientAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.primary[600],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  patientStatus: {
    fontSize: 12,
    color: "#666",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modeToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  modeTogglePanel: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modeToggleContent: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  modeToggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  modeToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modeInfo: {
    flex: 1,
    marginRight: 16,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
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
  takeoverButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  takeoverButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 15,
    borderRadius: 16,
    padding: 12,
  },
  doctorMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary[600],
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF7ED",
    borderBottomLeftRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  patientMessage: {
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
    color: "#F59E0B",
  },
  doctorSenderName: {
    color: "#22C55E",
  },
  patientSenderName: {
    color: Colors.primary[600],
  },
  aiTag: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiTagText: {
    fontSize: 10,
    color: "#F59E0B",
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  doctorMessageText: {
    color: "white",
  },
  aiMessageText: {
    color: "#92400E",
  },
  patientMessageText: {
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
  doctorTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  otherTimestamp: {
    color: "#999",
  },
  inputContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 0,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8F9FA",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 50,
  },
  input: {
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
  aiModeInfo: {
    backgroundColor: "#FFF7ED",
    borderTopWidth: 1,
    borderTopColor: "#FED7AA",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  aiModeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  aiModeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
    flex: 1,
  },
})

export default DoctorChatScreen
