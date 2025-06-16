# Maternal Care Mobile App - API Endpoints Specification

## Overview
This document outlines all the API endpoints needed for the Maternal Care Mobile Application, with separate specifications for **Doctor** and **Patient** user roles.

---

## 🏥 DOCTOR ENDPOINTS

### Authentication & Profile Management

#### POST /auth/login
**Purpose**: Doctor login authentication
```json
{
  "email": "doctor@example.com",
  "password": "securePassword123",
  "role": "doctor",
  "deviceInfo": {
    "deviceId": "unique-device-id",
    "platform": "ios|android",
    "version": "1.0.0"
  }
}
```
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "doc_123",
      "email": "doctor@example.com",
      "firstName": "Dr. John",
      "lastName": "Smith",
      "role": "doctor",
      "specialization": "Obstetrics & Gynecology",
      "licenseNumber": "MD123456",
      "profilePicture": "https://example.com/profile.jpg"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresAt": 1640995200000
    }
  }
}
```

#### GET /users/profile
**Purpose**: Get doctor's profile information
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "firstName": "Dr. John",
    "lastName": "Smith",
    "email": "doctor@example.com",
    "phone": "+1234567890",
    "specialization": "Obstetrics & Gynecology",
    "licenseNumber": "MD123456",
    "hospital": "City General Hospital",
    "experience": 15,
    "profilePicture": "https://example.com/profile.jpg",
    "settings": {
      "notifications": true,
      "language": "en",
      "timezone": "America/New_York"
    }
  }
}
```

### Dashboard & Analytics

#### GET /analytics/dashboard
**Purpose**: Get doctor's dashboard statistics
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "totalPatients": 156,
    "activePregnancies": 89,
    "highRiskCases": 12,
    "appointmentsToday": 8,
    "appointmentsThisWeek": 32,
    "monthlyTrends": {
      "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      "datasets": [{
        "data": [45, 52, 48, 61, 58, 67],
        "color": "#3B82F6"
      }]
    },
    "recentAlerts": [
      {
        "id": "alert_1",
        "patientId": "pat_456",
        "patientName": "Sarah Johnson",
        "type": "high_blood_pressure",
        "severity": "high",
        "message": "Blood pressure reading: 160/100 mmHg",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Patient Management

#### GET /patients
**Purpose**: Get all patients assigned to the doctor
**Headers**: `Authorization: Bearer {accessToken}`
**Query Parameters**: 
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string (optional)
- `riskLevel`: "low|medium|high" (optional)
- `status`: "active|inactive" (optional)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "pat_456",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah.johnson@email.com",
        "phone": "+1234567890",
        "dateOfBirth": "1990-05-15",
        "age": 34,
        "bloodType": "O+",
        "riskLevel": "medium",
        "currentPregnancy": {
          "id": "preg_789",
          "gestationalWeek": 28,
          "trimester": 3,
          "dueDate": "2024-04-15",
          "condition": "Normal progression"
        },
        "lastVisit": "2024-01-10T14:00:00Z",
        "nextAppointment": "2024-01-20T10:00:00Z",
        "profilePicture": "https://example.com/patient1.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "totalPatients": 156,
      "highRiskPatients": 12,
      "dueSoonPatients": 8,
      "newPatientsThisMonth": 5
    }
  }
}
```

#### GET /patients/:id
**Purpose**: Get detailed information for a specific patient
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "pat_456",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@email.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-05-15",
    "age": 34,
    "bloodType": "O+",
    "address": "123 Main St, City, State 12345",
    "riskLevel": "medium",
    "currentPregnancy": {
      "id": "preg_789",
      "gestationalWeek": 28,
      "trimester": 3,
      "dueDate": "2024-04-15",
      "conception": "2023-07-15",
      "condition": "Normal progression",
      "complications": []
    },
    "medicalHistory": {
      "previousPregnancies": 1,
      "conditions": ["Gestational Diabetes (Previous)", "Hypertension"],
      "allergies": ["Penicillin", "Shellfish"],
      "currentMedications": [
        {
          "name": "Prenatal Vitamins",
          "dosage": "1 tablet daily",
          "prescribedDate": "2023-07-20"
        }
      ]
    },
    "emergencyContacts": [
      {
        "name": "John Johnson",
        "relationship": "Husband",
        "phone": "+1234567891",
        "isPrimary": true
      }
    ],
    "recentVitals": [
      {
        "date": "2024-01-15",
        "weight": "68.5 kg",
        "bloodPressure": "125/80 mmHg",
        "heartRate": "78 bpm",
        "temperature": "98.6°F"
      }
    ],
    "upcomingAppointments": [
      {
        "id": "apt_123",
        "date": "2024-01-20",
        "time": "10:00",
        "type": "routine_checkup",
        "location": "Room 205"
      }
    ]
  }
}
```

