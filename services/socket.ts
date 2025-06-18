import { io, type Socket } from "socket.io-client"
import type {
  Message,
  RoomStatus,
  SocketConfig,
  ConsultationRoom,
  MedicalContext,
  ChatNotification,
} from "../types/index"

class MedicalChatService {
  public socket: Socket | null = null
  public static instance: MedicalChatService
  public messageListeners: ((message: Message) => void)[] = []
  public roomStatusListeners: ((status: RoomStatus) => void)[] = []
  public errorListeners: ((error: Error) => void)[] = []
  public notificationListeners: ((notification: ChatNotification) => void)[] = []
  public roomListListeners: ((rooms: ConsultationRoom[]) => void)[] = []

  public constructor() {}

  public static getInstance(): MedicalChatService {
    if (!MedicalChatService.instance) {
      MedicalChatService.instance = new MedicalChatService()
    }
    return MedicalChatService.instance
  }

  public initialize(config: SocketConfig): void {
    if (this.socket) {
      this.disconnect()
    }

    console.log("Connecting to socket server:", config.url)

    this.socket = io(config.url, {
      reconnectionAttempts: config.options?.reconnectionAttempts || 5,
      reconnectionDelay: config.options?.reconnectionDelay || 2000,
      autoConnect: config.options?.autoConnect ?? true,
      transports: ["websocket", "polling"],
      timeout: 20000,
    })

    this.setupEventListeners()
  }

