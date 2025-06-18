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

    this.socket = io(config.url, {
      reconnectionAttempts: config.options?.reconnectionAttempts || 5,
      reconnectionDelay: config.options?.reconnectionDelay || 1000,
      autoConnect: config.options?.autoConnect ?? true,
      transports: ["websocket"],
    })

    this.setupEventListeners()
  }

  public setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("Connected to medical chat server")
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from medical chat server")
    })

    this.socket.on("connect_error", (error: Error) => {
      console.error("Connection error:", error)
      this.errorListeners.forEach((listener) => listener(error))
    })

    this.socket.on("message", (message: Message) => {
      this.messageListeners.forEach((listener) => listener(message))
    })

    this.socket.on("roomStatus", (status: RoomStatus) => {
      this.roomStatusListeners.forEach((listener) => listener(status))
    })

    this.socket.on("error", (error: Error) => {
      console.error("Socket error:", error)
      this.errorListeners.forEach((listener) => listener(error))
    })

    // Medical-specific events
    this.socket.on("doctorJoined", (notification: ChatNotification) => {
      this.notificationListeners.forEach((listener) => listener(notification))
    })

    this.socket.on("doctorModeChanged", (notification: ChatNotification) => {
      this.notificationListeners.forEach((listener) => listener(notification))
    })

    this.socket.on("patientRoomCreated", (notification: ChatNotification) => {
      this.notificationListeners.forEach((listener) => listener(notification))
    })

    this.socket.on("doctorStatus", (notification: ChatNotification) => {
      this.notificationListeners.forEach((listener) => listener(notification))
    })

    this.socket.on("activeRoomsUpdate", (rooms: ConsultationRoom[]) => {
      this.roomListListeners.forEach((listener) => listener(rooms))
    })
  }

  // Patient Methods
  public joinConsultation(
    patientId: string,
    patientName: string,
    medicalContext: MedicalContext,
  ): Promise<{ roomId: string }> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        "patientJoin",
        {
          patientId,
          patientName,
          medicalContext,
        },
        (error: string | null, response: { roomId: string }) => {
          if (error) {
            reject(new Error(error))
          } else {
            resolve(response)
          }
        },
      )
    })
  }

  public sendPatientMessage(roomId: string, patientId: string, content: string): void {
    this.socket?.emit("patientMessage", { roomId, patientId, content })
  }

  // Doctor Methods
  public doctorLogin(doctorId: string, doctorName: string): Promise<{ activeRooms: ConsultationRoom[] }> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        "doctorLogin",
        {
          doctorId,
          doctorName,
        },
        (error: string | null, response: { activeRooms: ConsultationRoom[] }) => {
          if (error) {
            reject(new Error(error))
          } else {
            resolve(response)
          }
        },
      )
    })
  }

  public doctorJoinRoom(roomId: string, doctorId: string, doctorName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        "doctorJoinRoom",
        {
          roomId,
          doctorId,
          doctorName,
        },
        (error: string | null) => {
          if (error) {
            reject(new Error(error))
          } else {
            resolve()
          }
        },
      )
    })
  }

  public sendDoctorMessage(roomId: string, doctorId: string, doctorName: string, content: string): void {
    this.socket?.emit("doctorMessage", { roomId, doctorId, doctorName, content })
  }

  public toggleDoctorMode(
    roomId: string,
    doctorId: string,
    doctorName: string,
    enableDirectMode: boolean,
  ): Promise<{ directMode: boolean }> {
    return new Promise((resolve, reject) => {
      this.socket?.emit(
        "toggleDoctorMode",
        {
          roomId,
          doctorId,
          doctorName,
          enableDirectMode,
        },
        (error: string | null, response: { directMode: boolean }) => {
          if (error) {
            reject(new Error(error))
          } else {
            resolve(response)
          }
        },
      )
    })
  }

  // Voice Messages
  public sendVoiceMessage(
    roomId: string,
    senderId: string,
    senderType: "patient" | "doctor",
    audioData: string,
    duration: number,
  ): void {
    this.socket?.emit("voiceMessage", {
      roomId,
      senderId,
      senderType,
      audioData,
      duration,
    })
  }

  // Room Status
  public getRoomStatus(roomId: string): void {
    this.socket?.emit("getRoomStatus", { roomId })
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
