/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

export function useMatchNotifications() {
  const { user } = useAuth()
  const lastCheckRef = useRef<Date>(new Date())
  const isCheckingRef = useRef(false)

  const checkForNewMatches = useCallback(async () => {
    if (!user || isCheckingRef.current) return

    isCheckingRef.current = true

    try {
      const response = await fetch(`/api/matches/recent?since=${lastCheckRef.current.toISOString()}`)

      if (response.ok) {
        const newMatches = await response.json()

        newMatches.forEach((match: any) => {
          // Determine if user is the owner (lost phone) or finder
          const isOwner = match.report?.userId === user.id && match.report?.type === "lost"
          const isFinder = match.matchedReport?.userId === user.id && match.matchedReport?.type === "found"

          if (isOwner || isFinder) {
            const phoneInfo = `${match.report?.brand || match.matchedReport?.brand} ${
              match.report?.color || match.matchedReport?.color
            }`

            toast.success(`🎯 Match Found: ${phoneInfo}`, {
              description: isOwner
                ? "Someone found your phone! Click to review the match."
                : "Your found phone matches someone's lost report!",
              action: {
                label: "View Match",
                onClick: () => {
                  window.location.href = "/dashboard?tab=matches"
                },
              },
              duration: 10000,
            })
          }
        })

        lastCheckRef.current = new Date()
      }
    } catch (error) {
      console.error("Failed to check for new matches:", error)
    } finally {
      isCheckingRef.current = false
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    // Check immediately
    checkForNewMatches()

    // Then check every 10 seconds for new matches
    const interval = setInterval(checkForNewMatches, 10000)

    return () => clearInterval(interval)
  }, [user, checkForNewMatches])

  return { checkForNewMatches }
}
