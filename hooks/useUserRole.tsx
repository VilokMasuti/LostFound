"use client"

import { useAuth } from "@/context/AuthContext"

export type UserRole = "owner" | "finder" | "anonymous"

export function useUserRole(reportUserId?: string) {
  const { user } = useAuth()

  if (!user || !reportUserId) return "anonymous"
  if (user._id === reportUserId) return "owner"
  return "finder"
}
