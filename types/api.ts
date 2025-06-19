// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
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
  success: boolean
}

// Dashboard Types
export interface DashboardMetrics {
  totalPregnancies: number
  totalPatients: number
  highRiskCases: number
  scheduledAppointments: number
  newPatientsThisMonth: number
  completedPregnanciesThisMonth: number
}

export interface ChartDataset {
  labels: string[]
  datasets: Array<{
    data: number[]
    color?: (opacity?: number) => string
    strokeWidth?: number
  }>
}

export interface DashboardAnalytics {
  monthlyTrends: ChartDataset
  weeklyVisits: ChartDataset
}

export interface TodayScheduleAppointment {
  id: string
  patientId: string
  patientName: string
  time: string
  type: string
  status: "confirmed" | "pending" | "cancelled"
  duration: number
  notes?: string
}

export interface TodaySchedule {
  appointments: TodayScheduleAppointment[]
}

export interface SearchResult {
  id: string
  type: "patient" | "appointment" | "health" | "form"
  title: string
  subtitle: string
  category: string
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  searchTime: number
}

// Patient Types
export interface PatientName {
  given: string[]
  family: string
}

export interface PatientTelecom {
  system: "phone" | "email"
  value: string
}

export interface PatientAddress {
  line: string[]
  city: string
  state: string
  postalCode: string
  country: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface PatientCreateRequest {
  name: PatientName[]
  telecom: PatientTelecom[]
  gender: "male" | "female" | "other"
  birthDate: string
  address?: PatientAddress[]
  emergencyContact?: EmergencyContact
  medicalHistory?: string
  allergies?: string
  currentMedications?: string
  isHighRisk: boolean
  bloodType?: string
  insurance?: string
}

export interface PatientMeta {
  lastUpdated: string
  versionId: string
}

export interface PatientResponse {
  id: string
  resourceType: "Patient"
  name: PatientName[]
  telecom: PatientTelecom[]
  gender: string
  birthDate: string
  address?: PatientAddress[]
  meta: PatientMeta
}

export interface PatientListItem {
  id: string
  name: string
  condition: string
  lastVisit: string
  age: number
  phone: string
  pregnancyWeek?: number
  riskLevel: "Low" | "Medium" | "High"
  data: PatientResponse
}

export interface PatientSummary {
  totalPatients: number
  highRiskPatients: number
  dueSoonPatients: number
  newPatientsThisMonth: number
  success: boolean
  data: PatientSummary
}

export interface PatientForSelection {
  id: string
  name: string
  email: string
  phone: string
  data: PatientResponse
}

export interface PatientForForm {
  id: string
  name: string
  email: string
  phone?: string
  dateOfBirth: string
  gender: string
  active: boolean
  lastVisit?: string
}

// Pregnancy Types
export interface PregnancyCreateRequest {
  patientId: string
  lastMenstrualPeriod: string
  estimatedDueDate: string
  currentWeek: number
  riskLevel: "low" | "medium" | "high"
  complications?: string
  previousPregnancies?: string
  currentSymptoms?: string
  bloodPressure?: string
  weight?: number
  height?: number
  prenatalVitamins: boolean
  smokingStatus: boolean
  alcoholConsumption: boolean
  notes?: string
}

export interface PregnancyExtension {
  url: string
  valueString?: string
  valueInteger?: number
  valueBoolean?: boolean
}

export interface PregnancyResponse {
  id: string
  resourceType: "EpisodeOfCare"
  status: "active"
  patient: {
    reference: string
  }
  period: {
    start: string
    end?: string
  }
  extension: PregnancyExtension[]
  meta: PatientMeta
}

// Appointment Types
export interface ServiceTypeCoding {
  system: string
  code: string
  display: string
}

export interface ServiceType {
  coding: ServiceTypeCoding[]
}

export interface AppointmentParticipant {
  actor: {
    reference: string
  }
  status: "accepted" | "declined" | "tentative"
}

export interface AppointmentCreateRequest {
  status: "proposed" | "pending" | "booked"
  serviceType?: ServiceType[]
  start: string
  end: string
  participant: AppointmentParticipant[]
  comment?: string
  location?: string
}

export interface AppointmentResponse {
  id: string
  resourceType: "Appointment"
  status: string
  start: string
  end: string
  participant: AppointmentParticipant[]
  meta: PatientMeta
}

export interface TimeSlot {
  time: string
  available: boolean
  duration: number
  appointmentId?: string
}

export interface ScheduleAvailability {
  date: string
  timeSlots: TimeSlot[]
  data: ScheduleAvailability
}

// Health Monitoring Types
export type HealthMetricType = "Blood Pressure" | "Fetal Heart Rate" | "Weight Gain" | "Glucose Level"
export type HealthStatus = "normal" | "high" | "low" | "critical"
export type TrendDirection = "increasing" | "decreasing" | "stable"

export interface HealthMetric {
  id: string
  patientName: string
  patientId: string
  metric: HealthMetricType
  value: string
  unit: string
  status: HealthStatus
  timestamp: string
  normalRange: string
  trend: TrendDirection
}

export interface HealthMetricsSummary {
  normalCount: number
  lowCount: number
  highCount: number
  criticalCount: number
}

export interface HealthMetricsTrends {
  labels: string[]
  datasets: Array<{
    data: number[]
    color: (opacity?: number) => string
    strokeWidth: number
  }>
}

// Notification Types
export type NotificationType = "appointment" | "patient_update" | "emergency" | "reminder" | "system"
export type NotificationPriority = "low" | "medium" | "high"
export type NotificationStatus = "read" | "unread"

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: string
  isRead: boolean
  priority: NotificationPriority
  patientName?: string
  actionRequired?: boolean
}

