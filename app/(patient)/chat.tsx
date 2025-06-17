"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface Message {
  id: string
  text: string
  sender: "patient" | "doctor"
  timestamp: string
}

export default function PatientChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How are you feeling today? Any concerns about your pregnancy?",
      sender: "doctor",
      timestamp: "2024-01-15T10:00:00Z",
    },
    {
      id: "2",
      text: "Hi Dr. Johnson! I have been feeling some mild nausea in the mornings. Is this normal?",
      sender: "patient",
      timestamp: "2024-01-15T10:01:00Z",
    },
    {
      id: "3",
      text: "Yes, morning sickness is very common, especially in the first trimester. Try eating small, frequent meals and avoid spicy foods. How many weeks are you now?",
      sender: "doctor",
      timestamp: "2024-01-15T10:02:00Z",
    },
    {
      id: "4",
      text: "I am 24 weeks now. The nausea has been getting better lately.",
      sender: "patient",
      timestamp: "2024-01-15T10:03:00Z",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: "patient",
        timestamp: new Date().toISOString(),
      }
      setMessages([...messages, message])
      setNewMessage("")
      // TODO: Send message to API
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    // TODO: Start voice recording
    console.log("Starting voice recording...")
  }

  const stopRecording = () => {
    setIsRecording(false)
    // TODO: Stop voice recording and send
    console.log("Stopping voice recording...")
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
          <View style={styles.doctorInfo}>
            <View style={styles.doctorAvatar}>
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.doctorName}>Dr. Sarah Johnson</Text>
              <Text style={styles.doctorStatus}>Online • Maternal Specialist</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={20} color="#E91E63" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === "patient" ? styles.patientMessage : styles.doctorMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === "patient" ? styles.patientMessageText : styles.doctorMessageText,
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  message.sender === "patient" ? styles.patientTimestamp : styles.doctorTimestamp,
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            {newMessage.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
                onPress={isRecording ? stopRecording : startRecording}
                onLongPress={startRecording}
                onPressOut={stopRecording}
              >
                <Ionicons name={isRecording ? "stop" : "mic"} size={20} color={isRecording ? "white" : "#E91E63"} />
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
    paddingTop: 50,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  doctorStatus: {
    fontSize: 12,
    color: "#666",
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FCE4EC",
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
  patientMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#E91E63",
    borderBottomRightRadius: 4,
  },
  doctorMessage: {
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  patientMessageText: {
    color: "white",
  },
  doctorMessageText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 11,
    alignSelf: "flex-end",
  },
  patientTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  doctorTimestamp: {
    color: "#999",
  },
  inputContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8F9FA",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 50,
    marginBottom: 35,
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
    backgroundColor: "#E91E63",
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
    backgroundColor: "#FCE4EC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderWidth: 2,
    borderColor: "#E91E63",
  },
  voiceButtonRecording: {
    backgroundColor: "#E91E63",
    borderColor: "#C2185B",
    transform: [{ scale: 1.1 }],
  },
})
