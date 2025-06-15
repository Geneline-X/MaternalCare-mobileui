"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Translation keys and values
const translations = {
  en: {
    // Common
    common: {
      ok: "OK",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      remove: "Remove",
      enable: "Enable",
      disable: "Disable",
      yes: "Yes",
      no: "No",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Info",
      permission: "Permission Required",
    },
    // Settings
    settings: {
      title: "Settings",
      account: "Account",
      preferences: "Preferences",
      healthData: "Health Data",
      support: "Support",
      editProfile: "Edit Profile",
      personalInfo: "Personal Information",
      personalInfoDesc: "Update your personal details",
      changePassword: "Change Password",
      changePasswordDesc: "Update your password",
      privacySecurity: "Privacy & Security",
      privacySecurityDesc: "Manage your privacy settings",
      notifications: "Enable Notifications",
      notificationsDesc: "Master toggle for all notifications",
      pushNotifications: "Push Notifications",
      pushNotificationsDesc: "Receive push notifications on your device",
      emailNotifications: "Email Notifications",
      emailNotificationsDesc: "Receive notifications via email",
      emergencyAlerts: "Emergency Alerts",
      emergencyAlertsDesc: "Critical patient alerts (recommended)",
      darkMode: "Dark Mode",
      darkModeDesc: "Switch to dark theme",
      language: "Language",
      dataSharing: "Data Sharing",
      dataSharingDesc: "Manage data sharing preferences",
      connectedDevices: "Connected Devices",
      connectedDevicesDesc: "Manage connected health devices",
      consentManagement: "Consent Management",
      consentManagementDesc: "View and manage consent forms",
      contactSupport: "Contact Support",
      contactSupportDesc: "Get help with your account",
      termsPrivacy: "Terms & Privacy",
      termsPrivacyDesc: "Read our terms and privacy policy",
      signOut: "Sign Out",
      signOutConfirmation: "Are you sure you want to sign out?",
      enableNotifications: "Enable Notifications",
      enableMainNotificationsFirst: "Please enable main notifications first to receive push notifications.",
      disableEmergencyAlerts: "Disable Emergency Alerts",
      emergencyAlertsWarning: "Are you sure you want to disable emergency alerts? This may affect patient safety.",
      patients: "Patients",
      appointments: "Appointments",
    },
    // Edit Profile
    editProfile: {
      title: "Edit Profile",
      firstName: "First Name",
      firstNamePlaceholder: "Enter your first name",
      lastName: "Last Name",
      lastNamePlaceholder: "Enter your last name",
      email: "Email",
      emailPlaceholder: "Enter your email address",
      phone: "Phone Number",
      phonePlaceholder: "Enter your phone number",
      specialty: "Specialty",
      specialtyPlaceholder: "Enter your medical specialty",
      license: "License Number",
      licensePlaceholder: "Enter your license number",
      experience: "Experience",
      experiencePlaceholder: "Enter years of experience",
      bio: "Bio",
      bioPlaceholder: "Tell us about yourself...",
      tapToChange: "Tap to change photo",
      selectPhoto: "Select Photo",
      selectPhotoDesc: "Choose how you'd like to select your photo",
      camera: "Camera",
      gallery: "Gallery",
      cameraPermission: "Camera permission is required to take photos.",
      fillRequired: "Please fill in all required fields.",
      profileUpdated: "Profile updated successfully!",
      updateFailed: "Failed to update profile. Please try again.",
    },
    // Language Selection
    language: {
      title: "Language",
      selectLanguage: "Select Language",
      english: "English",
      krio: "Krio",
      languageChanged: "Language changed successfully!",
    },
  },
  kr: {
    // Common (Krio translations)
    common: {
      ok: "OK",
      cancel: "Kansul",
      save: "Sev",
      delete: "Dilit",
      edit: "Edit",
      add: "Ad",
      remove: "Rimov",
      enable: "On",
      disable: "Of",
      yes: "Yes",
      no: "No",
      loading: "E de lod...",
      error: "Erɔ",
      success: "Sakses",
      warning: "Wanin",
      info: "Infɔmeshɔn",
      permission: "Pɔmishɔn Nid",
    },
    // Settings (Krio translations)
    settings: {
      title: "Setin",
      account: "Akɔnt",
      preferences: "Wetin Yu Layk",
      healthData: "Wɛlbɔdi Data",
      support: "Ɛp",
      editProfile: "Chenj Profayl",
      personalInfo: "Pɔsɔn Infɔmeshɔn",
      personalInfoDesc: "Chenj yu pɔsɔn tin dɛn",
      changePassword: "Chenj Paswɔd",
      changePasswordDesc: "Chenj yu paswɔd",
      privacySecurity: "Prayvasi & Sikuriti",
      privacySecurityDesc: "Manej yu prayvasi setin dɛn",
      notifications: "On Notifikeshɔn",
      notificationsDesc: "Men butn fɔ ɔl notifikeshɔn",
      pushNotifications: "Push Notifikeshɔn",
      pushNotificationsDesc: "Gɛt notifikeshɔn na yu fon",
      emailNotifications: "Imel Notifikeshɔn",
      emailNotificationsDesc: "Gɛt notifikeshɔn na yu imel",
      emergencyAlerts: "Ɛmajɛnsi Alat",
      emergencyAlertsDesc: "Impɔtant peshɛnt alat (wi rɛkɔmɛnd)",
      darkMode: "Dak Mod",
      darkModeDesc: "Chenj to dak tem",
      language: "Langwej",
      dataSharing: "Data Sherin",
      dataSharingDesc: "Manej data sherin setin",
      connectedDevices: "Kɔnɛkt Divays",
      connectedDevicesDesc: "Manej kɔnɛkt wɛlbɔdi divays",
      consentManagement: "Kɔnsɛnt Manejmɛnt",
      consentManagementDesc: "Si ɛn manej kɔnsɛnt fɔm",
      contactSupport: "Kɔntakt Sɔpɔt",
      contactSupportDesc: "Gɛt ɛp wit yu akɔnt",
      termsPrivacy: "Tɛm & Prayvasi",
      termsPrivacyDesc: "Rid wi tɛm ɛn prayvasi pɔlisi",
      signOut: "Sayn Awt",
      signOutConfirmation: "Yu shɔ se yu wan sayn awt?",
      enableNotifications: "On Notifikeshɔn",
      enableMainNotificationsFirst: "Duya on men notifikeshɔn fɔs fɔ gɛt push notifikeshɔn.",
      disableEmergencyAlerts: "Of Ɛmajɛnsi Alat",
      emergencyAlertsWarning: "Yu shɔ se yu wan of ɛmajɛnsi alat? Dis kin afɛkt peshɛnt sefti.",
      patients: "Peshɛnt",
      appointments: "Apɔyntmɛnt",
    },
    // Edit Profile (Krio translations)
    editProfile: {
      title: "Chenj Profayl",
      firstName: "Fɔs Nem",
      firstNamePlaceholder: "Rayt yu fɔs nem",
      lastName: "Las Nem",
      lastNamePlaceholder: "Rayt yu las nem",
      email: "Imel",
      emailPlaceholder: "Rayt yu imel adres",
      phone: "Fon Nɔmba",
      phonePlaceholder: "Rayt yu fon nɔmba",
      specialty: "Speshalist",
      specialtyPlaceholder: "Rayt yu mɛdikal speshalist",
      license: "Laysɛns Nɔmba",
      licensePlaceholder: "Rayt yu laysɛns nɔmba",
      experience: "Ɛkspiriɛns",
      experiencePlaceholder: "Rayt aw mɛni ia yu dɔn wok",
      bio: "Abawt Yu",
      bioPlaceholder: "Tɛl wi abawt yusɛf...",
      tapToChange: "Tach fɔ chenj foto",
      selectPhoto: "Pik Foto",
      selectPhotoDesc: "Pik aw yu wan pik yu foto",
      camera: "Kamɛra",
      gallery: "Galɛri",
      cameraPermission: "Wi nid kamɛra pɔmishɔn fɔ tek foto.",
      fillRequired: "Duya fil ɔl di tin dɛn we yu mɔs fil.",
      profileUpdated: "Profayl dɔn chenj fayn!",
      updateFailed: "Wi nɔ ebul fɔ chenj profayl. Tray bak.",
    },
    // Language Selection (Krio translations)
    language: {
      title: "Langwej",
      selectLanguage: "Pik Langwej",
      english: "Inglish",
      krio: "Krio",
      languageChanged: "Langwej dɔn chenj fayn!",
    },
  },
}

interface TranslationContextType {
  t: (key: string) => string
  currentLanguage: string
  changeLanguage: (language: string) => void
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

interface TranslationProviderProps {
  children: ReactNode
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  useEffect(() => {
    loadLanguagePreference()
  }, [])

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("selectedLanguage")
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage)
      }
    } catch (error) {
      console.error("Error loading language preference:", error)
    }
  }

  const changeLanguage = async (language: string) => {
    try {
      setCurrentLanguage(language)
      await AsyncStorage.setItem("selectedLanguage", language)
    } catch (error) {
      console.error("Error saving language preference:", error)
    }
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[currentLanguage as keyof typeof translations]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return (
    <TranslationContext.Provider value={{ t, currentLanguage, changeLanguage }}>{children}</TranslationContext.Provider>
  )
}