export interface NotificationCreateRequest {
  recipient: string
  subject: string
  message: string
  priority: NotificationPriority
  type: "appointment" | "patient_update" | "reminder" | "general"
}

export interface CommunicationSubject {
  text: string
}

export interface CommunicationPayload {
  contentString: string
}

export interface CommunicationResponse {
  id: string
  resourceType: "Communication"
  status: "completed"
  subject: CommunicationSubject
  payload: CommunicationPayload[]
  sent: string
  meta: PatientMeta
}

export interface MarkAllReadResponse {
  updatedCount: number
}

// Form Types
export type FormFieldType = "text" | "textarea" | "number" | "date" | "select" | "radio" | "checkbox" | "file"
export type FormStatus = "draft" | "active" | "archived"

export interface FormFieldValidation {
  min?: number
  max?: number
  pattern?: string
  minLength?: number
  maxLength?: number
  customMessage?: string
}

export interface FormField {
  id?: string
  type: FormFieldType
  label: string
  required: boolean
  placeholder?: string
  helpText?: string
  options?: string[]
  validation?: FormFieldValidation
}

export interface FormTemplateCreateRequest {
  title: string
  description: string
  category?: string
  status: FormStatus
  fields: FormField[]
  version: string
}

export interface FormTemplate {
  id: string
  title: string
  description: string
  category?: string
  status: FormStatus
  version: string
  fields: FormField[]
  createdBy: string
  createdAt: string
  updatedAt: string
  completedCount: number
  totalSent: number
}

export interface FormSendRequest {
  formId: string
  patientIds: string[]
  message?: string
  dueDate?: string
  priority?: NotificationPriority
}

export interface FormSendResult {
  patientId: string
  patientName: string
  status: "sent" | "failed"
  sentAt?: string
  error?: string
}

export interface FormSendResponse {
  formId: string
  sentCount: number
  failedCount: number
  sentTo: FormSendResult[]
}

export interface FormListItem {
  id: string
  title: string
  description: string
  version: string
  status: FormStatus
  completedCount: number
  totalSent: number
  lastUpdated: string
  createdBy: string
}

// Analytics Types
export interface AnalyticsMetrics {
  totalPatients: number
  newPatients: number
  completedPregnancies: number
  averageVisits: number
  satisfactionScore: number
}

export interface PieChartData {
  name: string
  population: number
  color: string
  legendFontColor: string
  legendFontSize: number
}

export interface AnalyticsChartData {
  patientTrends?: ChartDataset
  riskDistribution?: PieChartData[]
  gestationalAge?: ChartDataset
}

export type InsightType = "positive" | "concern" | "recommendation"

export interface ReportInsight {
  id: string
  type: InsightType
  title: string
  description: string
  actionItems: string[]
}

export interface ExportDateRange {
  start: string
  end: string
}

export interface ExportRequest {
  format: "pdf" | "csv"
  includeCharts: boolean
  includePatientData: boolean
  includeHealthMetrics: boolean
  dateRange: ExportDateRange
}

export interface ExportResponse {
  downloadUrl: string
  fileName: string
  fileSize: number
  expiresAt: string
}

// Error Types
export interface ApiError {
  success: false
  error: string
  message: string
  details?: Record<string, string>
  timestamp: string
}

export interface ValidationError extends ApiError {
  error: "Validation Error"
  details: Record<string, string>
}

export interface UnauthorizedError extends ApiError {
  error: "Unauthorized"
}

export interface ForbiddenError extends ApiError {
  error: "Forbidden"
}

export interface NotFoundError extends ApiError {
  error: "Not Found"
}

export interface InternalServerError extends ApiError {
  error: "Internal Server Error"
}

export interface RateLimitError extends ApiError {
  error: "Too Many Requests"
  retryAfter: number
}

// Rate Limiting Headers
export interface RateLimitHeaders {
  "X-RateLimit-Limit": string
  "X-RateLimit-Remaining": string
  "X-RateLimit-Reset": string
}

// Query Parameter Types
export interface PaginationParams {
  _page?: number
  _count?: number
}

export interface PatientQueryParams extends PaginationParams {
  name?: string
  _include?: string
  search?: string
  active?: boolean
}

export interface HealthMetricsQueryParams extends PaginationParams {
  status?: HealthStatus
  patientId?: string
}

export interface NotificationQueryParams extends PaginationParams {
  status?: NotificationStatus
  priority?: NotificationPriority
  search?: string
}

export interface FormQueryParams extends PaginationParams {
  status?: FormStatus
}

export interface AnalyticsQueryParams {
  timeframe?: "1month" | "3months" | "6months" | "1year"
  chartType?: "trends" | "risk" | "age"
  weeks?: number
}

export interface ScheduleQueryParams {
  date: string
  duration?: number
}

export interface SearchQueryParams {
  q: string
  limit?: number
  types?: string
}

// Token Management Types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}
