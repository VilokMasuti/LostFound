/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import type { Message } from "@/type"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { GlassCard } from "@/components/ui/glass-card"
import { FuturisticButton } from "@/components/ui/futuristic-button"

import { MessageCircle, Mail, MailOpen, Trash2, Sparkles, Eye, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages")
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        toast.error("Failed to load messages")
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: "PATCH",
      })

      if (response.ok) {
        setMessages(messages.map((msg) => (msg._id === messageId ? { ...msg, read: true, readAt: new Date() } : msg)))
        toast.success("Message marked as read")
      } else {
        toast.error("Failed to mark message as read")
      }
    } catch (error) {
      console.error("Failed to mark message as read:", error)
      toast.error("Failed to mark message as read")
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessages(messages.filter((msg) => msg._id !== messageId))
        toast.success("Message deleted successfully")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to delete message")
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
      toast.error("An error occurred while deleting the message")
    }
  }

  const sendReply = async (reportId: string, message: string) => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          message,
          messageType: "reply",
          priority: "normal",
        }),
      })

      if (response.ok) {
        fetchMessages() // Refresh messages
      } else {
        throw new Error("Failed to send reply")
      }
    } catch (error) {
      throw error
    }
  }

  const unreadCount = messages.filter((msg) => !msg.read).length
  const conversationGroups = messages.reduce(
    (groups, message) => {
      const key = message.reportId
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(message)
      return groups
    },
    {} as Record<string, Message[]>,
  )

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-cyan-900 dark:to-blue-900" />



      <div className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <MessageCircle className="h-12 w-12 text-primary" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-xl text-muted-foreground">Messages and conversations about your reports</p>
        </motion.div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : messages.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {Object.entries(conversationGroups).map(([reportId, conversationMessages], index) => {
              const latestMessage = conversationMessages[0]
              const hasUnread = conversationMessages.some((msg) => !msg.read)

              return (
                <motion.div
                  key={reportId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <GlassCard className={`${hasUnread ? "border-primary glow-primary" : ""}`} hover>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-lg flex items-center gap-3">
                            {hasUnread ? (
                              <Mail className="h-5 w-5 text-primary" />
                            ) : (
                              <MailOpen className="h-5 w-5 text-muted-foreground" />
                            )}
                            <span>
                              Message about {latestMessage.report?.brand} {latestMessage.report?.color}
                            </span>
                            {hasUnread && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                New
                              </Badge>
                            )}
                          </CardTitle>

                          <CardDescription>
                            From: {latestMessage.from.name} ({latestMessage.from.email}) •{" "}
                            {format(new Date(latestMessage.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                          </CardDescription>

                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-medium mb-1">Message:</p>
                            <p className="text-sm">{latestMessage.message}</p>
                          </div>

                          {/* Report Context */}
                          {latestMessage.report && (
                            <div className="p-3 glass rounded-lg">
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                About this report:
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  Type: <span className="font-medium capitalize">{latestMessage.report.type}</span>
                                </div>
                                <div>
                                  Location: <span className="font-medium">{latestMessage.report.location}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {latestMessage.report && (
                            <Link href={`/reports/${latestMessage.report._id}`}>
                              <FuturisticButton variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View Report
                              </FuturisticButton>
                            </Link>
                          )}

                          {hasUnread && (
                            <FuturisticButton
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                conversationMessages.forEach((msg) => {
                                  if (!msg.read) markAsRead(msg._id)
                                })
                              }}
                            >
                              Mark Read
                            </FuturisticButton>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <FuturisticButton variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </FuturisticButton>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this message? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    conversationMessages.forEach((msg) => deleteMessage(msg._id))
                                  }}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                  </GlassCard>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <GlassCard className="text-center py-16" glow>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <MessageCircle className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <CardTitle className="text-2xl mb-4">No Messages Yet</CardTitle>
              <CardDescription className="text-lg max-w-md mx-auto">
                When someone contacts you about your reports, their messages will appear here as conversations.
              </CardDescription>
            </motion.div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
