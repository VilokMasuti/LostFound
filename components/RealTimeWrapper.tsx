"use client"

import type React from "react"
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications"

interface RealTimeWrapperProps {
  children: React.ReactNode
}

export function RealTimeWrapper({ children }: RealTimeWrapperProps) {
  // Enable real-time notifications
  useRealTimeNotifications()

  return <>{children}</>
}
