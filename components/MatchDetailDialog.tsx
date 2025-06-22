"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GlassCard } from "@/components/ui/glass-card"
import { FuturisticButton } from "@/components/ui/futuristic-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Phone, MapPin, Calendar, User, CheckCircle, XCircle, Sparkles, Mail } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"

interface MatchDetailDialogProps {
  matchId: string
  onMatchUpdate?: () => void
  trigger: React.ReactNode
}

interface MatchData {
  _id: string
  similarity: number
  confidence: string
  status: string
  createdAt: string
  report: {
    _id: string
    brand: string
    color: string
    model?: string
    type: string
    location: string
    description: string
    dateLostFound: string
    imageUrl?: string
    contactEmail?: string
    contactPhone?: string
    user: {
      _id: string
      name: string
      email: string
    }
  } | null
  matchedReport: {
    _id: string
    brand: string
    color: string
    model?: string
    type: string
    location: string
    description: string
    dateLostFound: string
    imageUrl?: string
    contactEmail?: string
    contactPhone?: string
    user: {
      _id: string
      name: string
      email: string
    }
  } | null
}

export function MatchDetailDialog({ matchId, onMatchUpdate, trigger }: MatchDetailDialogProps) {
  const { user } = useAuth()
  const [match, setMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && matchId) {
      console.log("🔍 Loading match details for:", matchId)
      fetchMatchDetails()
    }
  }, [open, matchId])

  const fetchMatchDetails = async () => {
    setLoading(true)
    try {
      console.log("📡 Fetching match details...")
      const response = await fetch(`/api/matches/${matchId}`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Match details loaded:", data)
        setMatch(data)
      } else {
        const error = await response.json()
        console.error("❌ Failed to load match:", error)
        toast.error("Failed to load match details")
      }
    } catch (error) {
      console.error("❌ Network error:", error)
      toast.error("Network error loading match details")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmMatch = async (confirmed: boolean) => {
    if (!match) {
      console.error("❌ No match data available")
      return
    }

    console.log(`🔄 ${confirmed ? "Confirming" : "Rejecting"} match:`, matchId)
    setUpdating(true)

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: confirmed ? "confirmed" : "rejected",
          notes: confirmed ? "Match confirmed by user" : "Match rejected by user",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Match updated successfully:", result)

        if (confirmed) {
          toast.success("🎉 Match confirmed! Both reports have been marked as resolved.", {
            duration: 5000,
          })
          setTimeout(() => {
            toast.success("✅ Case successfully closed! Thank you for using LostFormed.", {
              duration: 4000,
            })
          }, 1000)
        } else {
          toast.success("Match rejected. We'll keep looking for other matches.")
        }

        // Update local state
        setMatch((prev) => (prev ? { ...prev, status: confirmed ? "confirmed" : "rejected" } : null))

        // Close dialog and refresh parent
        setTimeout(() => {
          setOpen(false)
          onMatchUpdate?.()
        }, 1500)
      } else {
        const error = await response.json()
        console.error("❌ Failed to update match:", error)
        toast.error(error.message || "Failed to update match")
      }
    } catch (error) {
      console.error("❌ Network error updating match:", error)
      toast.error("Network error occurred")
    } finally {
      setUpdating(false)
    }
  }

  // Determine which report belongs to the current user
  const userReport = match
    ? match.report?.user?.email === user?.email
      ? match.report
      : match.matchedReport
    : null
  const otherReport = match
    ? match.report?.user?.email === user?.email
      ? match.matchedReport
      : match.report
    : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {match?.status === "pending" ? "Review This Match" : "Match Details"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-muted-foreground">Loading match details...</span>
          </div>
        ) : match ? (
          <div className="space-y-6">
            {/* Match Info */}
            <GlassCard className="p-6" glow>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Match Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Found on {format(new Date(match.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <Badge
                  className={
                    match.status === "confirmed"
                      ? "bg-green-500 text-white"
                      : match.status === "pending"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                  }
                >
                  {match.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{Math.round(match.similarity * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Similarity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary capitalize">{match.confidence}</div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {userReport?.type === "lost" ? "Found" : "Lost"}
                  </div>
                  <div className="text-sm text-muted-foreground">Match Type</div>
                </div>
              </div>
            </GlassCard>

            {/* Question for user */}
            {match.status === "pending" && (
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold mb-2">Is this your phone?</h2>
                <p className="text-muted-foreground">
                  Please review the details below and confirm if this matches your {userReport?.type} phone.
                </p>
              </div>
            )}

            {/* Your Report vs Matched Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your Report */}
              {userReport && (
                <GlassCard className="p-6" glow>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Your Report ({userReport.type === "lost" ? "Lost" : "Found"})
                  </h3>

                  {userReport.imageUrl && (
                    <div className="relative h-40 w-full rounded-md overflow-hidden mb-4">
                      <Image
                        src={userReport.imageUrl || "/placeholder.svg"}
                        alt={`${userReport.brand} ${userReport.color} phone`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-lg">
                        {userReport.brand} - {userReport.color}
                        {userReport.model && ` (${userReport.model})`}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{userReport.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(userReport.dateLostFound), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">{userReport.description}</p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Matched Report */}
              {otherReport && (
                <GlassCard className="p-6" glow>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-500" />
                    Matched Report ({otherReport.type === "lost" ? "Lost" : "Found"})
                  </h3>

                  {otherReport.imageUrl && (
                    <div className="relative h-40 w-full rounded-md overflow-hidden mb-4">
                      <Image
                        src={otherReport.imageUrl || "/placeholder.svg"}
                        alt={`${otherReport.brand} ${otherReport.color} phone`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-lg">
                        {otherReport.brand} - {otherReport.color}
                        {otherReport.model && ` (${otherReport.model})`}
                      </h4>
                      <p className="text-sm text-muted-foreground">Reported by {otherReport.user.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{otherReport.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(otherReport.dateLostFound), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">{otherReport.description}</p>
                    </div>

                    {/* Contact Info - Only show if match is confirmed */}
                    {match.status === "confirmed" && (
                      <div className="pt-4 border-t">
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Contact Information
                        </h5>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Email:</strong> {otherReport.user.email}
                          </p>
                          {otherReport.contactPhone && (
                            <p>
                              <strong>Phone:</strong> {otherReport.contactPhone}
                            </p>
                          )}
                          {otherReport.contactEmail && otherReport.contactEmail !== otherReport.user.email && (
                            <p>
                              <strong>Alt Email:</strong> {otherReport.contactEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Action Buttons */}
            {match.status === "pending" && (
              <>
                <Separator />
                <div className="flex gap-4 justify-center py-4">
                  <FuturisticButton
                    variant="glow"
                    size="lg"
                    onClick={() => handleConfirmMatch(true)}
                    disabled={updating}
                    className="min-w-[200px]"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {updating ? "Confirming..." : "Yes, This Is My Phone!"}
                  </FuturisticButton>
                  <FuturisticButton
                    variant="outline"
                    size="lg"
                    onClick={() => handleConfirmMatch(false)}
                    disabled={updating}
                    className="min-w-[200px]"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    {updating ? "Rejecting..." : "Not My Phone"}
                  </FuturisticButton>
                </div>
              </>
            )}

            {/* Confirmed Status */}
            {match.status === "confirmed" && (
              <>
                <Separator />
                <div className="text-center py-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-green-600">Match Confirmed!</h3>
                  <p className="text-muted-foreground mb-4">
                    This case has been successfully resolved. Both reports have been marked as resolved.
                  </p>
                  <p className="text-sm text-green-600 font-medium">
                    Contact information is now available above to arrange the return.
                  </p>
                </div>
              </>
            )}

            {/* Rejected Status */}
            {match.status === "rejected" && (
              <>
                <Separator />
                <div className="text-center py-6">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-red-600">Match Rejected</h3>
                  <p className="text-muted-foreground">
                    This was not the correct phone. We&apos;ll continue looking for other matches.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load match details</p>
            <FuturisticButton variant="outline" onClick={fetchMatchDetails} className="mt-4">
              Try Again
            </FuturisticButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
