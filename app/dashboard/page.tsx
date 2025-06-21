/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { ReportCard } from '@/components/ReportCard';
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
} from '@/components/ui/alert-dialog';

import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { useAuth } from '@/context/AuthContext';
import type { Report } from '@/type';
import { motion } from 'framer-motion';
import {
  Eye,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    lostReports: 0,
    foundReports: 0,
    matches: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserReports();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserReports = async () => {
    try {
      const response = await fetch('/api/report/user');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        console.error('Failed to fetch reports:', response.statusText);
        toast.error('Failed to load your reports');
      }
    } catch (error) {
      console.error('Failed to fetch user reports:', error);
      toast.error('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/report/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.statusText);
        // Keep default stats values on error
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      // Keep default stats values on error
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReports(reports.filter((r) => r._id !== reportId));
        toast.success('Report deleted successfully');
        fetchUserStats();
      } else {
        toast.error('Failed to delete report');
      }
    } catch (error) {
      toast.error('An error occurred while deleting the report');
    }
  };

  const statCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      description: "Reports you've submitted",
      icon: Phone,
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1,
    },
    {
      title: 'Lost Reports',
      value: stats.lostReports,
      description: "Phones you've lost",
      icon: Search,
      color: 'from-red-500 to-pink-500',
      delay: 0.2,
    },
    {
      title: 'Found Reports',
      value: stats.foundReports,
      description: "Phones you've found",
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      delay: 0.3,
    },
    {
      title: 'Matches Found',
      value: stats.matches,
      description: 'Potential matches discovered',
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-500',
      delay: 0.4,
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      description: 'New messages in inbox',
      icon: MessageCircle,
      color: 'from-orange-500 to-red-500',
      delay: 0.5,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-violet-900 dark:to-purple-900" />

      {/* Floating Particles */}

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
            <p className="text-xl text-muted-foreground">
              Manage your reports and track your activity
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {statCards.map((stat, index) => (
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
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm font-medium mb-1">{stat.title}</div>
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-12"
        >
          <GlassCard className="p-8" glow>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/report">
                <FuturisticButton
                  variant="glow"
                  className="w-full h-16 text-lg group"
                >
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                  Submit New Report
                </FuturisticButton>
              </Link>
              <Link href="/reports">
                <FuturisticButton
                  variant="glass"
                  className="w-full h-16 text-lg"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Browse All Reports
                </FuturisticButton>
              </Link>
              <Link href="/inbox">
                <FuturisticButton
                  variant="outline"
                  className="w-full h-16 text-lg relative"
                >
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

        {/* User Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-center">Your Reports</h2>
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
                  <div className="space-y-4">
                    <ReportCard report={report} showActions={true} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <FuturisticButton variant="outline" className="w-full">
                          Delete Report
                        </FuturisticButton>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your report and remove it from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteReport(report._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
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
                <h3 className="text-2xl font-bold mb-4">No Reports Yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  You haven&apos;t submitted any reports yet. Get started by
                  reporting a lost or found phone.
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
        </motion.div>
      </div>
    </div>
  );
}