#### POST /patients
**Purpose**: Create a new patient
**Headers**: `Authorization: Bearer {accessToken}`
**Payload**:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@email.com",
  "phone": "+1234567892",
  "dateOfBirth": "1992-03-20",
  "bloodType": "A+",
  "address": "456 Oak St, City, State 12345",
  "emergencyContacts": [
    {
      "name": "Mike Doe",
      "relationship": "Husband",
      "phone": "+1234567893",
      "isPrimary": true
    }
  ],
  "medicalHistory": {
    "conditions": ["None"],
    "allergies": ["None"],
    "previousPregnancies": 0
  },
  "insurance": {
    "provider": "Blue Cross",
    "policyNumber": "BC123456789"
  }
}
```

### Health Monitoring

#### GET /health-metrics/patient/:patientId
**Purpose**: Get health metrics for a specific patient
**Headers**: `Authorization: Bearer {accessToken}`
**Query Parameters**:
- `startDate`: ISO date string
- `endDate`: ISO date string
- `metricType`: "blood_pressure|weight|heart_rate|glucose|temperature" (optional)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "metrics": [
      {
        "id": "metric_1",
        "patientId": "pat_456",
        "type": "blood_pressure",
        "value": "125/80",
        "unit": "mmHg",
        "status": "normal",
        "timestamp": "2024-01-15T10:30:00Z",
        "notes": "Patient feeling well",
        "trend": "stable"
      },
      {
        "id": "metric_2",
        "patientId": "pat_456",
        "type": "weight",
        "value": "68.5",
        "unit": "kg",
        "status": "normal",
        "timestamp": "2024-01-15T10:30:00Z",
        "trend": "increasing"
      }
    ],
    "trends": {
      "weight": {
        "labels": ["Week 24", "Week 25", "Week 26", "Week 27", "Week 28"],
        "data": [65.2, 66.1, 67.0, 67.8, 68.5]
      },
      "bloodPressure": {
        "systolic": [120, 122, 125, 123, 125],
        "diastolic": [78, 80, 80, 79, 80]
      }
    }
  }
}
```

#### POST /health-metrics
**Purpose**: Add new health metric reading
**Headers**: `Authorization: Bearer {accessToken}`
**Payload**:
```json
{
  "patientId": "pat_456",
  "type": "blood_pressure",
  "value": "130/85",
  "unit": "mmHg",
  "timestamp": "2024-01-15T14:30:00Z",
  "notes": "Patient reported mild headache",
  "deviceId": "bp_monitor_001"
}
```

### Appointments

