export type UserRole = "patient" | "doctor" | "nurse"

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  avatar?: string
  facility?: string
  unsafeMetadata?: {
    role?: string
    [key: string]: unknown
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContact: string
  isHighRisk: boolean
  avatar?: string
}

export interface Pregnancy {
  id: string
  patientId: string
  startDate: string
  dueDate: string
  currentWeek: number
  status: "active" | "completed" | "terminated"
  riskLevel: "low" | "medium" | "high"
  complications: string[]
}

export interface Observation {
  id: string
  patientId: string
  pregnancyId: string
  type: "blood_pressure" | "weight" | "heart_rate" | "blood_sugar" | "other"
  value: string
  unit: string
  date: string
  notes?: string
  recordedBy: string
}

export interface Visit {
  id: string
  patientId: string
  pregnancyId: string
  date: string
  type: "routine" | "emergency" | "follow_up"
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  practitioner: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "appointment" | "reminder" | "alert" | "info"
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    data: number[]
    color: (opacity?: number) => string
    strokeWidth: number
  }[]
}

export type SenderType = "patient" | "doctor" | "system" | "ai"

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderType: SenderType
  content: string
  timestamp: string
  type: "text" | "voice"
  status?: "sending" | "sent" | "delivered" | "read" | "failed"
  metadata?: {
    duration?: number
    size?: number
    mimeType?: string
  }
}

export interface RoomStatus {
  roomId: string
  isActive: boolean
  participants: string[]
  lastActivity: string
  unreadCount?: number
}

export interface ChatState {
  messages: ChatMessage[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
  activeRoom: string | null
  unreadCounts: Record<string, number>
}

export interface Message {
  id: string
  content: string
  sender: SenderType
  senderId: string
  timestamp: string
  messageType?: "text" | "voice"
  voiceUrl?: string
  status?: "sent" | "delivered" | "read"
  audioUrl?: string
  contentType?: string
  metadata?: VoiceMetadata | Record<string, unknown>
  senderType?: SenderType
  senderName?: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  dateTime: Date
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  type: "in-person" | "video" | "phone"
  notes?: string
  duration: number // in minutes
}

export interface DynamicForm {
  id: string
  title: string
  description: string
  fields: FormField[]
  version: string
  isActive: boolean
}

export interface FormField {
  id: string
  type: "text" | "number" | "date" | "select" | "checkbox" | "textarea"
  label: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface RoomStatus {
  roomId: string
  patientId: string
  doctorId: string | null
  directMode: boolean
  currentOverrideId: string | null
  messages: Message[]
}

export interface SocketConfig {
  url: string
  options?: {
    reconnectionAttempts?: number
    reconnectionDelay?: number
    autoConnect?: boolean
    auth?: {
      token?: string
    }
  }
}

export interface JoinRoomParams {
  roomId: string
  userId: string
  userName?: string
  isDoctor?: boolean
}

export interface SendMessageParams {
  roomId: string
  senderId: string
  senderType: SenderType
  content: string
  type?: "text" | "voice"
  metadata?: Record<string, unknown>
}

export interface VoiceMessageParams extends Omit<SendMessageParams, "type"> {
  duration: number
  audioData: string // base64 encoded audio
}

export interface ChatEventCallbacks {
  onMessage?: (message: ChatMessage) => void
  onRoomStatus?: (status: RoomStatus) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
}
export interface VoiceMetadata {
  uri: string
  duration: number
  size?: number
  mimeType?: string
}

// Chat and AI Integration Types
export interface ConsultationRoom {
  id: string
  patientId: string
  patientName?: string
  doctorId?: string
  currentOverrideId?: string
  status: "active" | "closed"
  directMode: boolean
  createdAt: string
  updatedAt: string
  unreadCount?: number
  lastMessage?: ChatMessage
}

export interface MedicalContext {
  pregnancyStatus?: "confirmed" | "unconfirmed" | "not_pregnant"
  gestationalAge?: string
  dueDate?: string
  highRisk?: boolean
  conditions?: Array<{ name: string; severity?: string }>
  medications?: Array<{ name: string; dosage: string }>
  allergies?: Array<{ name: string }>
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: string
    temperature?: string
    weight?: string
  }
}

export interface AIMessage extends ChatMessage {
  isAI: boolean
  confidence?: number
  suggestedActions?: string[]
}

export interface DoctorPresence {
  doctorId: string
  doctorName: string
  isOnline: boolean
  lastSeen: string
  activeRooms: string[]
}

export interface ChatNotification {
  type: "doctorJoined" | "doctorModeChanged" | "patientRoomCreated" | "doctorStatus"
  message: string
  data?: any
  timestamp: string
}
