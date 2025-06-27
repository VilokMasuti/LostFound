"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

export interface Notification {
  _id: string
  userId: string
  type: "match_found" | "message_received" | "report_resolved" | "match_confirmed"
  title: string
  message: string
  read: boolean
  createdAt: string
  relatedId?: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      } else if (response.status === 401) {
        // User not authenticated, clear notifications
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PATCH",
      })
      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchNotifications()

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    } else {
      // Clear notifications when user logs out
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
