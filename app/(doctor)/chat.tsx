"use client"
import { useState } from "react"
import type { ChatMessage } from "../../types/app"
import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, TextInput } from "react-native"
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

  const handleSendMessage = () => {
    if (inputText.trim()) {
      // TODO: Implement send message functionality
      console.log("Sending message:", inputText)
      setInputText("")
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    console.log("Starting voice recording...")
  }

  const stopRecording = () => {
    setIsRecording(false)
    console.log("Stopping voice recording...")
  }

  const handleQuickReply = (reply: string) => {
    setInputText(reply)
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
              <Text style={styles.patientName}>Sarah Johnson</Text>
              <Text style={styles.patientStatus}>24 weeks pregnant • Active</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={20} color={Colors.primary[600]} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {mockMessages.map((message) => {
            const isMyMessage = message.sender === "me"
            return (
              <View
                key={message.id}
                style={[styles.messageContainer, isMyMessage ? styles.doctorMessage : styles.patientMessage]}
              >
                {!isMyMessage && message.patientName && <Text style={styles.senderName}>{message.patientName}</Text>}
                <Text style={[styles.messageText, isMyMessage ? styles.doctorMessageText : styles.patientMessageText]}>
                  {message.text}
                </Text>
                <Text style={[styles.timestamp, isMyMessage ? styles.doctorTimestamp : styles.patientTimestamp]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            )
          })}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView horizontal style={styles.quickRepliesContainer} showsHorizontalScrollIndicator={false}>
          {quickReplies.map((reply, index) => (
            <TouchableOpacity key={index} style={styles.quickReplyButton} onPress={() => handleQuickReply(reply)}>
              <Text style={styles.quickReplyText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            {inputText.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
                onPress={isRecording ? stopRecording : startRecording}
                onLongPress={startRecording}
                onPressOut={stopRecording}
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
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 20,
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
  senderName: {
    fontSize: 12,
    color: Colors.primary[600],
    fontWeight: "600",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  doctorMessageText: {
    color: "white",
  },
  patientMessageText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 11,
    alignSelf: "flex-end",
  },
  doctorTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  patientTimestamp: {
    color: "#999",
  },
  quickRepliesContainer: {
    paddingHorizontal: 20,
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
  attachButton: {
    marginRight: 10,
    padding: 5,
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
})

export default ChatComponent
