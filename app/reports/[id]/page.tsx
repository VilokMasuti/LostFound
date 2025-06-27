/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Report } from "@/type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CustomMessageDialog } from "@/components/CustomMessageDialog"
import {
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  Loader2,
  Bell,
  MessageCircle,
  Plus,
  Sparkles,
  User,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

// Custom hooks for better organization
function useReportRole(report: Report | null, user: any) {
  if (!report || !user) {
    return { role: "anonymous", isOwner: false, isFinder: false }
  }

  const isOwner = report.user?._id === user._id || report.userId === user._id
  const isFinder = !isOwner && user._id // Logged in but not owner

  return {
    role: isOwner ? "owner" : isFinder ? "finder" : "anonymous",
    isOwner,
    isFinder,
  }
}

function useReportView(reportId: string) {
  useEffect(() => {
    if (reportId) {
      // Track view count
      fetch(`/api/report/${reportId}/view`, { method: "POST" }).catch(console.error)
    }
  }, [reportId])
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // State management
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolving, setResolving] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  const reportRole = useReportRole(report, user)
  useReportView(params.id as string)

  // Fetch report data with improved error handling
  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string)
    }
  }, [params.id])

  const fetchReport = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/report/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Report not found")
        } else if (response.status === 403) {
          throw new Error("Access denied")
        } else {
          throw new Error(`Error ${response.status}: Failed to load report`)
        }
      }

      const data = await response.json()
      setReport(data)
    } catch (error) {
      console.error("Failed to fetch report:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load report"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkResolved = async () => {
    if (!report || !reportRole.isOwner) return

    const confirmed = confirm("Are you sure you want to mark this phone as returned? This action cannot be undone.")
    if (!confirmed) return

    setResolving(true)

    try {
      const response = await fetch(`/api/report/${report._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "resolved",
          resolvedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || "Failed to update report")
      }

      toast.success("🎉 Phone marked as returned!", {
        description: "Case has been resolved successfully. Redirecting to dashboard...",
        duration: 4000,
        style: {
          background: "#111111",
          color: "#FFFFFF",
          border: "1px solid #333333",
        },
      })

      // Update local state
      setReport((prev) => (prev ? { ...prev, status: "resolved" } : null))

      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard?tab=resolved")
      }, 2000)
    } catch (error) {
      console.error("Error marking as resolved:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to mark as resolved"

      toast.error(errorMessage, {
        style: {
          background: "#111111",
          color: "#FFFFFF",
          border: "1px solid #333333",
        },
      })
    } finally {
      setResolving(false)
    }
  }

  const handleMessageSent = () => {
    setMessageSent(true)
    toast.success("Message sent successfully! 📨", {
      description: "The owner will receive your message and contact details.",
      duration: 4000,
      style: {
        background: "#111111",
        color: "#FFFFFF",
        border: "1px solid #333333",
      },
    })
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="mb-6"
          >
            <Loader2 className="h-16 w-16 text-white mx-auto" />
          </motion.div>
          <p className="text-white text-xl">Loading report details...</p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error || !report) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-900/50 to-black/80 border-white/20 backdrop-blur-sm shadow-xl">
              <CardContent className="py-20 text-center">
                <AlertCircle className="h-24 w-24 text-red-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4 text-white">
                  {error?.includes("not found") ? "Report Not Found" : "Error Loading Report"}
                </h2>
                <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                  {error || "The report you're looking for doesn't exist or has been removed."}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => router.push("/reports")} className="bg-white text-black hover:bg-white/90">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse Reports
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fetchReport(params.id as string)}
                    className="border-white/20 text-white hover:bg-white hover:text-black"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container py-8">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Status Banner */}
          <AnimatePresence>
            {report.status === "resolved" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <Alert className="border-green-400/30 bg-green-900/20 backdrop-blur-sm shadow-xl">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <AlertDescription className="text-green-200 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <strong>Success! This phone has been returned to its owner!</strong>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="bg-gradient-to-br from-gray-900/50 to-black/80 border-white/20 backdrop-blur-sm shadow-2xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <CardTitle className="text-3xl sm:text-4xl mb-4 text-white font-bold">
                      {report.brand} {report.model && `${report.model} `}- {report.color}
                    </CardTitle>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge
                        variant={report.type === "lost" ? "destructive" : "default"}
                        className={
                          report.type === "lost"
                            ? "bg-red-500/20 text-red-300 border-red-400/30"
                            : "bg-green-500/20 text-green-300 border-green-400/30"
                        }
                      >
                        {report.type.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={report.status === "resolved" ? "default" : "secondary"}
                        className={
                          report.status === "resolved"
                            ? "bg-green-500/20 text-green-300 border-green-400/30"
                            : "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                        }
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Eye className="w-4 h-4" />
                        {report.viewCount || 0} views
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(report.dateLostFound), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Image Section */}
                  <div className="space-y-4">
                    {report.imageUrl ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-black/50 border border-white/10">
                        <Image
                          src={report.imageUrl || "/placeholder.svg"}
                          alt={`${report.brand} ${report.color} phone`}
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-800/50 to-black/80 border border-white/10 flex items-center justify-center">
                        <div className="text-center">
                          <Phone className="w-20 h-20 text-white/30 mx-auto mb-4" />
                          <p className="text-white/50 text-lg">No image available</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="space-y-6">
                    {/* Device Details Card */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white">
                          <Phone className="w-5 h-5 text-blue-400" />
                          Device Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Brand:</span>
                          <span className="font-medium text-white">{report.brand}</span>
                        </div>
                        {report.model && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Model:</span>
                            <span className="font-medium text-white">{report.model}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Color:</span>
                          <span className="font-medium text-white">{report.color}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Location & Date Card */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white">
                          <MapPin className="w-5 h-5 text-green-400" />
                          Location & Date
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-white/60 mt-1" />
                          <div>
                            <p className="font-medium text-white">{report.location}</p>
                            <p className="text-sm text-white/60">
                              {report.type === "lost" ? "Last seen here" : "Found at this location"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-white/60" />
                          <div>
                            <p className="font-medium text-white">
                              {format(new Date(report.dateLostFound), "MMMM dd, yyyy")}
                            </p>
                            <p className="text-sm text-white/60">
                              {report.type === "lost" ? "Date lost" : "Date found"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Owner Information Card */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white">
                          <User className="w-5 h-5 text-purple-400" />
                          Owner Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/60">
                          {report.type === "lost" ? "Lost by" : "Found by"}:{" "}
                          <span className="font-medium text-white">
                            {report.user?.name || "Anonymous"}
                          </span>
                        </p>
                      </CardContent>
                    </Card>

                    {/* Description Card */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white">Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70 leading-relaxed">
                          {report.description || "No additional description provided."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Action Section */}
                {report.status === "active" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12"
                  >
                    <Separator className="mb-8 bg-white/10" />

                    {/* Anonymous User */}
                    {reportRole.role === "anonymous" && (
                      <div className="text-center space-y-6">
                        <Alert className="border-blue-400/30 bg-blue-900/20 backdrop-blur-sm">
                          <Bell className="h-5 w-5 text-blue-400" />
                          <AlertDescription className="text-blue-200">
                            Please log in to help return this phone to its owner.
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={() => router.push("/login")}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Log In to Help
                        </Button>
                      </div>
                    )}

                    {/* Owner */}
                    {reportRole.isOwner && (
                      <div className="text-center space-y-6">
                        <Alert className="border-green-400/30 bg-green-900/20 backdrop-blur-sm">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          <AlertDescription className="text-green-200">
                            This is your report. When someone finds your phone and submits a found phone report, you&apos;ll
                            get notified and can contact them.
                          </AlertDescription>
                        </Alert>
                        <div className="flex gap-4 justify-center">
                          <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard")}
                            className="border-white/20 text-white hover:bg-white hover:text-black"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                          </Button>
                          <Button
                            onClick={handleMarkResolved}
                            disabled={resolving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {resolving ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                  className="mr-2"
                                >
                                  <Loader2 className="w-4 h-4" />
                                </motion.div>
                                Resolving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Returned
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Finder - Enhanced Options */}
                    {reportRole.isFinder && (
                      <div className="text-center space-y-8">
                        <Alert className="border-yellow-400/30 bg-yellow-900/20 backdrop-blur-sm">
                          <Bell className="h-5 w-5 text-yellow-400" />
                          <AlertDescription className="text-yellow-200">
                            <strong>Found this phone?</strong> You have two options to help return it to its owner.
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                          {/* Primary Action - Submit Report */}
                          <motion.div whileHover={{ scale: 1.02, y: -4 }} className="relative">
                            <Card className="p-6 border-2 border-blue-400/30 bg-gradient-to-br from-blue-900/20 to-black/60 backdrop-blur-sm">
                              <div className="text-center space-y-4">
                                <div className="p-3 rounded-full bg-blue-500/20 w-fit mx-auto">
                                  <Plus className="h-8 w-8 text-blue-400" />
                                </div>
                                <h4 className="font-bold text-white text-lg">Submit Found Phone Report</h4>
                                <p className="text-white/70">
                                  Fill out a detailed form with photos. The owner will be automatically notified and
                                  matched.
                                </p>
                                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                  <Link href={`/report?type=found&reference=${report._id}`}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Submit Report
                                  </Link>
                                </Button>
                              </div>
                            </Card>
                          </motion.div>

                          {/* Secondary Action - Send Message */}
                          <motion.div whileHover={{ scale: 1.02, y: -4 }} className="relative">
                            <Card className="p-6 border border-white/20 bg-gradient-to-br from-gray-900/50 to-black/80 backdrop-blur-sm">
                              <div className="text-center space-y-4">
                                <div className="p-3 rounded-full bg-white/10 w-fit mx-auto">
                                  <MessageCircle className="h-8 w-8 text-white/70" />
                                </div>
                                <h4 className="font-bold text-white text-lg">Send Quick Message</h4>
                                <p className="text-white/70">
                                  Send a direct message to the owner with your contact information.
                                </p>

                                {messageSent ? (
                                  <Button disabled className="w-full bg-green-600/50 text-green-200 cursor-not-allowed">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Message Sent ✓
                                  </Button>
                                ) : (
                                  <CustomMessageDialog
                                    report={report}
                                    onMessageSent={handleMessageSent}
                                    trigger={
                                      <Button
                                        variant="outline"
                                        className="w-full border-white/20 text-white hover:bg-white hover:text-black bg-transparent"
                                      >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Contact Owner
                                      </Button>
                                    }
                                  />
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-w-md mx-auto">
                          <p className="text-sm text-white/60">
                            <strong className="text-blue-400">💡 Tip:</strong> Submitting a found phone report provides
                            better matching and automatic notifications, but a quick message works too!
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Resolved Status */}
                {report.status === "resolved" && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
                    <Separator className="mb-8 bg-white/10" />
                    <div className="text-center space-y-6">
                      <div className="p-8 bg-gradient-to-br from-green-900/20 to-black/60 rounded-xl border border-green-400/30">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-3 text-white">Phone Successfully Returned!</h3>
                        <p className="text-white/70 text-lg mb-6">
                          This case has been resolved. Thank you to everyone who helped!
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => router.push("/reports")}
                          className="border-white/20 text-white hover:bg-white hover:text-black"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Browse More Reports
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