#### GET /appointments/doctor/:doctorId
**Purpose**: Get all appointments for the doctor
**Headers**: `Authorization: Bearer {accessToken}`
**Query Parameters**:
- `date`: ISO date string (optional, defaults to today)
- `status`: "scheduled|confirmed|completed|cancelled" (optional)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "apt_123",
        "patientId": "pat_456",
        "patientName": "Sarah Johnson",
        "date": "2024-01-20",
        "time": "10:00",
        "duration": 30,
        "type": "routine_checkup",
        "status": "scheduled",
        "location": "Room 205",
        "notes": "28-week checkup",
        "gestationalWeek": 28
      }
    ],
    "summary": {
      "total": 8,
      "scheduled": 6,
      "completed": 2,
      "cancelled": 0
    }
  }
}
```

#### POST /appointments
**Purpose**: Schedule new appointment
**Headers**: `Authorization: Bearer {accessToken}`
**Payload**:
```json
{
  "patientId": "pat_456",
  "date": "2024-01-25",
  "time": "14:00",
  "duration": 30,
  "type": "routine_checkup",
  "location": "Room 205",
  "notes": "Follow-up for blood pressure monitoring",
  "reminders": [
    {
      "type": "sms",
      "scheduledFor": "2024-01-24T14:00:00Z"
    }
  ]
}
```

### Messaging

#### GET /messages/conversations
**Purpose**: Get all conversations for the doctor
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "patientId": "pat_456",
        "patientName": "Sarah Johnson",
        "lastMessage": {
          "content": "Thank you for the appointment reminder",
          "timestamp": "2024-01-15T16:30:00Z",
          "sender": "patient"
        },
        "unreadCount": 2,
        "isOnline": false
      }
    ]
  }
}
```

#### GET /messages/conversation/:conversationId
**Purpose**: Get messages in a specific conversation
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_1",
        "conversationId": "conv_123",
        "content": "How are you feeling today?",
        "sender": "doctor",
        "timestamp": "2024-01-15T15:00:00Z",
        "read": true
      },
      {
        "id": "msg_2",
        "conversationId": "conv_123",
        "content": "I'm feeling well, thank you for asking",
        "sender": "patient",
        "timestamp": "2024-01-15T15:30:00Z",
        "read": true
      }
    ]
  }
}
```

#### POST /messages
**Purpose**: Send message to patient
**Headers**: `Authorization: Bearer {accessToken}`
**Payload**:
```json
{
  "conversationId": "conv_123",
  "recipientId": "pat_456",
  "content": "Please remember to take your prenatal vitamins daily",
  "type": "text"
}
```

---

## 🤰 PATIENT ENDPOINTS

### Authentication & Profile Management

#### POST /auth/login
**Purpose**: Patient login authentication
```json
{
  "email": "patient@example.com",
  "password": "securePassword123",
  "role": "patient",
  "deviceInfo": {
    "deviceId": "unique-device-id",
    "platform": "ios|android",
    "version": "1.0.0"
  }
}
```
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "pat_456",
      "email": "patient@example.com",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "role": "patient",
      "dateOfBirth": "1990-05-15",
      "profilePicture": "https://example.com/patient.jpg"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresAt": 1640995200000
    }
  }
}
```

#### GET /users/profile
**Purpose**: Get patient's profile information
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "pat_456",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "patient@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-05-15",
    "age": 34,
    "bloodType": "O+",
    "address": "123 Main St, City, State 12345",
    "profilePicture": "https://example.com/patient.jpg",
    "emergencyContacts": [
      {
        "name": "John Johnson",
        "relationship": "Husband",
        "phone": "+1234567891",
        "isPrimary": true
      }
    ],
    "settings": {
      "notifications": true,
      "language": "en",
      "timezone": "America/New_York"
    }
  }
}
```

### Pregnancy Dashboard

#### GET /pregnancies/current/:patientId
**Purpose**: Get current pregnancy information for patient dashboard
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "preg_789",
    "patientId": "pat_456",
    "gestationalWeek": 28,
    "gestationalDay": 3,
    "trimester": 3,
    "dueDate": "2024-04-15",
    "conception": "2023-07-15",
    "condition": "Normal progression",
    "riskLevel": "medium",
    "babyDevelopment": {
      "size": "Size of an eggplant",
      "weight": "2.2 lbs",
      "length": "14.8 inches",
      "milestone": "Baby's eyes can now open and close"
    },
    "nextAppointment": {
      "id": "apt_123",
      "date": "2024-01-20",
      "time": "10:00",
      "doctorName": "Dr. John Smith",
      "type": "routine_checkup"
    },
    "weeklyTips": [
      "Continue taking prenatal vitamins",
      "Monitor baby's movements daily",
      "Stay hydrated and eat nutritious meals"
    ]
  }
}
```

