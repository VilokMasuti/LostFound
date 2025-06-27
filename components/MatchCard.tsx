"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ContactModal } from "./ContactModal"
import { Phone, MapPin, Calendar, CheckCircle, Clock, Sparkles } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface MatchCardProps {
  match: {
    _id: string
    similarity: number
    confidence: string
    status: "pending" | "confirmed" | "rejected"
    createdAt: string
    report: any // The user's report (lost)
    matchedReport: any // The matched report (found)
  }
  userRole: "owner" | "finder" // owner = lost phone owner, finder = found phone reporter
  onConfirm?: (matchId: string) => void
  onResolve?: (matchId: string, reportId: string) => void
}

export function MatchCard({ match, userRole, onConfirm, onResolve }: MatchCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [resolving, setResolving] = useState(false)

  const handleConfirm = async () => {
    if (!onConfirm) return
    setConfirming(true)
    try {
      await onConfirm(match._id)
    } finally {
      setConfirming(false)
    }
  }

  const handleResolve = async () => {
    if (!onResolve) return
    setResolving(true)
    try {
      await onResolve(match._id, match.report._id)
    } finally {
      setResolving(false)
    }
  }

  // Determine which report to show based on user role
  const displayReport = userRole === "owner" ? match.matchedReport : match.report
  const contactReport = userRole === "owner" ? match.matchedReport : match.report

  return (
    <Card
      className={`${
        match.status === "pending"
          ? "ring-2 ring-yellow-200 dark:ring-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10"
          : match.status === "confirmed"
            ? "ring-2 ring-green-200 dark:ring-green-800 bg-green-50/50 dark:bg-green-900/10"
            : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            {userRole === "owner" ? "Found Phone Match!" : "Lost Phone Match!"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
              {Math.round(match.similarity * 100)}% Match
            </Badge>
            <Badge
              variant={match.status === "confirmed" ? "default" : match.status === "pending" ? "secondary" : "outline"}
              className={
                match.status === "pending"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
                  : match.status === "confirmed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                    : ""
              }
            >
              {match.status === "pending"
                ? "Needs Confirmation"
                : match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Phone Details */}
        <div className="flex gap-4">
          {displayReport.imageUrl && (
            <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={displayReport.imageUrl || "/placeholder.svg"}
                alt={`${displayReport.brand} ${displayReport.color}`}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">
              {displayReport.brand} {displayReport.color}
              {displayReport.model && <span className="text-muted-foreground"> ({displayReport.model})</span>}
            </h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{displayReport.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(displayReport.dateLostFound), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>
                  {userRole === "owner" ? "Found" : "Lost"} by {displayReport.user.name}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{displayReport.description}</p>
          </div>
        </div>

        {/* Actions based on status and user role */}
        <div className="flex gap-3 pt-4 border-t">
          {match.status === "pending" && userRole === "owner" && (
            <>
              <Button onClick={handleConfirm} disabled={confirming} className="flex-1">
                {confirming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Yes, This Is My Phone!
                  </>
                )}
              </Button>
              <Button
                onClick={handleResolve}
                disabled={resolving}
                variant="default"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {resolving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm & Mark Returned
                  </>
                )}
              </Button>
            </>
          )}

          {match.status === "pending" && userRole === "finder" && (
            <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Waiting for owner confirmation</p>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                The owner needs to confirm this is their phone before you can proceed.
              </p>
            </div>
          )}

          {/* Contact Button - Always available */}
          <ContactModal
            trigger={
              <Button variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                Contact {userRole === "owner" ? "Finder" : "Owner"}
              </Button>
            }
            reportData={contactReport}
            userRole={userRole}
          />
        </div>

        {/* Status Messages */}
        {match.status === "confirmed" && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Match Confirmed!</p>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              You can now contact each other to arrange the return. Don't forget to mark as returned once complete.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
