/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function useGlobalReportNotifications() {
  const router = useRouter()
  const lastCheckRef = useRef(Date.now())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkForNewReports = async () => {
      try {
        const response = await fetch(`/api/report/recent?since=${lastCheckRef.current}`)
        if (response.ok) {
          const newReports = await response.json()

          if (newReports.length > 0) {
            newReports.forEach((report: any) => {
              toast.success(`📱 New ${report.type} phone: ${report.brand} ${report.color}`, {
                duration: 6000,
                action: {
                  label: "View Report",
                  onClick: () => router.push(`/reports/${report._id}`),
                },
                style: {
                  background: "#111111",
                  color: "#FFFFFF",
                  border: "1px solid #333333",
                },
              })
            })

            // Update last check time
            lastCheckRef.current = Date.now()
          }
        }
      } catch (error) {
        // Silent fail - don't spam users with errors
        console.error("Failed to check for new reports:", error)
      }
    }

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(() => {
      checkForNewReports()
    }, 5000)

    // Then check every 30 seconds
    intervalRef.current = setInterval(checkForNewReports, 30000)

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [router])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
}