### Health Tracking

#### GET /health-metrics/my-metrics
**Purpose**: Get patient's own health metrics
**Headers**: `Authorization: Bearer {accessToken}`
**Query Parameters**:
- `startDate`: ISO date string
- `endDate`: ISO date string
- `limit`: number (default: 50)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "latestMetrics": {
      "weight": {
        "value": "68.5",
        "unit": "kg",
        "date": "2024-01-15",
        "status": "normal"
      },
      "bloodPressure": {
        "value": "125/80",
        "unit": "mmHg",
        "date": "2024-01-15",
        "status": "normal"
      },
      "babyHeartRate": {
        "value": "145",
        "unit": "bpm",
        "date": "2024-01-10",
        "status": "normal"
      }
    },
    "trends": {
      "weight": {
        "labels": ["Week 24", "Week 25", "Week 26", "Week 27", "Week 28"],
        "data": [65.2, 66.1, 67.0, 67.8, 68.5],
        "target": [64.0, 65.0, 66.0, 67.0, 68.0]
      }
    },
    "goals": {
      "weightGain": {
        "target": "11-16 kg",
        "current": "8.5 kg",
        "status": "on_track"
      }
    }
  }
}
```

#### POST /health-metrics
**Purpose**: Patient logs their own health metrics
**Headers**: `Authorization: Bearer {accessToken}`
**Payload**:
```json
{
  "type": "weight",
  "value": "69.0",
  "unit": "kg",
  "timestamp": "2024-01-16T08:00:00Z",
  "notes": "Morning weight after breakfast",
  "symptoms": ["mild_nausea", "fatigue"]
}
```

### Appointments

#### GET /appointments/my-appointments
**Purpose**: Get patient's appointments
**Headers**: `Authorization: Bearer {accessToken}`
**Query Parameters**:
- `status`: "upcoming|past|all" (default: "upcoming")
- `limit`: number (default: 20)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "apt_123",
        "date": "2024-01-20",
        "time": "10:00",
        "duration": 30,
        "type": "routine_checkup",
        "status": "scheduled",
        "doctor": {
          "id": "doc_123",
          "name": "Dr. John Smith",
          "specialization": "Obstetrics & Gynecology"
        },
        "location": "Room 205, City General Hospital",
        "notes": "28-week checkup",
        "reminders": [
          {
            "type": "sms",
            "scheduledFor": "2024-01-19T10:00:00Z",
            "sent": false
          }
        ]
      }
    ],
    "nextAppointment": {
      "id": "apt_123",
      "date": "2024-01-20",
      "time": "10:00",
      "doctorName": "Dr. John Smith",
      "daysUntil": 5
    }
  }
}
```

#### POST /appointments/request
**Purpose**: Patient requests new appointment
**Headers**: `Authorization: Bearer {accessToken}`
**Payload**:
```json
{
  "doctorId": "doc_123",
  "preferredDate": "2024-01-25",
  "preferredTime": "morning|afternoon|evening",
  "type": "routine_checkup|urgent|consultation",
  "reason": "Routine 30-week checkup",
  "symptoms": ["mild_headache", "swelling"],
  "urgency": "normal|high"
}
```

### Messaging

