"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import * as SecureStore from "expo-secure-store"

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  colors: any
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const lightColors = {
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  white: "#ffffff",
  black: "#000000",
}

const darkColors = {
  primary: {
    50: "#0c4a6e",
    100: "#075985",
    200: "#0369a1",
    300: "#0284c7",
    400: "#0ea5e9",
    500: "#38bdf8",
    600: "#7dd3fc",
    700: "#bae6fd",
    800: "#e0f2fe",
    900: "#f0f9ff",
  },
  neutral: {
    50: "#171717",
    100: "#262626",
    200: "#404040",
    300: "#525252",
    400: "#737373",
    500: "#a3a3a3",
    600: "#d4d4d4",
    700: "#e5e5e5",
    800: "#f5f5f5",
    900: "#fafafa",
  },
  error: {
    50: "#7f1d1d",
    100: "#991b1b",
    200: "#b91c1c",
    300: "#dc2626",
    400: "#ef4444",
    500: "#f87171",
    600: "#fca5a5",
    700: "#fecaca",
    800: "#fee2e2",
    900: "#fef2f2",
  },
  white: "#000000",
  black: "#ffffff",
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    loadThemeSettings()
  }, [])

  const loadThemeSettings = async () => {
    try {
      const theme = await SecureStore.getItemAsync("theme_mode")
      if (theme) {
        setIsDarkMode(theme === "dark")
      }
    } catch (error) {
      console.error("Error loading theme settings:", error)
    }
  }

  const toggleTheme = async () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    try {
      await SecureStore.setItemAsync("theme_mode", newMode ? "dark" : "light")
    } catch (error) {
      console.error("Error saving theme settings:", error)
    }
  }

  const colors = isDarkMode ? darkColors : lightColors

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
