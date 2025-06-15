"use client"

import { useUser } from "@clerk/clerk-expo"

export function useUserRole() {
  const { user, isLoaded } = useUser()

  if (!isLoaded || !user) {
    return {
      role: null,
      isDoctor: false,
      isPatient: false,
      isLoaded: false,
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
}
