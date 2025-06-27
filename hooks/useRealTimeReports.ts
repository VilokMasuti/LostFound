/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

interface UseRealTimeReportsProps {
  userId?: string
  onNewReport?: (report: any) => void
}

export function useRealTimeReports({ userId, onNewReport }: UseRealTimeReportsProps) {
  const lastCheckRef = useRef<Date>(new Date())
  const isPollingRef = useRef(false)

  const checkForNewReports = useCallback(async () => {
    if (!userId || isPollingRef.current) return

    isPollingRef.current = true

    try {
      const response = await fetch(`/api/report/recent?since=${lastCheckRef.current.toISOString()}`)

      if (response.ok) {
        const newReports = await response.json()

        newReports.forEach((report: any) => {
          // Don't notify about user's own reports
          if (report.userId === userId) return

          // Show toast for new found phones (might match user's lost items)
          if (report.type === "found") {
            toast.info(`🆕 New phone found: ${report.brand} ${report.color}`, {
              description: `Found near ${report.location}. Check if it's yours!`,
              action: {
                label: "View Report",
                onClick: () => window.open(`/reports/${report._id}`, "_blank"),
              },
              duration: 10000,
            })
          }

          // Show toast for new lost phones (if user has found items)
          if (report.type === "lost") {
            toast.info(`🔍 Someone lost: ${report.brand} ${report.color}`, {
              description: `Lost near ${report.location}. Do you have it?`,
              action: {
                label: "Check Reports",
                onClick: () => window.open("/reports", "_blank"),
              },
              duration: 8000,
            })
          }

          if (onNewReport) {
            onNewReport(report)
          }
        })

        lastCheckRef.current = new Date()
      }
    } catch (error) {
      console.error("Failed to check for new reports:", error)
    } finally {
      isPollingRef.current = false
    }
  }, [userId, onNewReport])

  useEffect(() => {
    if (!userId) return

    // Check immediately
    checkForNewReports()

    // Then check every 15 seconds for new reports
    const interval = setInterval(checkForNewReports, 15000)

    return () => clearInterval(interval)
  }, [userId, checkForNewReports])

  return { checkForNewReports }
}
