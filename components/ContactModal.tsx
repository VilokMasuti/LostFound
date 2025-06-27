"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Send, Loader2, Check } from "lucide-react"

interface ContactModalProps {
  trigger: React.ReactNode
  reportData: {
    _id: string
    brand: string
    color: string
    model?: string
    location: string
    type: "lost" | "found"
    user: {
      name: string
      email: string
    }
  }
  userRole: "owner" | "finder"
  onMessageSent?: () => void
}

export function ContactModal({ trigger, reportData, userRole, onMessageSent }: ContactModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [formData, setFormData] = useState({
    subject: `Regarding ${reportData.brand} ${reportData.color}`,
    message: "",
    contactEmail: "",
    contactPhone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const messageContent = formData.message || getDefaultMessage()

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: reportData._id,
          subject: formData.subject,
          message: messageContent,
          messageType: "match_contact",
          priority: "high",
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send message")
      }

      setMessageSent(true)
      toast.success("Message sent successfully!", {
        style: { background: "#000000", color: "#FFFFFF", border: "1px solid #FFFFFF" },
        icon: <Check className="w-4 h-4" />,
      })

      // Call the callback to update parent state
      if (onMessageSent) {
        onMessageSent()
      }

      // Close modal after short delay
      setTimeout(() => {
        setIsOpen(false)
        // Reset form for next time
        setTimeout(() => {
          setMessageSent(false)
          setFormData({
            subject: `Regarding ${reportData.brand} ${reportData.color}`,
            message: "",
            contactEmail: "",
            contactPhone: "",
          })
        }, 500)
      }, 1500)
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error(error instanceof Error ? error.message : "Failed to send message", {
        style: { background: "#000000", color: "#FFFFFF", border: "1px solid #FFFFFF" },
      })
    } finally {
      setSending(false)
    }
  }

  const getDefaultMessage = () => {
    const otherUserName = reportData.user.name
    const deviceInfo = `${reportData.brand} ${reportData.color}`

    if (userRole === "owner") {
      return `Hi ${otherUserName},

I believe you found my ${deviceInfo} that I lost.

Could we arrange a time to meet so I can get it back? I'm available at your convenience.

Thank you so much for finding it!

Best regards,`
    } else {
      return `Hi ${otherUserName},

I found a ${deviceInfo} and I believe it might be yours based on your lost report.

Could we arrange a time to meet so I can return it to you? I'm available at your convenience.

Looking forward to helping you get your device back!

Best regards,`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-black border-2 border-white text-white max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Contact {userRole === "owner" ? "Finder" : "Owner"}</DialogTitle>
        </DialogHeader>

        {messageSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
            >
              <Check className="w-16 h-16 mx-auto text-white mb-4" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
            <p className="text-white/70">
              Your message has been sent to {reportData.user.name}. They'll be able to contact you back.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Device Info */}
            <div className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm font-medium text-white">
                {reportData.type === "lost" ? "Lost" : "Found"}: {reportData.brand} {reportData.color}
              </p>
              <p className="text-xs text-white/70">Location: {reportData.location}</p>
              <p className="text-xs text-white/70">Contact: {reportData.user.name}</p>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject" className="text-white">
                Subject
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="bg-black border-white/20 text-white focus:border-white"
                required
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="message" className="text-white">
                Message
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={getDefaultMessage()}
                className="bg-black border-white/20 text-white focus:border-white min-h-[120px]"
                required
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="contactEmail" className="text-white">
                  Your Email (optional)
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="bg-black border-white/20 text-white focus:border-white"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone" className="text-white">
                  Your Phone (optional)
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="bg-black border-white/20 text-white focus:border-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-white/20 text-white hover:bg-white hover:text-black"
              >
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button type="submit" disabled={sending} className="w-full bg-white text-black hover:bg-white/90">
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
