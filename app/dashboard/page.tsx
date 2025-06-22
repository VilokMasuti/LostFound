/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import type { Report, Match } from "@/type"
import { useAuth } from "@/context/AuthContext"
import { ReportCard } from "@/components/ReportCard"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { GlassCard } from "@/components/ui/glass-card"
import { FuturisticButton } from "@/components/ui/futuristic-button"
import { FloatingParticles } from "@/components/ui/floating-particles"
import { MatchStatusBanner } from "@/components/match-status-banner"
import { StatusTimeline } from "@/components/status-timeline"
import { NoMatchBanner } from "@/components/no-match-banner"
import { MatchDetailDialog } from "@/components/MatchDetailDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import { Phone, Search, TrendingUp, Users, MessageCircle, Plus, Eye, Sparkles, CheckCircle, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import Link from "next/link"
import { format } from "date-fns"

export default function DashboardPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const [stats, setStats] = useState({
    totalReports: 0,
    lostReports: 0,
    foundReports: 0,
    matches: 0,
    unreadMessages: 0,
  })

  useEffect(() => {
    if (user) {
      console.log("👤 Dashboard loading for user:", user.name)
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchUserReports(), fetchUserStats(), fetchUserMatches()])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReports = async () => {
    try {
      console.log("📊 Fetching user reports...")
      const response = await fetch("/api/report/user")
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Reports loaded:", data.length)
        setReports(data)
      } else {
        console.error("❌ Failed to fetch reports:", response.statusText)
        toast.error("Failed to load your reports")
      }
    } catch (error) {
      console.error("❌ Network error fetching reports:", error)
      toast.error("Failed to load your reports")
    }
  }

  const fetchUserStats = async () => {
    try {
      console.log("📈 Fetching user stats...")
      const response = await fetch("/api/report/stats")
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Stats loaded:", data)
        setStats(data)
      }
    } catch (error) {
      console.error("❌ Failed to fetch stats:", error)
    }
  }

  const fetchUserMatches = async () => {
    try {
      console.log("🎯 Fetching user matches...")
      const response = await fetch("/api/matches")
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Matches loaded:", data.length)
        setMatches(data)
      } else {
        console.error("❌ Failed to fetch matches:", response.statusText)
      }
    } catch (error) {
      console.error("❌ Network error fetching matches:", error)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    try {
      console.log("🗑️ Deleting report:", reportId)
      const response = await fetch(`/api/report/${reportId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log("✅ Report deleted successfully")
        setReports(reports.filter((r) => r._id !== reportId))
        toast.success("Report deleted successfully")
        fetchUserStats()
      } else {
        const error = await response.json()
        console.error("❌ Failed to delete report:", error)
        toast.error(error.message || "Failed to delete report")
      }
    } catch (error) {
      console.error("❌ Network error deleting report:", error)
      toast.error("An error occurred while deleting the report")
    }
  }

  const handleMatchUpdate = () => {
    console.log("🔄 Match updated, refreshing data...")
    fetchAllData()
  }

  const handleNotifyMe = () => {
    toast.success("🔔 We'll notify you as soon as we find a match!")
  }

  const statCards = [
    {
      title: "Total Reports",
      value: stats.totalReports,
      description: "Reports you've submitted",
      icon: Phone,
      color: "from-blue-500 to-cyan-500",
      delay: 0.1,
    },
    {
      title: "Lost Reports",
      value: stats.lostReports,
      description: "Phones you've lost",
      icon: Search,
      color: "from-red-500 to-pink-500",
      delay: 0.2,
    },
    {
      title: "Found Reports",
      value: stats.foundReports,
      description: "Phones you've found",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      delay: 0.3,
    },
    {
      title: "Matches Found",
      value: stats.matches,
      description: "Potential matches discovered",
      icon: TrendingUp,
      color: "from-purple-500 to-violet-500",
      delay: 0.4,
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages,
      description: "New messages in inbox",
      icon: MessageCircle,
      color: "from-orange-500 to-red-500",
      delay: 0.5,
    },
  ]

  const activeReports = reports.filter((r) => r.status === "active")
  const resolvedReports = reports.filter((r) => r.status === "resolved")
  const pendingMatches = matches.filter((m) => m.status === "pending")
  const confirmedMatches = matches.filter((m) => m.status === "confirmed")
  const reportsWithoutMatches = activeReports.filter(
    (report) => !matches.some((match) => match.reportId === report._id || match.matchedReportId === report._id),
  )

  const getReportStatus = (report: Report): "searching" | "matched" | "resolved" => {
    if (report.status === "resolved") return "resolved"

    const reportMatches = matches.filter((m) => m.reportId === report._id || m.matchedReportId === report._id)

    if (reportMatches.some((m) => m.status === "confirmed" || m.status === "pending")) {
      return "matched"
    }

    return "searching"
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-violet-900 dark:to-purple-900" />

      {/* Floating Particles */}
      <FloatingParticles count={30} />

      <div className="container mx-auto px-4 py-24 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Welcome Back, {user?.name}!
            </h1>
            <p className="text-xl text-muted-foreground">Manage your reports and track your activity</p>
          </div>
        </motion.div>

        {/* Match Notifications */}
        {pendingMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <MatchStatusBanner
              type="match_found"
              title="🎯 Great news! We've found a possible match."
              message={`We found ${pendingMatches.length} potential match${pendingMatches.length > 1 ? "es" : ""} for your reports. Review ${pendingMatches.length > 1 ? "them" : "it"} now to confirm if ${pendingMatches.length > 1 ? "any are" : "it's"} your phone.`}
              actionLabel="Review Matches"
              onAction={() => setActiveTab("matches")}
            />
          </motion.div>
        )}

        {confirmedMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <MatchStatusBanner
              type="match_confirmed"
              title="✅ This issue has been resolved!"
              message={`Congratulations! ${confirmedMatches.length} of your reports have been successfully matched and resolved. Thank you for using LostFormed!`}
              actionLabel="View Resolved"
              onAction={() => setActiveTab("resolved")}
            />
          </motion.div>
        )}

        {/* No Match Banner for reports without matches */}
        {reportsWithoutMatches.length > 0 && pendingMatches.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <NoMatchBanner reportType={reportsWithoutMatches[0]?.type || "lost"} onNotifyMe={handleNotifyMe} />
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {statCards.map((stat, _index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.6 }}
            >
              <GlassCard className="text-center" hover glow>
                <motion.div
                  className={`w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center mx-auto mb-4`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm font-medium mb-1">{stat.title}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Status Timeline for Active Reports */}
        {activeReports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-12"
          >
            <GlassCard className="p-8" glow>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Your Progress
              </h2>
              {activeReports.slice(0, 1).map((report) => (
                <div key={report._id} className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium">
                      {report.brand} {report.color} - {report.type === "lost" ? "Lost" : "Found"}
                    </h3>
                    <p className="text-sm text-muted-foreground">Track your report progress</p>
                  </div>
                  <StatusTimeline currentStatus={getReportStatus(report)} type={report.type} />
                </div>
              ))}
            </GlassCard>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-12"
        >
          <GlassCard className="p-8" glow>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/report">
                <FuturisticButton variant="glow" className="w-full h-16 text-lg group">
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                  Submit New Report
                </FuturisticButton>
              </Link>
              <Link href="/reports">
                <FuturisticButton variant="glass" className="w-full h-16 text-lg">
                  <Eye className="w-5 h-5 mr-2" />
                  Browse All Reports
                </FuturisticButton>
              </Link>
              <Link href="/inbox">
                <FuturisticButton variant="outline" className="w-full h-16 text-lg relative">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  View Inbox
                  {stats.unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {stats.unreadMessages}
                    </span>
                  )}
                </FuturisticButton>
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        {/* Reports Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8 glass h-14">
              <TabsTrigger value="active" className="text-base">
                Active ({activeReports.length})
              </TabsTrigger>
              <TabsTrigger value="matches" className="text-base">
                Matches ({matches.length})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="text-base">
                Resolved ({resolvedReports.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="text-base">
                All Reports ({reports.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches">
              {matches.length > 0 ? (
                <div className="space-y-6">
                  {matches.map((match, index) => (
                    <motion.div
                      key={match._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <GlassCard className="p-6" glow>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2">
                              Match for {
                                reports.find(r => r._id === match.reportId)?.brand ||
                                reports.find(r => r._id === match.matchedReportId)?.brand
                              }{" "}
                              {
                                reports.find(r => r._id === match.reportId)?.color ||
                                reports.find(r => r._id === match.matchedReportId)?.color
                              }
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {match.confidence} • Similarity: {Math.round(match.similarity * 100)}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Found on {format(new Date(match.createdAt), "MMM dd, yyyy 'at' h:mm a")}
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

                        <div className="flex gap-2">
                          <MatchDetailDialog
                            matchId={match._id}
                            onMatchUpdate={handleMatchUpdate}
                            trigger={
                              <FuturisticButton variant="glow" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                {match.status === "pending" ? "Review Match" : "View Details"}
                              </FuturisticButton>
                            }
                          />
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassCard className="text-center py-16" glow>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Search className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">No Matches Yet</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      🔍 No match yet, but we&apos;re still looking... Check back soon or we&apos;ll notify you when we find a
                      match!
                    </p>
                  </motion.div>
                </GlassCard>
              )}
            </TabsContent>

            <TabsContent value="active">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : activeReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeReports.map((report, index) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <div className="space-y-4">
                        <ReportCard
                          report={report}
                          showActions={false}
                          matches={matches.filter((m) => m.reportId === report._id || m.matchedReportId === report._id)}
                          isOwner={true}
                        />

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <FuturisticButton variant="outline" className="w-full" size="sm">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Report
                            </FuturisticButton>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Report?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete your {report.type} phone report for {report.brand}{" "}
                                {report.color}. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReport(report._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Report
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassCard className="text-center py-16" glow>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Phone className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">No Active Reports</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      You don&apos;t have any active reports. Submit a report to get started.
                    </p>
                    <Link href="/report">
                      <FuturisticButton variant="glow" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Submit Your First Report
                      </FuturisticButton>
                    </Link>
                  </motion.div>
                </GlassCard>
              )}
            </TabsContent>

            <TabsContent value="resolved">
              {resolvedReports.length > 0 ? (
                <div className="space-y-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <GlassCard
                      className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      glow
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                            ✅ Cases Successfully Resolved!
                          </h3>
                          <p className="text-green-700 dark:text-green-300">
                            Congratulations! These phones have been successfully returned to their owners.
                          </p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resolvedReports.map((report, index) => (
                      <motion.div
                        key={report._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                      >
                        <ReportCard report={report} isOwner={true} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <GlassCard className="text-center py-16" glow>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <CheckCircle className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">No Resolved Cases</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      Once you confirm matches and resolve cases, they&lsquo;ll appear here as success stories.
                    </p>
                  </motion.div>
                </GlassCard>
              )}
            </TabsContent>

            <TabsContent value="all">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : reports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reports.map((report, index) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <ReportCard
                        report={report}
                        showActions={false}
                        matches={matches.filter((m) => m.reportId === report._id || m.matchedReportId === report._id)}
                        isOwner={true}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <GlassCard className="text-center py-16" glow>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Phone className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">No Reports Yet</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                      You haven&apos;t submitted any reports yet. Get started by reporting a lost or found phone.
                    </p>
                    <Link href="/report">
                      <FuturisticButton variant="glow" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Submit Your First Report
                      </FuturisticButton>
                    </Link>
                  </motion.div>
                </GlassCard>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
