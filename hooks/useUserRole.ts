"use client"

import { useUser } from "@clerk/clerk-expo"
import { useMemo } from "react"

export function useUserRole() {
  const { user, isLoaded } = useUser()

  const roleData = useMemo(() => {
    if (!isLoaded) {
      return {
        role: null,
        isDoctor: false,
        isPatient: false,
        isLoaded: false,
      }
    }

    if (!user) {
      return {
        role: null,
        isDoctor: false,
        isPatient: false,
        isLoaded: true,
      }
    }

    // Get role from unsafeMetadata (set during signup)
    const role = (user.unsafeMetadata?.role as "doctor" | "patient") || "patient"

    return {
      role,
      isDoctor: role === "doctor",
      isPatient: role === "patient",
      isLoaded: true,
    }
  }, [user, isLoaded])

  return roleData
}

// Type definitions for better TypeScript support
export type UserRole = "doctor" | "patient" | null

export interface UseUserRoleReturn {
  role: UserRole
  isDoctor: boolean
  isPatient: boolean
  isLoaded: boolean
}
