"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Report } from "@/type"
import { GlassCard } from "@/components/ui/glass-card"
import { FuturisticButton } from "@/components/ui/futuristic-button"
import { FloatingParticles } from "@/components/ui/floating-particles"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SimpleMessageDialog } from "@/components/SimpleMessageDialog"
import { Phone, MapPin, Calendar, User, Mail, ArrowLeft, CheckCircle, AlertCircle, Eye, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { toast } from "sonner"
import { useReportRole } from "@/hooks/useUserRole"
import { useReportView } from "@/hooks/useReportView"
import Image from "next/image"

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewCount, setViewCount] = useState(0)

  const reportRole = useReportRole(report)

  // Record view when component mounts
  useReportView(params.id as string)

  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string)
    }
  }, [params.id])

  const fetchReport = async (id: string) => {
    try {
      const response = await fetch(`/api/report/${id}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
        setViewCount(data.viewCount || 0)
      } else {
        setError("Report not found")
      }
    } catch (error) {
      console.error("Failed to fetch report:", error)
      setError("Failed to load report")
    } finally {
      setLoading(false)
    }
  }

  const handleFoundThis = () => {
    if (reportRole.role === "anonymous") {
      toast.error("Please log in to report a match")
      router.push("/login")
      return
    }

    toast.success("Great! Please send a message to the owner with details about where you found it.")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900" />
        <FloatingParticles count={20} />

        <div className="container mx-auto px-4 py-24 relative z-10">
          <GlassCard className="text-center py-16 max-w-2xl mx-auto" glow>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <AlertCircle className="h-24 w-24 text-destructive mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
              <p className="text-muted-foreground mb-8">
                The report you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <FuturisticButton onClick={() => router.push("/reports")} variant="glow">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </FuturisticButton>
            </motion.div>
          </GlassCard>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500"
      case "active":
        return "bg-blue-500"
      case "expired":
        return "bg-gray-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900" />

      {/* Floating Particles */}
      <FloatingParticles count={30} />

      <div className="container mx-auto px-4 py-24 relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <FuturisticButton variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </FuturisticButton>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <GlassCard className="overflow-hidden" glow>
              {/* Header */}
              <div className="p-8 pb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">
                      {report.brand} {report.model && `${report.model} `}- {report.color}
                    </h1>
                    <div className="flex items-center gap-4">
                      <Badge variant={report.type === "lost" ? "destructive" : "default"} className="text-sm px-3 py-1">
                        {report.type.toUpperCase()}
                      </Badge>
                      <Badge className={`${getStatusColor(report.status)} text-white text-sm px-3 py-1`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {viewCount} views
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Banner for Resolved Reports */}
                {report.status === "resolved" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500 text-white p-4 rounded-lg mb-6 flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      ✅ Great news! This phone has been successfully returned to its owner!
                    </span>
                  </motion.div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 pt-0">
                {/* Image Section */}
                <div className="space-y-4">
                  {report.imageUrl ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                      className="relative aspect-square rounded-xl overflow-hidden bg-muted"
                    >
                      <Image
                        src={report.imageUrl || "/placeholder.svg"}
                        alt={`${report.brand} ${report.color} phone`}
                        fill
                        className="object-cover"
                        priority
                      />
                    </motion.div>
                  ) : (
                    <div className="aspect-square rounded-xl bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No image available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      Device Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brand:</span>
                        <span className="font-medium">{report.brand}</span>
                      </div>
                      {report.model && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Model:</span>
                          <span className="font-medium">{report.model}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Color:</span>
                        <span className="font-medium">{report.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge variant="outline" className="capitalize">
                          {report.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Location & Date
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">{report.location}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.type === "lost" ? "Last seen here" : "Found at this location"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{format(new Date(report.dateLostFound), "MMMM dd, yyyy")}</p>
                          <p className="text-sm text-muted-foreground">
                            {report.type === "lost" ? "Date lost" : "Date found"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{report.description}</p>
                  </div>

                  {/* Contact Information - Role-based visibility */}
                  {reportRole.role === "finder" && (report.contactEmail || report.contactPhone) && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-primary" />
                          Contact Information
                        </h3>
                        <div className="space-y-2">
                          {report.contactEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <a href={`mailto:${report.contactEmail}`} className="text-primary hover:underline">
                                Send Email
                              </a>
                            </div>
                          )}
                          {report.contactPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{report.contactPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons - Role-based rendering */}
              {report.status === "active" && (
                <div className="p-8 pt-0">
                  <Separator className="mb-6" />
                  <div className="flex gap-4 justify-center">
                    {reportRole.role === "finder" ? (
                      <>
                        <FuturisticButton
                          variant="glow"
                          size="lg"
                          onClick={handleFoundThis}
                          className="flex-1 max-w-xs"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          {report.type === "lost" ? "I Found This Phone!" : "This Is My Phone!"}
                        </FuturisticButton>
                        {reportRole.canMessage && (
                          <SimpleMessageDialog
                            report={report}
                            defaultMessage={`Hi! I ${report.type === "lost" ? "found" : "lost"} a phone that matches your description. Please contact me so we can arrange the return.`}
                            trigger={
                              <FuturisticButton variant="outline" size="lg" className="flex-1 max-w-xs">
                                <Mail className="w-5 h-5 mr-2" />
                                Send Message
                              </FuturisticButton>
                            }
                          />
                        )}
                      </>
                    ) : reportRole.role === "owner" ? (
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">This is your report</p>
                        <FuturisticButton variant="outline" onClick={() => router.push("/dashboard")}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Dashboard
                        </FuturisticButton>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-muted-foreground mb-4">Please log in to contact the owner</p>
                        <FuturisticButton variant="glow" onClick={() => router.push("/login")}>
                          Log In to Help
                        </FuturisticButton>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Resolved Status */}
              {report.status === "resolved" && (
                <div className="p-8 pt-0">
                  <Separator className="mb-6" />
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Phone Successfully Returned!</h3>
                    <p className="text-muted-foreground mb-6">
                      This case has been resolved. Thank you to everyone who helped!
                    </p>
                    <FuturisticButton variant="outline" onClick={() => router.push("/reports")}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Browse More Reports
                    </FuturisticButton>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