  public setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("Connected to medical chat server")
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from medical chat server:", reason)
    })

    this.socket.on("connect_error", (error: Error) => {
      console.error("Connection error:", error)
      this.errorListeners.forEach((listener) => listener(error))
    })

    // Main message handler - exactly as in HTML test
    this.socket.on("message", (message: any) => {
      console.log("Received message:", message)

      // Convert to our Message format
      const formattedMessage: Message = {
        id: message.id || `msg-${Date.now()}`,
        content: message.content || "",
        sender: message.senderType || "system",
        senderId: message.senderId || message.patientId || message.doctorId || "unknown",
        timestamp: message.timestamp || new Date().toISOString(),
        messageType: message.contentType === "voice" ? "voice" : "text",
        audioUrl: message.audioUrl,
        metadata: message.metadata,
        senderType: message.senderType,
        senderName: message.senderName || message.patientName || message.doctorName,
        contentType: message.contentType,
      }

      this.messageListeners.forEach((listener) => listener(formattedMessage))
    })

    this.socket.on("roomStatus", (status: RoomStatus) => {
      console.log("Room status update:", status)
      this.roomStatusListeners.forEach((listener) => listener(status))
    })

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error)
      this.errorListeners.forEach((listener) => listener(new Error(error.toString())))
    })

    // Doctor joined notification - exactly as in HTML test
    this.socket.on("doctorJoined", (notification: any) => {
      console.log("Doctor joined:", notification)
      const chatNotification: ChatNotification = {
        type: "doctorJoined",
        message: notification.message || `Dr. ${notification.doctorName} has joined the conversation`,
        data: {
          doctorName: notification.doctorName,
          doctorId: notification.doctorId,
          roomId: notification.roomId,
        },
        timestamp: notification.timestamp || new Date().toISOString(),
      }
      this.notificationListeners.forEach((listener) => listener(chatNotification))
    })

    // Doctor mode changed - exactly as in HTML test
    this.socket.on("doctorModeChanged", (notification: any) => {
      console.log("Doctor mode changed:", notification)
      const chatNotification: ChatNotification = {
        type: "doctorModeChanged",
        message: notification.message || "Communication mode changed",
        data: {
          directMode: notification.directMode,
          doctorName: notification.doctorName,
          doctorId: notification.doctorId,
          roomId: notification.roomId,
        },
        timestamp: notification.timestamp || new Date().toISOString(),
      }
      this.notificationListeners.forEach((listener) => listener(chatNotification))
    })

    // Patient room created - exactly as in HTML test
    this.socket.on("patientRoomCreated", (notification: any) => {
      console.log("Patient room created:", notification)
      const chatNotification: ChatNotification = {
        type: "patientRoomCreated",
        message: notification.message || "New patient consultation started",
        data: {
          roomId: notification.roomId,
          patientId: notification.patientId,
          patientName: notification.patientName,
        },
        timestamp: notification.timestamp || new Date().toISOString(),
      }
      this.notificationListeners.forEach((listener) => listener(chatNotification))

      // Update room list for doctors
      if (notification.room) {
        this.roomListListeners.forEach((listener) => listener([notification.room]))
      }
    })

    this.socket.on("activeRoomsUpdate", (rooms: ConsultationRoom[]) => {
      console.log("Active rooms update:", rooms)
      this.roomListListeners.forEach((listener) => listener(rooms))
    })
  }

  // Patient Methods - exactly matching HTML test implementation
  public joinConsultation(
    patientId: string,
    patientName: string,
    medicalContext: MedicalContext,
  ): Promise<{ roomId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"))
        return
      }

      console.log("Patient joining consultation:", { patientId, patientName })

      this.socket.emit(
        "patientJoin",
        {
          patientId,
          patientName,
          medicalContext,
        },
        (error: string | null, response: any) => {
          if (error) {
            console.error("Error joining consultation:", error)
            reject(new Error(error))
          } else {
            console.log("Successfully joined consultation:", response)
            resolve({ roomId: response.roomId })
          }
        },
      )
    })
  }

  public sendPatientMessage(roomId: string, patientId: string, content: string): void {
    if (!this.socket) {
      console.error("Socket not connected")
      return
    }

    console.log("Sending patient message:", { roomId, patientId, content })

    this.socket.emit(
      "patientMessage",
      {
        roomId,
        patientId,
        content,
      },
      (error: string | null, response: any) => {
        if (error) {
          console.error("Error sending patient message:", error)
        } else {
          console.log("Patient message sent successfully")
        }
      },
    )
  }

  // Doctor Methods - exactly matching HTML test implementation
  public doctorLogin(doctorId: string, doctorName: string): Promise<{ activeRooms: ConsultationRoom[] }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"))
        return
      }

      console.log("Doctor logging in:", { doctorId, doctorName })

      this.socket.emit(
        "doctorLogin",
        {
          doctorId,
          doctorName,
        },
        (error: string | null, response: any) => {
          if (error) {
            console.error("Error logging in:", error)
            reject(new Error(error))
          } else {
            console.log("Doctor logged in successfully:", response)
            resolve({ activeRooms: response.activeRooms || [] })
          }
        },
      )
    })
  }

  public doctorJoinRoom(roomId: string, doctorId: string, doctorName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"))
        return
      }

      console.log("Doctor joining room:", { roomId, doctorId, doctorName })

      this.socket.emit(
        "doctorJoinRoom",
        {
          roomId,
          doctorId,
          doctorName,
        },
        (error: string | null, response: any) => {
          if (error) {
            console.error("Error joining room:", error)
            reject(new Error(error))
          } else {
            console.log("Doctor joined room successfully:", response)
            resolve(response)
          }
        },
      )
    })
  }

  public sendDoctorMessage(roomId: string, doctorId: string, doctorName: string, content: string): void {
    if (!this.socket) {
      console.error("Socket not connected")
      return
    }

    console.log("Sending doctor message:", { roomId, doctorId, doctorName, content })

    this.socket.emit(
      "doctorMessage",
      {
        roomId,
        doctorId,
        doctorName,
        content,
      },
      (error: string | null, response: any) => {
        if (error) {
          console.error("Error sending doctor message:", error)
        } else {
          console.log("Doctor message sent successfully")
        }
      },
    )
  }

  public toggleDoctorMode(
    roomId: string,
    doctorId: string,
    doctorName: string,
    enableDirectMode: boolean,
  ): Promise<{ directMode: boolean }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"))
        return
      }

      console.log("Toggling doctor mode:", { roomId, doctorId, doctorName, enableDirectMode })

      this.socket.emit(
        "toggleDoctorMode",
        {
          roomId,
          doctorId,
          doctorName,
          enableDirectMode,
        },
        (error: string | null, response: any) => {
          if (error) {
            console.error("Error toggling doctor mode:", error)
            reject(new Error(error))
          } else {
            console.log("Doctor mode toggled successfully:", response)
            resolve({ directMode: response.directMode })
          }
        },
      )
    })
  }

  // Voice Messages - exactly matching HTML test implementation
  public sendVoiceMessage(
    roomId: string,
    senderId: string,
    senderType: "patient" | "doctor",
    audioData: string,
    duration: number,
  ): Promise<{ audioUrl: string; messageId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"))
        return
      }

      console.log("Sending voice message:", { roomId, senderId, senderType, duration })

      this.socket.emit(
        "voiceMessage",
        {
          roomId,
          senderId,
          senderType,
          audioData,
          duration,
        },
        (error: string | null, response: any) => {
          if (error) {
            console.error("Error sending voice message:", error)
            reject(new Error(error))
          } else {
            console.log("Voice message sent successfully:", response)
            resolve({
              audioUrl: response.audioUrl || response.fileUrl,
              messageId: response.messageId,
            })
          }
        },
      )
    })
  }

  // Data Query for Doctors - matching API spec
  public async queryPatientData(roomId: string, doctorId: string, query: string): Promise<{ insight: string }> {
    if (!this.socket) {
      throw new Error("Socket not connected")
    }

    try {
      // Use the REST API endpoint as shown in the HTML test
      const response = await fetch("/api/medical/doctors/data-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": doctorId,
          "x-user-type": "doctor",
        },
        body: JSON.stringify({
          roomId,
          doctorId,
          query,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { insight: data.insight || "No insights available" }
    } catch (error) {
      console.error("Error querying patient data:", error)
      throw error
    }
  }

  // Room Status
  public getRoomStatus(roomId: string): void {
    if (!this.socket) {
      console.error("Socket not connected")
      return
    }

    this.socket.emit("getRoomStatus", { roomId })
  }

  // Event Listeners
  public onMessage(listener: (message: Message) => void): () => void {
    this.messageListeners.push(listener)
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== listener)
    }
  }

  public onRoomStatus(listener: (status: RoomStatus) => void): () => void {
    this.roomStatusListeners.push(listener)
    return () => {
      this.roomStatusListeners = this.roomStatusListeners.filter((l) => l !== listener)
    }
  }

  public onNotification(listener: (notification: ChatNotification) => void): () => void {
    this.notificationListeners.push(listener)
    return () => {
      this.notificationListeners = this.notificationListeners.filter((l) => l !== listener)
    }
  }

  public onRoomListUpdate(listener: (rooms: ConsultationRoom[]) => void): () => void {
    this.roomListListeners.push(listener)
    return () => {
      this.roomListListeners = this.roomListListeners.filter((l) => l !== listener)
    }
  }

  public onError(listener: (error: Error) => void): () => void {
    this.errorListeners.push(listener)
    return () => {
      this.errorListeners = this.errorListeners.filter((l) => l !== listener)
    }
  }

  // Cleanup
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.messageListeners = []
      this.roomStatusListeners = []
      this.errorListeners = []
      this.notificationListeners = []
      this.roomListListeners = []
    }
  }
}

export const medicalChatService = MedicalChatService.getInstance()
export const chatService = MedicalChatService.getInstance() // Keep backward compatibility
