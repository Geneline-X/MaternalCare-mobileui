export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'nurse';
  avatar?: string;
  facility?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  emergencyContact: string;
  isHighRisk: boolean;
  avatar?: string;
}

export interface Pregnancy {
  id: string;
  patientId: string;
  startDate: string;
  dueDate: string;
  currentWeek: number;
  status: 'active' | 'completed' | 'terminated';
  riskLevel: 'low' | 'medium' | 'high';
  complications: string[];
}

export interface Observation {
  id: string;
  patientId: string;
  pregnancyId: string;
  type: 'blood_pressure' | 'weight' | 'heart_rate' | 'blood_sugar' | 'other';
  value: string;
  unit: string;
  date: string;
  notes?: string;
  recordedBy: string;
}

export interface Visit {
  id: string;
  patientId: string;
  pregnancyId: string;
  date: string;
  type: 'routine' | 'emergency' | 'follow_up';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  practitioner: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'alert' | 'info';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface DynamicForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  version: string;
  isActive: boolean;
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}