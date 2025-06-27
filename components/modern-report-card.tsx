"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { FrontendReport } from "@/type"
import { format } from "date-fns"
import { Calendar, CheckCircle, ExternalLink, Eye, Mail, MapPin, MessageCircle, Phone, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ModernReportCardProps {
  report: FrontendReport
  showActions?: boolean
  isOwner?: boolean
  onDelete?: () => void
  onMessage?: () => void
  userRole?: "owner" | "finder" | "anonymous"
  showDeleteButton?: boolean
}

export function ModernReportCard({
  report,
  showActions = true,
  isOwner = false,
  onMessage,
  onDelete,
  showDeleteButton = false,
}: ModernReportCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "resolved":
        return "default"
      case "active":
        return "secondary"
      case "expired":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTypeVariant = (type: string) => {
    return type === "lost" ? "destructive" : "default"
  }

  // Helper function to safely format dates
  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      return format(dateObj, "MMM dd, yyyy")
    } catch {
      return "Unknown date"
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow bg-black border-white/20">
      {/* Status Banner */}
      {report.status === "resolved" && (
        <div className="bg-green-100 dark:bg-green-900/20 border-b p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-green-800 dark:text-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">✅ Successfully returned to owner!</span>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1 text-white">
              {report.brand} - {report.color}
              {report.model && ` (${report.model})`}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant={getTypeVariant(report.type)}>{report.type.toUpperCase()}</Badge>
              <Badge variant={getStatusVariant(report.status)}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-white/60">
                <Calendar className="h-3 w-3" />
                {formatDate(report.dateLostFound)}
              </div>
              <div className="flex items-center gap-1 text-xs text-white/60">
                <Eye className="h-3 w-3" />
                {report.viewCount || 0} views
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Image */}
        {report.imageUrl && (
          <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
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
          <MapPin className="h-4 w-4 text-white/60 flex-shrink-0" />
          <span className="line-clamp-1 text-white">{report.location}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-white/60 line-clamp-3">{report.description}</p>

        {/* User Info - Only show if not owner */}
        {report.user && !isOwner && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-white">{report.user.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-white/60">
                {report.type === "lost" ? "Lost by" : "Found by"}:{" "}
                <strong className="text-white">{report.user.name}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Owner indicator */}
        {isOwner && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">You</span>
              </div>
              <span className="text-white/60">
                <strong className="text-white">Your {report.type} report</strong>
              </span>
            </div>
          </div>
        )}

        {/* Contact Info - Only show if user has permission and not owner */}
        {!isOwner && (report.contactEmail || report.contactPhone) && (
          <>
            <Separator className="bg-white/20" />
            <div className="space-y-2">
              {report.contactEmail && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-white/60" />
                  <a href={`mailto:${report.contactEmail}`} className="text-blue-400 hover:underline">
                    Contact via email
                  </a>
                </div>
              )}
              {report.contactPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-white/60" />
                  <span className="text-white">{report.contactPhone}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        {showActions && (
          <>
            <Separator className="bg-white/20" />
            <div className="flex flex-col gap-2">
              <Link href={`/reports/${report._id}`} className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/30 text-white hover:bg-white hover:text-black bg-transparent"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>

              {/* Message button for all non-owners on active reports */}
              {!isOwner && onMessage && report.status === "active" && (
                <Button size="sm" onClick={onMessage} className="w-full bg-white text-black hover:bg-white/90">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Quick Message
                </Button>
              )}

              {/* Delete button for owners (especially resolved cases) */}
              {showDeleteButton && isOwner && onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Report
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
