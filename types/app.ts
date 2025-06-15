// Dashboard and Search Types
export interface SearchResult {
    id: string
    type: "patient" | "appointment" | "health" | "form"
    title: string
    subtitle: string
    category: string
  }
  
  export interface DashboardData {
    totalPregnancies: number
    totalPatients: number
    highRiskCases: number
    scheduledAppointments: number
    monthlyTrends: ChartDataset
    weeklyVisits: ChartDataset
  }
  
  // Chart and Analytics Types
  export interface ChartDataset {
    labels: string[]
    datasets: Array<{
      data: number[]
      color?: (opacity?: number) => string
      strokeWidth?: number
    }>
  }
  
  export interface PieChartData {
    name: string
    population: number
    color: string
    legendFontColor: string
    legendFontSize: number
  }
  
  export interface AnalyticsMetrics {
    totalPatients: number
    newPatients: number
    completedPregnancies: number
    averageVisits: number
    satisfactionScore: number
  }
  
  // Health Monitoring Types
  export interface HealthMetric {
    id: string
    patientName: string
    patientId: string
    metric: "Blood Pressure" | "Fetal Heart Rate" | "Weight Gain" | "Glucose Level" | "Heart Rate" | "Temperature"
    value: string
    unit: string
    status: "normal" | "high" | "low" | "critical"
    timestamp: string
    normalRange: string
    trend: "increasing" | "decreasing" | "stable"
    notes?: string
  }
  
  export interface HealthAlert {
    id: string
    patientId: string
    metricId: string
    severity: "low" | "medium" | "high" | "critical"
    message: string
    timestamp: string
    acknowledged: boolean
    actionTaken?: string
  }
  
  // Form Management Types
  export interface FormTemplate {
    id: string
    title: string
    description: string
    version: string
    status: "active" | "draft" | "archived"
    completedCount: number
    totalSent: number
    lastUpdated: string
    fields: FormFieldTemplate[]
    createdBy: string
    category?: string
  }
  
  export interface FormFieldTemplate {
    id: string
    type: "text" | "number" | "date" | "select" | "checkbox" | "textarea" | "radio" | "file"
    label: string
    required: boolean
    options?: string[]
    validation?: FieldValidation
    placeholder?: string
    helpText?: string
  }
  
  export interface FieldValidation {
    min?: number
    max?: number
    pattern?: string
    minLength?: number
    maxLength?: number
    customMessage?: string
  }
  
  export interface FormSubmission {
    id: string
    formId: string
    patientId: string
    responses: Record<string, any>
    submittedAt: string
    status: "completed" | "partial" | "pending"
    reviewedBy?: string
    reviewedAt?: string
    notes?: string
  }
  
  // Patient Management Types
  export interface PatientSummary {
    totalPatients: number
    highRiskPatients: number
    dueSoonPatients: number
    newPatientsThisMonth: number
  }
  
  export interface Patient {
    id: string
    name: string
    dateOfBirth: string
    gender: string
    contactNumber: string
    address: string
    email: string
  }
  
  export interface Pregnancy {
    id: string
    patientId: string
    startDate: string
    estimatedDeliveryDate: string
    outcome?: string
    notes?: string
  }
  
  export interface Observation {
    id: string
    patientId: string
    date: string
    type: string
    value: string
    notes?: string
  }

  export interface ChatMessage {
    id: string;
    text: string;
    sender: 'me' | 'other';
    timestamp: string;
    patientName?: string;
  }
  
  export interface Visit {
    id: string
    patientId: string
    date: string
    doctorId: string
    notes?: string
  }
  
  export interface PatientDetails extends Patient {
    pregnancies: Pregnancy[]
    observations: Observation[]
    visits: Visit[]
    riskFactors: string[]
    allergies: string[]
    medications: Medication[]
    emergencyContacts: EmergencyContact[]
  }
  
  export interface Medication {
    id: string
    name: string
    dosage: string
    frequency: string
    startDate: string
    endDate?: string
    prescribedBy: string
    notes?: string
  }
  
  export interface EmergencyContact {
    id: string
    name: string
    relationship: string
    phone: string
    email?: string
    isPrimary: boolean
  }
  
  // Appointment and Schedule Types
  export interface Appointment {
    id: string
    patientId: string
    doctorId: string
    date: string
    time: string
    duration: number // in minutes
    type: "routine" | "emergency" | "follow_up" | "consultation" | "ultrasound"
    status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
    location: string
    notes?: string
    reminders: AppointmentReminder[]
  }
  
  export interface AppointmentReminder {
    id: string
    type: "sms" | "email" | "push"
    scheduledFor: string
    sent: boolean
    sentAt?: string
  }
  
  export interface TimeSlot {
    time: string
    available: boolean
    duration: number
    appointmentId?: string
  }
  
  export interface Schedule {
    date: string
    timeSlots: TimeSlot[]
    totalSlots: number
    availableSlots: number
    bookedSlots: number
  }
  

  // Settings and Preferences Types
  export interface UserSettings {
    id: string
    userId: string
    notifications: NotificationSettings
    privacy: PrivacySettings
    appearance: AppearanceSettings
    language: string
    timezone: string
  }
  
  export interface NotificationSettings {
    pushNotifications: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    appointmentReminders: boolean
    healthAlerts: boolean
    systemUpdates: boolean
    marketingEmails: boolean
  }
  
  export interface PrivacySettings {
    profileVisibility: "public" | "private" | "contacts_only"
    dataSharing: boolean
    analyticsTracking: boolean
    locationServices: boolean
    biometricAuth: boolean
  }
  
  export interface AppearanceSettings {
    theme: "light" | "dark" | "system"
    fontSize: "small" | "medium" | "large"
    colorScheme: string
    compactMode: boolean
  }
  
  // Reports and Export Types
  export interface ReportFilter {
    dateRange: {
      start: string
      end: string
    }
    patientIds?: string[]
    riskLevels?: ("low" | "medium" | "high")[]
    gestationalAgeRange?: {
      min: number
      max: number
    }
    includeCompleted?: boolean
  }
  
  export interface ExportOptions {
    format: "pdf" | "csv" | "excel"
    includeCharts: boolean
    includePatientData: boolean
    includeHealthMetrics: boolean
    dateRange: {
      start: string
      end: string
    }
  }
  
  export interface ReportInsight {
    id: string
    type: "positive" | "concern" | "recommendation"
    title: string
    description: string
    metrics?: Record<string, number>
    actionItems?: string[]
  }
  
  // Device and Integration Types
  export interface ConnectedDevice {
    id: string
    name: string
    type: "blood_pressure" | "glucose_meter" | "scale" | "heart_rate" | "fitness_tracker"
    brand: string
    model: string
    lastSync: string
    status: "connected" | "disconnected" | "error"
    batteryLevel?: number
  }
  
  export interface DeviceReading {
    id: string
    deviceId: string
    patientId: string
    type: string
    value: number
    unit: string
    timestamp: string
    quality: "good" | "fair" | "poor"
    notes?: string
  }
  
  // API Response Types
  export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
    timestamp: string
  }
  
  export interface PaginatedResponse<T = any> {
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
  
  // UI Component Types
  export interface TabBarItem {
    name: string
    icon: string
    activeIcon?: string
    badge?: number
    disabled?: boolean
  }
  
  export interface ModalProps {
    visible: boolean
    onClose: () => void
    title?: string
    size?: "small" | "medium" | "large" | "fullscreen"
  }
  
  export interface LoadingState {
    isLoading: boolean
    message?: string
    progress?: number
  }
  
  export interface ErrorState {
    hasError: boolean
    message?: string
    code?: string
    retryable?: boolean
  }
  export interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    [key: string]: string | undefined; // Index signature for additional properties
  }
  
  // Utility Types
  export type UserRole = "patient" | "doctor" | "nurse" | "admin"
  export type RiskLevel = "low" | "medium" | "high"
  export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show"
  export type NotificationType = "appointment" | "reminder" | "alert" | "info" | "system"
  export type FormStatus = "active" | "draft" | "archived"
  export type HealthStatus = "normal" | "high" | "low" | "critical"
  export type TrendDirection = "increasing" | "decreasing" | "stable"
  