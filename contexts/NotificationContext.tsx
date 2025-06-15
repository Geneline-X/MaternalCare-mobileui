"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as SecureStore from "expo-secure-store"

interface NotificationContextType {
  notificationsEnabled: boolean
  toggleNotifications: () => void
  appointmentReminders: boolean
  setAppointmentReminders: (enabled: boolean) => void
  medicationAlerts: boolean
  setMedicationAlerts: (enabled: boolean) => void
  healthTips: boolean
  setHealthTips: (enabled: boolean) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)
  const [medicationAlerts, setMedicationAlerts] = useState(true)
  const [healthTips, setHealthTips] = useState(false)

  useEffect(() => {
    loadNotificationSettings()
  }, [])

  const loadNotificationSettings = async () => {
    try {
      const settings = await SecureStore.getItemAsync("notification_settings")
      if (settings) {
        const parsed = JSON.parse(settings)
        setNotificationsEnabled(parsed.notificationsEnabled ?? true)
        setAppointmentReminders(parsed.appointmentReminders ?? true)
        setMedicationAlerts(parsed.medicationAlerts ?? true)
        setHealthTips(parsed.healthTips ?? false)
      }
    } catch (error) {
      console.error("Error loading notification settings:", error)
    }
  }

  const saveNotificationSettings = async (settings: any) => {
    try {
      await SecureStore.setItemAsync("notification_settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving notification settings:", error)
    }
  }

  const toggleNotifications = () => {
    const newValue = !notificationsEnabled
    setNotificationsEnabled(newValue)
    saveNotificationSettings({
      notificationsEnabled: newValue,
      appointmentReminders,
      medicationAlerts,
      healthTips,
    })
  }

  const updateAppointmentReminders = (enabled: boolean) => {
    setAppointmentReminders(enabled)
    saveNotificationSettings({
      notificationsEnabled,
      appointmentReminders: enabled,
      medicationAlerts,
      healthTips,
    })
  }

  const updateMedicationAlerts = (enabled: boolean) => {
    setMedicationAlerts(enabled)
    saveNotificationSettings({
      notificationsEnabled,
      appointmentReminders,
      medicationAlerts: enabled,
      healthTips,
    })
  }

  const updateHealthTips = (enabled: boolean) => {
    setHealthTips(enabled)
    saveNotificationSettings({
      notificationsEnabled,
      appointmentReminders,
      medicationAlerts,
      healthTips: enabled,
    })
  }

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        toggleNotifications,
        appointmentReminders,
        setAppointmentReminders: updateAppointmentReminders,
        medicationAlerts,
        setMedicationAlerts: updateMedicationAlerts,
        healthTips,
        setHealthTips: updateHealthTips,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
