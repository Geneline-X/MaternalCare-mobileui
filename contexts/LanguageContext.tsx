"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as SecureStore from "expo-secure-store"

interface Language {
  code: string
  name: string
  nativeName: string
}

interface LanguageContextType {
  currentLanguage: string
  setLanguage: (code: string) => void
  t: (key: string) => string
  languages: Language[]
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "kri", name: "Krio", nativeName: "Krio" },
]

const translations: Record<string, Record<string, string>> = {
  en: {
    settings: "Settings",
    account: "Account",
    preferences: "Preferences",
    support: "Support",
    personalInfo: "Personal Information",
    changePassword: "Change Password",
    privacySecurity: "Privacy & Security",
    notifications: "Notifications",
    darkMode: "Dark Mode",
    language: "Language",
    contactSupport: "Contact Support",
    termsPrivacy: "Terms & Privacy",
    signOut: "Sign Out",
    editProfile: "Edit Profile",
    save: "Save",
    cancel: "Cancel",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
  },
  kri: {
    settings: "Sɛtin dɛm",
    account: "Akɔnt",
    preferences: "Wetin yu lɛk",
    support: "Ɛp",
    personalInfo: "Yu yon infɔmeshɔn",
    changePassword: "Chenj paswɔd",
    privacySecurity: "Prayvasi ɛn sikuriti",
    notifications: "Notifikeshɔn dɛm",
    darkMode: "Dak mod",
    language: "Langwej",
    contactSupport: "Kɔntakt ɛp",
    termsPrivacy: "Tɛm ɛn prayvasi",
    signOut: "Kɔmɔt",
    editProfile: "Chenj profayl",
    save: "Sev",
    cancel: "Kansɛl",
    firstName: "Fɔs nem",
    lastName: "Las nem",
    email: "Imel",
    phone: "Fon",
    currentPassword: "Dis paswɔd",
    newPassword: "Nyu paswɔd",
    confirmPassword: "Kɔnfam paswɔd",
  },
  es: {
    settings: "Configuración",
    account: "Cuenta",
    preferences: "Preferencias",
    support: "Soporte",
    personalInfo: "Información Personal",
    changePassword: "Cambiar Contraseña",
    privacySecurity: "Privacidad y Seguridad",
    notifications: "Notificaciones",
    darkMode: "Modo Oscuro",
    language: "Idioma",
    contactSupport: "Contactar Soporte",
    termsPrivacy: "Términos y Privacidad",
    signOut: "Cerrar Sesión",
    editProfile: "Editar Perfil",
    save: "Guardar",
    cancel: "Cancelar",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo",
    phone: "Teléfono",
    currentPassword: "Contraseña Actual",
    newPassword: "Nueva Contraseña",
    confirmPassword: "Confirmar Contraseña",
  },
  fr: {
    settings: "Paramètres",
    account: "Compte",
    preferences: "Préférences",
    support: "Support",
    personalInfo: "Informations Personnelles",
    changePassword: "Changer le Mot de Passe",
    privacySecurity: "Confidentialité et Sécurité",
    notifications: "Notifications",
    darkMode: "Mode Sombre",
    language: "Langue",
    contactSupport: "Contacter le Support",
    termsPrivacy: "Conditions et Confidentialité",
    signOut: "Se Déconnecter",
    editProfile: "Modifier le Profil",
    save: "Enregistrer",
    cancel: "Annuler",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    currentPassword: "Mot de Passe Actuel",
    newPassword: "Nouveau Mot de Passe",
    confirmPassword: "Confirmer le Mot de Passe",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  useEffect(() => {
    loadLanguageSettings()
  }, [])

  const loadLanguageSettings = async () => {
    try {
      const language = await SecureStore.getItemAsync("selected_language")
      if (language) {
        setCurrentLanguage(language)
      }
    } catch (error) {
      console.error("Error loading language settings:", error)
    }
  }

  const setLanguage = async (code: string) => {
    setCurrentLanguage(code)
    try {
      await SecureStore.setItemAsync("selected_language", code)
    } catch (error) {
      console.error("Error saving language settings:", error)
    }
  }

  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key
  }

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