#### GET /messages/conversations
**Purpose**: Get patient's conversations with healthcare providers
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "doctorId": "doc_123",
        "doctorName": "Dr. John Smith",
        "lastMessage": {
          "content": "Please remember to take your prenatal vitamins daily",
          "timestamp": "2024-01-15T16:30:00Z",
          "sender": "doctor"
        },
        "unreadCount": 1,
        "isOnline": true
      }
    ]
  }
}
```

#### POST /messages
**Purpose**: Send message to doctor
**Headers**: `Authorization: Bearer {accessToken}`
**Payload**:
```json
{
  "conversationId": "conv_123",
  "recipientId": "doc_123",
  "content": "I've been experiencing mild headaches. Should I be concerned?",
  "type": "text",
  "urgency": "normal|high"
}
```

### Notifications

#### GET /notifications
**Purpose**: Get patient's notifications
**Headers**: `Authorization: Bearer {accessToken}`
**Query Parameters**:
- `status`: "unread|read|all" (default: "unread")
- `type`: "appointment|health|medication|system" (optional)
- `limit`: number (default: 20)

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_1",
        "type": "appointment",
        "title": "Appointment Reminder",
        "message": "You have an appointment with Dr. John Smith tomorrow at 10:00 AM",
        "timestamp": "2024-01-19T09:00:00Z",
        "read": false,
        "actionRequired": true,
        "data": {
          "appointmentId": "apt_123"
        }
      },
      {
        "id": "notif_2",
        "type": "health",
        "title": "Weekly Health Check",
        "message": "Don't forget to log your weight and blood pressure this week",
        "timestamp": "2024-01-15T08:00:00Z",
        "read": false,
        "actionRequired": false
      },
      {
        "id": "notif_3",
        "type": "baby_development",
        "title": "Week 28 Update",
        "message": "Your baby is now the size of an eggplant! 🍆",
        "timestamp": "2024-01-14T00:00:00Z",
        "read": true,
        "actionRequired": false
      }
    ],
    "unreadCount": 2
  }
}
```

### Forms & Questionnaires

#### GET /forms/patient-forms
**Purpose**: Get forms assigned to patient
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "forms": [
      {
        "id": "form_1",
        "title": "Weekly Symptom Check",
        "description": "Track your weekly symptoms and how you're feeling",
        "dueDate": "2024-01-21",
        "status": "pending",
        "estimatedTime": "5 minutes",
        "category": "health_tracking"
      }
    ]
  }
}
```

#### POST /form-submissions
**Purpose**: Submit completed form
**Headers**: `Authorization: Bearer {accessToken}`
**Payload**:
```json
{
  "formId": "form_1",
  "responses": {
    "symptoms": ["mild_nausea", "fatigue"],
    "pain_level": 2,
    "sleep_quality": "good",
    "mood": "positive",
    "notes": "Feeling much better this week"
  },
  "submittedAt": "2024-01-16T10:00:00Z"
}
```

---

## 🔐 SHARED ENDPOINTS (Both Users)

### Authentication

#### POST /auth/refresh
**Purpose**: Refresh access token
**Headers**: `Authorization: Bearer {refreshToken}`
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "expiresAt": 1640995200000
  }
}
```

#### POST /auth/logout
**Purpose**: Logout user
**Headers**: `Authorization: Bearer {accessToken}`
**Expected Response**:
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### File Upload

#### POST /files/upload
**Purpose**: Upload files (images, documents)
**Headers**: 
- `Authorization: Bearer {accessToken}`
- `Content-Type: multipart/form-data`
**Payload**: FormData with file
**Expected Response**:
```json
{
  "success": true,
  "data": {
    "fileId": "file_123",
    "url": "https://example.com/uploads/file_123.jpg",
    "filename": "ultrasound_28weeks.jpg",
    "size": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

### Push Notifications

#### POST /notifications/register-device
**Purpose**: Register device for push notifications
**Headers**: `Authorization: Bearer {accessToken}`
**Payload**:
```json
{
  "deviceToken": "expo_push_token",
  "platform": "ios|android",
  "deviceId": "unique_device_id"
}
```

---

## 📊 Response Status Codes

- **200 OK**: Successful GET requests
- **201 Created**: Successful POST requests (resource created)
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Invalid or missing authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

## 🔒 Security Headers

All requests should include:
- `Authorization: Bearer {accessToken}`
- `Content-Type: application/json` (for JSON payloads)
- `X-API-Version: v1`
- `X-Client-Version: {app_version}`

## 📝 Notes

1. All timestamps should be in ISO 8601 format (UTC)
2. All endpoints support pagination where applicable
3. Rate limiting: 1000 requests per hour per user
4. File uploads limited to 10MB per file
5. All sensitive data should be encrypted in transit and at rest
6. HIPAA compliance required for all patient data handling
