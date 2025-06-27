/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, MapPin, Calendar, User, CheckCircle, XCircle, Sparkles, Mail, Loader2, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"

interface ModernMatchDialogProps {
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
  reportId: string
  matchedReportId: string
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
    userId: {
      _id: string
      name: string
      email: string
    }
  }
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
    userId: {
      _id: string
      name: string
      email: string
    }
  }
}

export function ModernMatchDialog({ matchId, onMatchUpdate, trigger }: ModernMatchDialogProps) {
  const { user } = useAuth()
  const [match, setMatch] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && matchId) {
      fetchMatchDetails()
    }
  }, [open, matchId])

  const fetchMatchDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/matches/${matchId}`)
      if (response.ok) {
        const data = await response.json()
        setMatch(data)
      } else {
        toast.error("Failed to load match details")
      }
    } catch (error) {
      toast.error("Network error loading match details")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmMatch = async (confirmed: boolean) => {
    if (!match) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/matches/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId: match._id,
          confirmed,
        }),
      })

      if (response.ok) {
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

        setMatch((prev) => (prev ? { ...prev, status: confirmed ? "confirmed" : "rejected" } : null))

        setTimeout(() => {
          setOpen(false)
          onMatchUpdate?.()
        }, 1500)
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update match")
      }
    } catch (error) {
      toast.error("Network error occurred")
    } finally {
      setUpdating(false)
    }
  }

  // Determine which report belongs to the current user
  const userReport = match
    ? match.report?.userId?.email === user?.email
      ? match.report
      : match.matchedReport
    : undefined
  const otherReport = match
    ? match.report?.userId?.email === user?.email
      ? match.matchedReport
      : match.report
    : undefined

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {match?.status === "pending" ? "Review This Match" : "Match Details"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-3 text-muted-foreground">Loading match details...</span>
          </div>
        ) : match ? (
          <div className="space-y-6">
            {/* Match Info Card */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Match Information</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Found on {format(new Date(match.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      match.status === "confirmed" ? "default" : match.status === "pending" ? "secondary" : "outline"
                    }
                  >
                    {match.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Question for user */}
            {match.status === "pending" && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-center text-lg font-medium">
                  Is this your phone? Please review the details below and confirm if this matches your{" "}
                  {userReport?.type} phone.
                </AlertDescription>
              </Alert>
            )}

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your Report */}
              {userReport && (
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-500" />
                      Your Report ({userReport.type === "lost" ? "Lost" : "Found"})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {userReport.imageUrl && (
                      <div className="relative h-40 w-full rounded-md overflow-hidden">
                        <Image
                          src={userReport.imageUrl || "/placeholder.svg"}
                          alt={`${userReport.brand} ${userReport.color} phone`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="font-medium text-lg">
                        {userReport.brand} - {userReport.color}
                        {userReport.model && ` (${userReport.model})`}
                      </h4>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{userReport.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(userReport.dateLostFound), "MMM dd, yyyy")}</span>
                      </div>

                      <p className="text-sm text-muted-foreground">{userReport.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Matched Report */}
              {otherReport && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-green-500" />
                      Matched Report ({otherReport.type === "lost" ? "Lost" : "Found"})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {otherReport.imageUrl && (
                      <div className="relative h-40 w-full rounded-md overflow-hidden">
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
                        <p className="text-sm text-muted-foreground">Reported by {otherReport.userId.name}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{otherReport.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(otherReport.dateLostFound), "MMM dd, yyyy")}</span>
                      </div>

                      <p className="text-sm text-muted-foreground">{otherReport.description}</p>

                      {/* Contact Info - Only show if match is confirmed */}
                      {match.status === "confirmed" && (
                        <div className="pt-4 border-t">
                          <h5 className="font-medium mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Contact Information
                          </h5>
                          <div className="space-y-1 text-sm">
                            <p>
                              <strong>Email:</strong> {otherReport.userId.email}
                            </p>
                            {otherReport.contactPhone && (
                              <p>
                                <strong>Phone:</strong> {otherReport.contactPhone}
                              </p>
                            )}
                            {otherReport.contactEmail && otherReport.contactEmail !== otherReport.userId.email && (
                              <p>
                                <strong>Alt Email:</strong> {otherReport.contactEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Action Buttons */}
            {match.status === "pending" && (
              <>
                <Separator />
                <div className="flex gap-4 justify-center py-4">
                  <Button
                    size="lg"
                    onClick={() => handleConfirmMatch(true)}
                    disabled={updating}
                    className="min-w-[200px]"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    )}
                    {updating ? "Confirming..." : "Yes, This Is My Phone!"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleConfirmMatch(false)}
                    disabled={updating}
                    className="min-w-[200px]"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5 mr-2" />
                    )}
                    {updating ? "Rejecting..." : "Not My Phone"}
                  </Button>
                </div>
              </>
            )}

            {/* Status Messages */}
            {match.status === "confirmed" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Match Confirmed!</h3>
                    <p>This case has been successfully resolved. Contact information is now available above.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {match.status === "rejected" && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Match Rejected</h3>
                    <p>This was not the correct phone. We&apos;ll continue looking for other matches.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load match details</p>
            <Button variant="outline" onClick={fetchMatchDetails} className="mt-4">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
