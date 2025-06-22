"use client"

import type { Report, Match } from "@/type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Mail, Phone, Eye, CheckCircle, AlertCircle, ExternalLink, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"
import { FuturisticButton } from "./ui/futuristic-button"
import Link from "next/link"
import { SimpleMessageDialog } from "./SimpleMessageDialog"
import { useReportRole } from "@/hooks/useUserRole"

interface ReportCardProps {
  report: Report
  onViewDetails?: (report: Report) => void
  showActions?: boolean
  onDelete?: (reportId: string) => void
  matches?: Match[]
  isOwner?: boolean
}

export function ReportCard({
  report,
  onViewDetails,
  showActions,
  onDelete,
  matches = [],
  isOwner = false,
}: ReportCardProps) {
  const [isMarkingResolved, setIsMarkingResolved] = useState(false)
  const reportRole = useReportRole(report)

  const hasMatches = matches.length > 0
  const isMatched = hasMatches && matches.some((m) => m.status === "confirmed")
  const isPending = hasMatches && matches.some((m) => m.status === "pending")

  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return phone
    return "*".repeat(phone.length - 4) + phone.slice(-4)
  }

  const handleMarkAsResolved = async () => {
    setIsMarkingResolved(true)
    try {
      const response = await fetch(`/api/reports/${report._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      })

      if (response.ok) {
        toast.success("🎉 Case marked as resolved! Thank you for using LostFormed.", { duration: 5000 })
        window.location.reload()
      } else {
        toast.error("Failed to mark as resolved")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsMarkingResolved(false)
    }
  }

  const getStatusBadge = () => {
    if (report.status === "resolved") {
      return <Badge className="bg-green-500 text-white">✅ Resolved</Badge>
    }
    if (isMatched) {
      return <Badge className="bg-green-500 text-white">✅ Matched</Badge>
    }
    if (isPending) {
      return <Badge className="bg-yellow-500 text-white">⏳ Match Pending</Badge>
    }
    return <Badge variant={report.type === "lost" ? "destructive" : "default"}>{report.type.toUpperCase()}</Badge>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        className={`h-full transition-all duration-200 hover:shadow-lg ${
          report.status === "resolved"
            ? "border-green-500 shadow-green-500/20 shadow-lg"
            : isMatched
              ? "border-green-500 shadow-green-500/20 shadow-lg"
              : isPending
                ? "border-yellow-500 shadow-yellow-500/20 shadow-lg"
                : "hover:shadow-lg"
        }`}
      >
        {/* Match Status Banner - Only for owners */}
        {hasMatches && reportRole.role === "owner" && report.status !== "resolved" && (
          <div
            className={`p-3 text-center text-sm font-medium ${
              isMatched ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
            }`}
          >
            {isMatched ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />🎉 Great news! We found a match for your {report.type} phone!
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />🎯 Potential match found - review it now!
              </div>
            )}
          </div>
        )}

        {/* Resolved Status Banner */}
        {report.status === "resolved" && (
          <div className="bg-green-500 text-white p-3 text-center text-sm font-medium">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />✅ This issue has been resolved! Phone successfully returned.
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">
                {report.brand} - {report.color}
                {report.model && ` (${report.model})`}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {getStatusBadge()}
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(report.dateLostFound), "MMM dd, yyyy")}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {report.viewCount || 0} views
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Image */}
          {report.imageUrl && (
            <div className="relative h-32 w-full rounded-md overflow-hidden">
              <Image
                src={report.imageUrl || "/placeholder.svg"}
                alt={`${report.brand} ${report.color} phone`}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{report.location}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>

          {/* Contact Info - Role-based visibility */}
          {reportRole.role === "finder" && (report.contactEmail || report.contactPhone) && (
            <div className="space-y-2">
              {report.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${report.contactEmail}`} className="text-primary hover:underline">
                    Contact via email
                  </a>
                </div>
              )}
              {report.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{maskPhone(report.contactPhone)}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions - Role-based rendering */}
          <div className="flex gap-2 pt-2">
            {/* View Full Details Button */}
            <Link href={`/reports/${report._id}`} className="flex-1">
              <FuturisticButton variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Full Details
              </FuturisticButton>
            </Link>

            {/* Message Button - Only for finders */}
            {reportRole.canMessage && (
              <SimpleMessageDialog
                report={report}
                defaultMessage={`Hi! I ${report.type === "lost" ? "found" : "lost"} a phone that matches your description. Please contact me so we can arrange the return.`}
                trigger={
                  <FuturisticButton variant="glow" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {report.type === "lost" ? "I Found This!" : "This Is Mine!"}
                  </FuturisticButton>
                }
              />
            )}

            {/* Owner Actions */}
            {reportRole.role === "owner" && isMatched && report.status === "active" && (
              <FuturisticButton
                variant="glow"
                size="sm"
                onClick={handleMarkAsResolved}
                disabled={isMarkingResolved}
                className="flex-1"
              >
                {isMarkingResolved ? "Marking..." : "Mark as Resolved"}
              </FuturisticButton>
            )}

            {/* Delete Button for Owner */}
            {showActions && onDelete && report.status !== "resolved" && reportRole.canDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(report._id)}>
                Delete
              </Button>
            )}
          </div>

          {/* Match Information for Owner */}
          {hasMatches && reportRole.role === "owner" && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Match Details:</h4>
              {matches.map((match) => (
                <div key={match._id} className="text-xs text-muted-foreground">
                  Similarity: {Math.round(match.similarity * 100)}% • Status: {match.status} • Confidence:{" "}
                  {match.confidence}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
