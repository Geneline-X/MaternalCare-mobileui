"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@clerk/clerk-expo"

export interface Doctor {
  id: string
  name: string
  email: string
  role: string
  specialization?: string
}

export interface Appointment {
  id: string
  resourceType: string
  patientId: string
  doctorId: string
  status: "pending" | "confirmed" | "cancelled" | "fulfilled" | "noshow"
  appointmentType: string
  date: string
  time: string
  duration: number
  reason: string
  notes?: string
  doctorInfo?: Doctor
  preferredContact?: "phone" | "email"
  reminderEnabled?: boolean
}

export interface CreateAppointmentData {
  doctorId: string
  appointmentType: string
  date: string
  time: string
  duration: number
  reason: string
  notes?: string
  preferredContact?: "phone" | "email"
  reminderEnabled?: boolean
}

export interface UpdateAppointmentData {
  notes?: string
  reason?: string
  preferredContact?: "phone" | "email"
  reminderEnabled?: boolean
  status?: string
  date?: string
  time?: string
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api"

export const useAppointments = () => {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAppointments = useCallback(
    async (filters: Record<string, string> = {}): Promise<Appointment[]> => {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()
        const queryParams = new URLSearchParams(filters).toString()
        const endpoint = queryParams ? `/fhir/Appointment?${queryParams}` : "/fhir/Appointment"

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch appointments: ${response.statusText}`)
        }

        const appointments = await response.json()
        return appointments
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch appointments"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getToken],
  )

  const createAppointment = useCallback(
    async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()

        const response = await fetch(`${API_BASE_URL}/fhir/Appointment`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(appointmentData),
        })

        if (!response.ok) {
          throw new Error(`Failed to create appointment: ${response.statusText}`)
        }

        const appointment = await response.json()
        return appointment
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create appointment"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getToken],
  )

  const updateAppointment = useCallback(
    async (appointmentId: string, updateData: UpdateAppointmentData): Promise<Appointment> => {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()

        const response = await fetch(`${API_BASE_URL}/fhir/Appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          throw new Error(`Failed to update appointment: ${response.statusText}`)
        }

        const appointment = await response.json()
        return appointment
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update appointment"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getToken],
  )

  const deleteAppointment = useCallback(
    async (appointmentId: string): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()

        const response = await fetch(`${API_BASE_URL}/fhir/Appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`Failed to delete appointment: ${response.statusText}`)
        }

        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete appointment"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getToken],
  )

  const getAppointment = useCallback(
    async (appointmentId: string): Promise<Appointment> => {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()

        const response = await fetch(`${API_BASE_URL}/fhir/Appointment/${appointmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch appointment: ${response.statusText}`)
        }

        const appointment = await response.json()
        return appointment
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch appointment"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getToken],
  )

  const getDoctors = useCallback(async (): Promise<Doctor[]> => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()

      const response = await fetch(`${API_BASE_URL}/fhir/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch doctors: ${response.statusText}`)
      }

      const doctors = await response.json()
      return doctors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch doctors"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const completeAppointment = useCallback(
    async (appointmentId: string): Promise<Appointment> => {
      setLoading(true)
      setError(null)
      try {
        const token = await getToken()

        const response = await fetch(`${API_BASE_URL}/fhir/Appointment/${appointmentId}/complete`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "PUT",
        })

        if (!response.ok) {
          throw new Error(`Failed to complete appointment: ${response.statusText}`)
        }

        const appointment = await response.json()
        return appointment
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to complete appointment"
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [getToken],
  )

  return {
    loading,
    error,
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
    getDoctors,
    completeAppointment,
  }
}
