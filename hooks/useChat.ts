"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { medicalChatService } from "../services/socket"
import type { Message, ConsultationRoom, MedicalContext, ChatNotification } from "../types/index"
import config from "../config"

interface UseChatOptions {
  roomId?: string
  userId: string
  userType: "patient" | "doctor"
  userName?: string
  medicalContext?: MedicalContext
  callbacks?: {
    onError?: (error: Error) => void
    onConnect?: () => void
    onDisconnect?: () => void
    onNotification?: (notification: ChatNotification) => void
  }
}

interface UseChatReturn {
  messages: Message[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
  currentRoom: ConsultationRoom | null
  activeRooms: ConsultationRoom[]
  directMode: boolean
  sendMessage: (content: string) => void
  sendVoiceMessage: (audioData: string, duration: number) => Promise<void>
  joinRoom: (roomId: string) => Promise<void>
  createConsultation: () => Promise<string>
  toggleDoctorMode: (enable: boolean) => Promise<void>
  queryPatientData: (query: string) => Promise<string>
  clearError: () => void
}

export const useChat = (options: UseChatOptions): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentRoom, setCurrentRoom] = useState<ConsultationRoom | null>(null)
  const [activeRooms, setActiveRooms] = useState<ConsultationRoom[]>([])
  const [directMode, setDirectMode] = useState(false)

  const { userId, userType, userName, medicalContext, callbacks } = options
  const currentRoomId = useRef<string | null>(options.roomId || null)
  const isInitialized = useRef(false)

  // Initialize socket connection
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const initializeSocket = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Initializing socket connection to:", config.SOCKET_URL)

        medicalChatService.initialize({
          url: config.SOCKET_URL,
          options: {
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            autoConnect: true,
          },
        })

        // Set up event listeners
        const unsubscribeMessage = medicalChatService.onMessage((message: Message) => {
          console.log("Received message:", message)
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((m) => m.id === message.id)) return prev
            return [...prev, message]
          })
        })

        const unsubscribeRoomStatus = medicalChatService.onRoomStatus((status) => {
          console.log("Room status update:", status)
          setDirectMode(status.directMode || false)
          if (status.messages) {
            setMessages(status.messages)
          }
        })

        const unsubscribeNotification = medicalChatService.onNotification((notification) => {
          console.log("Received notification:", notification)
          callbacks?.onNotification?.(notification)

          if (notification.type === "doctorModeChanged") {
            setDirectMode(notification.data?.directMode || false)
          }

          if (notification.type === "doctorJoined") {
            // Add system message for doctor joining
            const systemMessage: Message = {
              id: `system-${Date.now()}`,
              content: notification.message,
              sender: "system",
              senderId: "system",
              timestamp: notification.timestamp,
              messageType: "text",
              senderType: "system",
            }
            setMessages((prev) => [...prev, systemMessage])
          }
        })

        const unsubscribeRoomList = medicalChatService.onRoomListUpdate((rooms) => {
          console.log("Room list update:", rooms)
          setActiveRooms(rooms)
        })

        const unsubscribeError = medicalChatService.onError((err) => {
          console.error("Socket error:", err)
          setError(err.message)
          callbacks?.onError?.(err)
        })

        // Wait for connection
        const checkConnection = () => {
          if (medicalChatService.socket?.connected) {
            setIsConnected(true)
            setIsLoading(false)
            callbacks?.onConnect?.()

            // Auto-login for doctors
            if (userType === "doctor") {
              medicalChatService
                .doctorLogin(userId, userName || "Doctor")
                .then((response) => {
                  console.log("Doctor logged in:", response)
                  setActiveRooms(response.activeRooms)
                })
                .catch((err) => {
                  console.error("Doctor login failed:", err)
                  setError(err.message)
                })
            }
          } else {
            setTimeout(checkConnection, 1000)
          }
        }

        setTimeout(checkConnection, 1000)

        // Cleanup function
        return () => {
          unsubscribeMessage()
          unsubscribeRoomStatus()
          unsubscribeNotification()
          unsubscribeRoomList()
          unsubscribeError()
        }
      } catch (err) {
        console.error("Socket initialization failed:", err)
        setError(err instanceof Error ? err.message : "Connection failed")
        setIsLoading(false)
        callbacks?.onError?.(err instanceof Error ? err : new Error("Connection failed"))
      }
    }

    initializeSocket()

    return () => {
      medicalChatService.disconnect()
      setIsConnected(false)
      callbacks?.onDisconnect?.()
    }
  }, [])

  // Create consultation room for patients
  const createConsultation = useCallback(async (): Promise<string> => {
    if (userType !== "patient" || !medicalContext) {
      throw new Error("Only patients can create consultations")
    }

    try {
      console.log("Creating consultation for patient:", userId)
      const response = await medicalChatService.joinConsultation(userId, userName || "Patient", medicalContext)

      currentRoomId.current = response.roomId
      setCurrentRoom({
        id: response.roomId,
        patientId: userId,
        patientName: userName,
        status: "active",
        directMode: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Add welcome message
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        content: "Welcome to your medical consultation. How can I help you today?",
        sender: "system",
        senderId: "system",
        timestamp: new Date().toISOString(),
        messageType: "text",
        senderType: "system",
      }
      setMessages([welcomeMessage])

      console.log("Consultation created successfully:", response.roomId)
      return response.roomId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create consultation"
      console.error("Failed to create consultation:", errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [userId, userType, userName, medicalContext])

  // Join existing room (for doctors)
  const joinRoom = useCallback(
    async (roomId: string): Promise<void> => {
      if (userType !== "doctor") {
        throw new Error("Only doctors can join rooms")
      }

      try {
        console.log("Doctor joining room:", roomId)
        const response = await medicalChatService.doctorJoinRoom(roomId, userId, userName || "Doctor")
        currentRoomId.current = roomId

        // Set current room and messages
        if (response.room) {
          setCurrentRoom(response.room)
          if (response.room.messages) {
            setMessages(response.room.messages)
          }
        }

        // Add system message
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          content: `You have joined the consultation for patient ${response.room?.patientId || "Unknown"}`,
          sender: "system",
          senderId: "system",
          timestamp: new Date().toISOString(),
          messageType: "text",
          senderType: "system",
        }
        setMessages((prev) => [...prev, systemMessage])

        console.log("Successfully joined room:", roomId)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to join room"
        console.error("Failed to join room:", errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [userId, userType, userName],
  )

  // Send text message
  const sendMessage = useCallback(
    (content: string) => {
      if (!currentRoomId.current) {
        setError("No active room")
        return
      }

      console.log("Sending message:", content)

      if (userType === "patient") {
        medicalChatService.sendPatientMessage(currentRoomId.current, userId, content)
      } else if (userType === "doctor") {
        medicalChatService.sendDoctorMessage(currentRoomId.current, userId, userName || "Doctor", content)
      }
    },
    [userId, userType, userName],
  )

  // Send voice message
  const sendVoiceMessage = useCallback(
    async (audioData: string, duration: number): Promise<void> => {
      if (!currentRoomId.current) {
        setError("No active room")
        return
      }

      try {
        console.log("Sending voice message, duration:", duration)
        const response = await medicalChatService.sendVoiceMessage(
          currentRoomId.current,
          userId,
          userType,
          audioData,
          duration,
        )

        console.log("Voice message sent successfully:", response)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send voice message"
        console.error("Failed to send voice message:", errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [userId, userType],
  )

  // Toggle doctor mode (AI override)
  const toggleDoctorMode = useCallback(
    async (enable: boolean): Promise<void> => {
      if (userType !== "doctor" || !currentRoomId.current) {
        throw new Error("Only doctors can toggle direct mode")
      }

      try {
        console.log("Toggling doctor mode to:", enable)
        const response = await medicalChatService.toggleDoctorMode(
          currentRoomId.current,
          userId,
          userName || "Doctor",
          enable,
        )
        setDirectMode(response.directMode)
        console.log("Doctor mode toggled successfully:", response.directMode)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to toggle doctor mode"
        console.error("Failed to toggle doctor mode:", errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [userId, userType, userName],
  )

  // Query patient data
  const queryPatientData = useCallback(
    async (query: string): Promise<string> => {
      if (userType !== "doctor" || !currentRoomId.current) {
        throw new Error("Only doctors can query patient data")
      }

      try {
        console.log("Querying patient data:", query)
        const response = await medicalChatService.queryPatientData(currentRoomId.current, userId, query)

        // Add the insight as an AI message
        const aiMessage: Message = {
          id: `ai-insight-${Date.now()}`,
          content: response.insight,
          sender: "ai",
          senderId: "ai-medical-assistant",
          timestamp: new Date().toISOString(),
          messageType: "text",
          senderType: "ai",
          senderName: "AI Assistant",
        }
        setMessages((prev) => [...prev, aiMessage])

        return response.insight
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to query patient data"
        console.error("Failed to query patient data:", errorMessage)
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [userId, userType],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    messages,
    isConnected,
    isLoading,
    error,
    currentRoom,
    activeRooms,
    directMode,
    sendMessage,
    sendVoiceMessage,
    joinRoom,
    createConsultation,
    toggleDoctorMode,
    queryPatientData,
    clearError,
  }
}
