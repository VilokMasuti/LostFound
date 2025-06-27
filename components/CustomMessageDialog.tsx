/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, Send, X, AlertTriangle, Phone, User } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import type { Report } from "@/type"

interface CustomMessageDialogProps {
  report: Report
  trigger?: React.ReactNode
  onMessageSent?: () => void
}

export function CustomMessageDialog({ report, trigger, onMessageSent }: CustomMessageDialogProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [senderName, setSenderName] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Safe access to report data
  const safeReportData = {
    _id: report?._id || "",
    brand: report?.brand || "Unknown",
    color: report?.color || "Unknown",
    model: report?.model || "",
    type: report?.type || "lost",
    location: report?.location || "Unknown location",
    description: report?.description || "",
    user: {
      name: report?.user?.name  || "Owner",
      email: report?.user?.email  || "",
    },
  }

  const ownerName = safeReportData.user.name

  const getDefaultMessage = () => {
    if (safeReportData.type === "lost") {
      return `Hi ${ownerName},

I found a ${safeReportData.brand} ${safeReportData.color} phone that might be yours!

Location where I found it: ${safeReportData.location}

Please contact me so we can arrange to return it to you.

Best regards`
    } else {
      return `Hi ${ownerName},

I think the ${safeReportData.brand} ${safeReportData.color} phone you found might be mine!

I lost it near: ${safeReportData.location}

Could we arrange a time to meet so I can verify and collect it?

Thank you so much!

Best regards`
    }
  }

  const validateForm = () => {
    setError(null)

    if (!senderName.trim()) {
      setError("Please enter your name")
      return false
    }

    if (!message.trim()) {
      setError("Please enter a message")
      return false
    }

    if (!contactEmail.trim() && !contactPhone.trim()) {
      setError("Please provide at least your email or phone number")
      return false
    }

    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setError("Please enter a valid email address")
      return false
    }

    return true
  }

  const handleSend = async () => {
    if (!validateForm()) return

    setSending(true)
    setError(null)

    try {
      // Try multiple API endpoints for better compatibility
      const messageData = {
        reportId: safeReportData._id,
        recipientEmail: safeReportData.user.email,
        recipientName: ownerName,
        senderName: senderName.trim(),
        senderEmail: contactEmail.trim(),
        senderPhone: contactPhone.trim(),
        subject: `Message about your ${safeReportData.brand} ${safeReportData.color} phone`,
        message: message.trim(),
        messageType: "contact_owner",
        priority: "high",
        reportDetails: {
          brand: safeReportData.brand,
          color: safeReportData.color,
          model: safeReportData.model,
          location: safeReportData.location,
          type: safeReportData.type,
        },
      }

      console.log("Sending message with data:", messageData)

      // Try the messages API first
      let response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      })

      // If messages API fails, try contact API
      if (!response.ok) {
        console.log("Messages API failed, trying contact API...")
        response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...messageData,
            to: safeReportData.user.email,
            from: contactEmail.trim(),
            name: senderName.trim(),
            phone: contactPhone.trim(),
          }),
        })
      }

      // If both fail, try a simple email API
      if (!response.ok) {
        console.log("Contact API failed, trying email API...")
        response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: safeReportData.user.email,
            subject: `Message about your ${safeReportData.brand} ${safeReportData.color} phone`,
            html: `
              <h2>Someone contacted you about your phone!</h2>
              <p><strong>Phone:</strong> ${safeReportData.brand} ${safeReportData.color}</p>
              <p><strong>Location:</strong> ${safeReportData.location}</p>
              <p><strong>From:</strong> ${senderName.trim()}</p>
              <p><strong>Email:</strong> ${contactEmail.trim()}</p>
              ${contactPhone.trim() ? `<p><strong>Phone:</strong> ${contactPhone.trim()}</p>` : ""}
              <p><strong>Message:</strong></p>
              <p>${message.trim().replace(/\n/g, "<br>")}</p>
            `,
            text: `
Phone: ${safeReportData.brand} ${safeReportData.color}
Location: ${safeReportData.location}
From: ${senderName.trim()}
Email: ${contactEmail.trim()}
${contactPhone.trim() ? `Phone: ${contactPhone.trim()}` : ""}

Message:
${message.trim()}
            `,
          }),
        })
      }

      let responseData
      try {
        responseData = await response.json()
      } catch (e) {
        responseData = {}
      }

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || `HTTP ${response.status}: Failed to send message`)
      }

      toast.success("Message sent successfully! 📨", {
        description: "The owner will receive your message and contact details.",
        duration: 4000,
        style: {
          background: "#111111",
          color: "#FFFFFF",
          border: "1px solid #333333",
        },
      })

      // Call the callback if provided
      if (onMessageSent) {
        onMessageSent()
      }

      // Reset form and close
      setMessage("")
      setContactEmail("")
      setContactPhone("")
      setSenderName("")
      setOpen(false)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to send message"
      setError(errorMessage)

      toast.error(`Failed to send message: ${errorMessage}`, {
        style: {
          background: "#111111",
          color: "#FFFFFF",
          border: "1px solid #333333",
        },
      })
    } finally {
      setSending(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && !message.trim()) {
      setMessage(getDefaultMessage())
    }
    if (!newOpen) {
      setError(null)
    }
  }

  const handleUseTemplate = () => {
    setMessage(getDefaultMessage())
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-gray-900/95 to-black/95 border-white/20 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white text-xl">
            <MessageCircle className="h-6 w-6 text-blue-400" />
            Contact Phone Owner
          </DialogTitle>
        </DialogHeader>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Report Info Card */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="h-5 w-5 text-white/70" />
              <span className="font-medium text-white">
                {safeReportData.brand} {safeReportData.color}
                {safeReportData.model && ` (${safeReportData.model})`}
              </span>
            </div>
            <p className="text-sm text-white/60 flex items-center gap-2">📍 {safeReportData.location}</p>
            <p className="text-sm text-white/60 flex items-center gap-2">
              <User className="h-4 w-4" />
              {safeReportData.type === "lost" ? "Lost by" : "Found by"}: {ownerName}
            </p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Alert className="border-red-500/30 bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sender Information */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Your Information</h3>

            <div className="space-y-2">
              <Label htmlFor="senderName" className="text-white font-medium">
                Your Name *
              </Label>
              <Input
                id="senderName"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-white font-medium">
                  Your Email *
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-white font-medium">
                  Your Phone (Optional)
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="message" className="text-white font-medium">
                Your Message
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUseTemplate}
                className="text-blue-400 hover:text-blue-300 hover:bg-white/10"
              >
                Use Template
              </Button>
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              rows={6}
              className="resize-none bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-white/20 text-white hover:bg-white hover:text-black"
              disabled={sending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !senderName.trim() || (!contactEmail.trim() && !contactPhone.trim())}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sending ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="mr-2"
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
