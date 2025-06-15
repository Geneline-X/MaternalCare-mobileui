"use client"
import { useState } from "react"
import type { ChatMessage } from "../../types/app"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { StyleSheet } from "react-native"

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    text: "Good morning Dr. Wilson! I've been experiencing some mild cramping since yesterday. Should I be concerned?",
    sender: "other",
    timestamp: "2024-01-15T09:30:00Z",
    patientName: "Sarah Johnson",
  },
  {
    id: "2",
    text: "Hi Sarah! I'm here to help. Could you please describe the cramping more? Is it constant or intermittent?",
    sender: "me",
    timestamp: "2024-01-15T09:35:00Z",
    patientName: "Dr. Wilson",
  },
  {
    id: "3",
    text: "It's very mild, maybe 2-3 times per hour. No bleeding or other symptoms. Here's a photo of my symptom tracker.",
    sender: "other",
    timestamp: "2024-01-15T09:40:00Z",
    patientName: "Sarah Johnson",
  },
  {
    id: "4",
    text: "Thank you for the detailed tracking! Based on what you've described and your chart, this appears to be normal Braxton Hicks contractions. However, please contact me immediately if they become more frequent (every 5-10 minutes) or painful.",
    sender: "me",
    timestamp: "2024-01-15T09:45:00Z",
  },
  {
    id: "5",
    text: "Hi Dr. Wilson, I have a question about my upcoming ultrasound appointment.",
    sender: "other",
    timestamp: "2024-01-15T10:15:00Z",
    patientName: "Emily Davis",
  },
]

const quickReplies = [
  "Thank you for the update",
  "Please schedule an appointment",
  "This is normal, don't worry",
  "Contact me if symptoms worsen",
  "Take your medication",
]

const ChatComponent = () => {
  const [inputText, setInputText] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const renderMessage = (message: ChatMessage) => {
    const isMyMessage = message.sender === "me"

    return (
      <View key={message.id} style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        {!isMyMessage && message.patientName && <Text style={styles.patientName}>{message.patientName}</Text>}
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble]}>
          <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.otherMessageText]}>
            {message.text}
          </Text>
        </View>
        <Text style={[styles.timestamp, isMyMessage ? styles.myTimestamp : styles.otherTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    )
  }

  const handleSendMessage = () => {
    if (inputText.trim()) {
      // TODO: Implement send message functionality
      Alert.alert("Message", `Sending: ${inputText}`)
      setInputText("")
    }
  }

  const handleVoiceNote = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      Alert.alert("Voice Note", "Recording stopped")
    } else {
      // Start recording
      setIsRecording(true)
      Alert.alert("Voice Note", "Recording started")
    }
  }

  const handleQuickReply = (reply: string) => {
    setInputText(reply)
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Chat</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={[styles.messagesContent, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {mockMessages.map(renderMessage)}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView horizontal style={styles.quickRepliesContainer} showsHorizontalScrollIndicator={false}>
          {quickReplies.map((reply, index) => (
            <TouchableOpacity key={index} style={styles.quickReplyButton} onPress={() => handleQuickReply(reply)}>
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chat Input */}
        <View style={[styles.inputContainer, { marginBottom: 80 }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />

            {inputText.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.voiceButton, isRecording && styles.recordingButton]}
                onPress={handleVoiceNote}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={20}
                  color={isRecording ? "#fff" : Colors.primary[600]}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  patientName: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: "600",
    marginBottom: 4,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: Colors.primary[600],
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  myTimestamp: {
    textAlign: "right",
    marginRight: 8,
  },
  otherTimestamp: {
    textAlign: "left",
    marginLeft: 8,
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 50,
  },
  quickReplyButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 14,
    color: Colors.primary[600],
  },
  inputContainer: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary[600],
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceButton: {
    backgroundColor: "#f0f0f0",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary[600],
  },
  recordingButton: {
    backgroundColor: "#ff4444",
    borderColor: "#ff4444",
  },
})

export default ChatComponent
