"use client"

import { useState, useEffect, useCallback } from "react"
import type { Message } from "@/type"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  Mail,
  MailOpen,
  Trash2,
  Phone,
  ArrowRight,
  User,
  Clock,
  MapPin,
  ExternalLink,
  Search,
  RefreshCw,
  Filter,
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "unread" | "read">("all")

  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setRefreshing(true)

      try {
        const response = await fetch("/api/messages")
        if (response.ok) {
          const data = await response.json()

          // Check for new messages and show notifications (only if not silent initial load)
          if (messages.length > 0 && !silent) {
            const newMessages = data.filter(
              (msg: Message) => !messages.find((existing) => existing._id === msg._id) && !msg.read,
            )

            newMessages.forEach((msg: Message) => {
              toast.success("📩 New message received!", {
                description: `From ${msg.from.name} about ${msg.report?.brand} ${msg.report?.color}`,
                duration: 10000,
                action: {
                  label: "View",
                  onClick: () => {
                    window.location.reload()
                  },
                },
              })
            })
          }

          // Check for new messages in silent mode and show subtle notification
          if (silent && messages.length > 0) {
            const newMessages = data.filter(
              (msg: Message) => !messages.find((existing) => existing._id === msg._id) && !msg.read,
            )

            if (newMessages.length > 0) {
              document.title = `(${newMessages.length}) New Messages - LostFormed`
              toast.info(`📬 ${newMessages.length} new message${newMessages.length > 1 ? "s" : ""} received`, {
                duration: 5000,
              })
            }
          }

          setMessages(data)
        } else {
          if (!silent) toast.error("Failed to load messages")
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
        if (!silent) toast.error("Failed to load messages")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [messages.length],
  )

  useEffect(() => {
    fetchMessages()

    // Set up real-time polling for new messages
    const interval = setInterval(() => {
      fetchMessages(true) // Silent fetch for real-time updates
    }, 15000) // Check every 15 seconds

    return () => clearInterval(interval)
  }, [fetchMessages])

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

  // Filter messages
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.report?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.report?.color?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterType === "all" || (filterType === "unread" && !message.read) || (filterType === "read" && message.read)

    return matchesSearch && matchesFilter
  })

  const unreadCount = messages.filter((msg) => !msg.read).length
  const readCount = messages.filter((msg) => msg.read).length

  // Update browser title with unread count
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Messages - LostFormed`
    } else {
      document.title = "Messages - LostFormed"
    }
  }, [unreadCount])

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Messages</h1>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-lg px-3 py-1 animate-pulse bg-red-600 text-white">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Chat with people about found phones</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMessages()}
            disabled={refreshing}
            className="border-border/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border/50">
                <Filter className="h-4 w-4 mr-2" />
                {filterType === "all" ? "All" : filterType === "unread" ? "Unread" : "Read"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType("all")}>All Messages ({messages.length})</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("unread")}>Unread ({unreadCount})</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("read")}>Read ({readCount})</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-background">
              All ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="data-[state=active]:bg-background">
              Unread ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read" className="data-[state=active]:bg-background">
              Read ({readCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="space-y-4 max-w-4xl mx-auto">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-card border-border/50">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-1/3 rounded bg-muted" />
                          <div className="h-3 w-1/2 rounded bg-muted" />
                          <div className="h-16 rounded bg-muted" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredMessages.length > 0 ? (
              <div className="space-y-4 max-w-4xl mx-auto">
                {filteredMessages.map((message) => (
                  <Card
                    key={message._id}
                    className={`transition-all hover:shadow-lg bg-card border-border/50 ${
                      !message.read ? "ring-2 ring-primary/20 bg-primary/5 shadow-md" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Avatar */}
                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                            {message.from.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-foreground">{message.from.name}</h3>
                                {!message.read && (
                                  <Badge variant="destructive" className="text-xs animate-pulse bg-red-600 text-white">
                                    NEW
                                  </Badge>
                                )}
                                {message.messageType === "match_notification" && (
                                  <Badge variant="default" className="text-xs bg-green-600 text-white">
                                    🎯 Match Found!
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </div>
                                {message.report && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {message.report.brand} {message.report.color}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              {!message.read && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markAsRead(message._id)}
                                  className="border-border/50"
                                >
                                  <MailOpen className="h-4 w-4" />
                                </Button>
                              )}

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="border-border/50">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this message? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMessage(message._id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          {/* Subject */}
                          {message.subject && (
                            <div className="mb-3">
                              <h4 className="font-medium text-base text-primary">{message.subject}</h4>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div className="bg-muted/50 rounded-2xl p-4 mb-4 border-l-4 border-primary/30">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                              {message.message}
                            </p>
                          </div>

                          {/* Contact Information - Enhanced with Phone */}
                          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <User className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-blue-800 dark:text-blue-200">
                                Contact {message.from.name}
                              </span>
                            </div>
                            <div className="space-y-3">
                              {/* Email Contact */}
                              <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-foreground">{message.from.email}</span>
                                </div>
                                <Button size="sm" asChild>
                                  <a href={`mailto:${message.from.email}`} className="flex items-center gap-1">
                                    Send Email
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </Button>
                              </div>

                              {/* Phone Contact - if available */}
                              {message.report?.contactPhone && (
                                <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-foreground">{message.report.contactPhone}</span>
                                  </div>
                                  <Button size="sm" asChild variant="outline">
                                    <a href={`tel:${message.report.contactPhone}`} className="flex items-center gap-1">
                                      Call Now
                                      <Phone className="w-3 h-3" />
                                    </a>
                                  </Button>
                                </div>
                              )}

                              <p className="text-blue-700 dark:text-blue-300 text-sm text-center">
                                📞 Contact {message.from.name} directly to coordinate the phone return
                              </p>
                            </div>
                          </div>

                          {/* Report Context */}
                          {message.report && (
                            <div className="border rounded-lg p-4 bg-muted/20 border-border/50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium mb-1 text-foreground">About this phone:</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="capitalize font-medium">
                                      {message.report.type}: {message.report.brand} {message.report.color}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {message.report.location}
                                    </div>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" asChild className="border-border/50">
                                  <Link href={`/reports/${message.report._id}`}>
                                    View Report
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto bg-card border-border/50">
                <CardContent className="py-16 text-center">
                  <MessageCircle className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-4 text-foreground">
                    {searchTerm ? "No Messages Found" : "No Messages Yet"}
                  </h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto mb-6">
                    {searchTerm
                      ? `No messages match "${searchTerm}". Try a different search term.`
                      : "When someone contacts you about found phones, their messages will appear here with their contact information."}
                  </p>
                  {!searchTerm && (
                    <Button asChild>
                      <Link href="/reports">
                        Browse Reports
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-6">
            {messages.filter((m) => !m.read).length > 0 ? (
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages
                  .filter((m) => !m.read)
                  .map((message) => (
                    <Card
                      key={message._id}
                      className="transition-all hover:shadow-lg bg-card border-border/50 ring-2 ring-primary/20 bg-primary/5 shadow-md"
                    >
                      {/* Same message content as above */}
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Avatar className="w-12 h-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                              {message.from.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg text-foreground">{message.from.name}</h3>
                                  <Badge variant="destructive" className="text-xs animate-pulse bg-red-600 text-white">
                                    NEW
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markAsRead(message._id)}
                                  className="border-border/50"
                                >
                                  <MailOpen className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {message.subject && (
                              <div className="mb-3">
                                <h4 className="font-medium text-base text-primary">{message.subject}</h4>
                              </div>
                            )}
                            <div className="bg-muted/50 rounded-2xl p-4 mb-4 border-l-4 border-primary/30">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto bg-card border-border/50">
                <CardContent className="py-16 text-center">
                  <MailOpen className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-4 text-foreground">All Caught Up!</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    You have no unread messages. Great job staying on top of your communications!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="read" className="mt-6">
            {messages.filter((m) => m.read).length > 0 ? (
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages
                  .filter((m) => m.read)
                  .map((message) => (
                    <Card
                      key={message._id}
                      className="transition-all hover:shadow-lg bg-card border-border/50 opacity-75"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Avatar className="w-12 h-12 border-2 border-muted">
                            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                              {message.from.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg text-foreground">{message.from.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    READ
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {message.subject && (
                              <div className="mb-3">
                                <h4 className="font-medium text-base text-muted-foreground">{message.subject}</h4>
                              </div>
                            )}
                            <div className="bg-muted/30 rounded-2xl p-4 mb-4 border-l-4 border-muted">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card className="max-w-2xl mx-auto bg-card border-border/50">
                <CardContent className="py-16 text-center">
                  <Mail className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                  <h2 className="text-2xl font-bold mb-4 text-foreground">No Read Messages</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Messages you&apos;ve read will appear here for easy reference.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
