/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { ContactModal } from '@/components/ContactModal';
import { ModernReportCard } from '@/components/modern-report-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SuccessPopup } from '@/components/ui/success-popup';
import { useAuth } from '@/context/AuthContext';
import type { Match, Report } from '@/type';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  Clock,
  Loader2,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Enhanced animation variants for modern feel
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
      duration: 0.6,
    },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  // State management
  const [reports, setReports] = useState<Report[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [hasNewReports, setHasNewReports] = useState(false);
  const [sentMessages, setSentMessages] = useState<Set<string>>(new Set());
  const [resolvedMatches, setResolvedMatches] = useState<Set<string>>(
    new Set()
  );
  const [stats, setStats] = useState({
    totalReports: 0,
    lostReports: 0,
    foundReports: 0,
    matches: 0,
    unreadMessages: 0,
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successPopupData, setSuccessPopupData] = useState({
    title: '',
    message: '',
    type: 'resolved' as 'resolved' | 'matched' | 'submitted',
  });

  // Auto-close success popup after 5 seconds
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  // Data fetching functions with improved error handling
  const fetchUserReports = useCallback(async () => {
    try {
      const response = await fetch('/api/report/user');
      if (!response.ok) {
        throw new Error(`Failed to load reports: ${response.status}`);
      }
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
      console.log(
        `✅ Found ${Array.isArray(data) ? data.length : 0} user reports`
      );
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  }, []);

  const fetchUserStats = useCallback(async () => {
    try {
      const [statsResponse, messagesResponse] = await Promise.all([
        fetch('/api/report/stats'),
        fetch('/api/messages/count'),
      ]);

      if (statsResponse.ok) {
        const data = await statsResponse.json();

        // Get message count
        let messageCount = 0;
        if (messagesResponse.ok) {
          const messageData = await messagesResponse.json();
          messageCount = messageData.unreadCount || 0;
        }

        setStats({
          ...data,
          unreadMessages: messageCount,
        });
        console.log(`📈 User stats:`, {
          ...data,
          unreadMessages: messageCount,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchUserMatches = useCallback(async () => {
    try {
      setMatchesError(null);
      const response = await fetch('/api/matches');
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status}`);
      }
      const data = await response.json();

      console.log('📊 Raw matches from API:', data.length);

      // Filter out resolved matches
      const activeMatches = Array.isArray(data)
        ? data.filter((match: Match) => {
            const isResolved =
              resolvedMatches.has(match._id) ||
              match.report?.status === 'resolved' ||
              match.matchedReport?.status === 'resolved';

            if (isResolved) {
              console.log(`🚫 Filtering out resolved match: ${match._id}`);
            }
            return !isResolved;
          })
        : [];

      setMatches(activeMatches);
      console.log(`✅ Active matches after filtering: ${activeMatches.length}`);
    } catch (error) {
      console.error('❌ Failed to fetch matches:', error);
      setMatchesError(
        error instanceof Error ? error.message : 'Failed to load matches'
      );
      setMatches([]);
    }
  }, [resolvedMatches]);

  const checkNewReports = useCallback(async () => {
    try {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const response = await fetch(`/api/report/recent?since=${oneDayAgo}`);
      if (response.ok) {
        const newReports = await response.json();
        setHasNewReports(newReports.length > 0);
      }
    } catch (error) {
      console.error('Failed to check new reports:', error);
    }
  }, []);

  // Comprehensive data fetching with better error handling
  const fetchAllData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setRefreshing(true);

      const errors: unknown[] = [];

      try {
        const results = await Promise.allSettled([
          fetchUserReports(),
          fetchUserStats(),
          fetchUserMatches(),
          checkNewReports(),
        ]);

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const functionNames = [
              'fetchUserReports',
              'fetchUserStats',
              'fetchUserMatches',
              'checkNewReports',
            ];
            errors.push(`${functionNames[index]}: ${result.reason}`);
          }
        });

        setLastRefresh(new Date());

        if (silent && errors.length === 0) {
          toast.success('Dashboard updated', {
            duration: 2000,
            style: {
              background: '#111111',
              color: '#FFFFFF',
              border: '1px solid #333333',
            },
            icon: <Check className="w-4 h-4" />,
          });
        }

        if (errors.length > 0) {
          console.error('Some data fetches failed:', errors);
          if (!silent) {
            toast.error(`Failed to load some data: ${errors[0]}`, {
              style: {
                background: '#111111',
                color: '#FFFFFF',
                border: '1px solid #333333',
              },
            });
          }
        }
      } catch (error) {
        console.error('Critical error in fetchAllData:', error);
        if (!silent) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to load dashboard data';
          toast.error(errorMessage, {
            style: {
              background: '#111111',
              color: '#FFFFFF',
              border: '1px solid #333333',
            },
          });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchUserReports, fetchUserStats, fetchUserMatches, checkNewReports]
  );

  // Initial data load
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const handleManualRefresh = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Report deletion handler
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/report/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      toast.success('Report deleted successfully', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
        icon: <Check className="w-4 h-4" />,
      });
      fetchAllData(true);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
      });
    }
  };

  // Match deletion handler
  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete match');
      }

      toast.success('Match deleted successfully', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
        icon: <Check className="w-4 h-4" />,
      });
      fetchAllData(true);
    } catch (error) {
      console.error('Error deleting match:', error);
      toast.error('Failed to delete match', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
      });
    }
  };

  // Tab change handler
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Match action handlers with improved error handling
  const handleConfirmMatch = async (matchId: string) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/confirm`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to confirm match');
      }

      toast.success('Match confirmed successfully!', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
        icon: <Check className="w-4 h-4" />,
      });
      fetchAllData(true);
    } catch (error) {
      console.error('Error confirming match:', error);
      toast.error('Failed to confirm match', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
      });
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      const response = await fetch(`/api/matches/${matchId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reject match');
      }

      toast.success('Match rejected', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
        icon: <Check className="w-4 h-4" />,
      });
      fetchAllData(true);
    } catch (error) {
      console.error('Error rejecting match:', error);
      toast.error('Failed to reject match', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
      });
    }
  };

  // FIXED: Enhanced mark returned handler with proper error handling and UI updates
  const handleMarkReturned = async (matchId: string, isLostUser: boolean) => {
    const confirmMessage = isLostUser
      ? 'Are you sure you have received your phone back?'
      : 'Are you sure you have returned the phone to its owner?';

    if (!confirm(confirmMessage)) return;

    console.log(`🔄 Marking match ${matchId} as returned...`);

    try {
      // Show immediate loading state
      const response = await fetch(`/api/matches/${matchId}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Send minimal data to avoid validation issues
          isLostUser,
          userId: user?._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to mark as returned`
        );
      }

      const responseData = await response.json();
      console.log('✅ API Response:', responseData);

      // IMMEDIATE UI UPDATES - Don't wait for API
      setResolvedMatches((prev) => new Set(prev).add(matchId));
      setMatches((prev) => prev.filter((match) => match._id !== matchId));

      // Show success popup IMMEDIATELY
      setSuccessPopupData({
        title: '🎉 Phone Successfully Returned!',
        message:
          'Thanks for contributing to the community! The case has been marked as resolved.',
        type: 'resolved',
      });
      setShowSuccessPopup(true);

      // Show toast notification
      toast.success('Case resolved successfully! 🎉', {
        duration: 4000,
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
        icon: <CheckCircle className="w-4 h-4" />,
      });

      console.log(`✅ Match ${matchId} marked as resolved and removed from UI`);

      // Refresh data in background after a short delay
      setTimeout(async () => {
        try {
          await fetchAllData(true);
          console.log('✅ Background data refresh completed');
        } catch (error) {
          console.error('⚠️ Background refresh failed:', error);
          // Don't show error to user since main action succeeded
        }
      }, 2000);
    } catch (error) {
      console.error('❌ Error marking as returned:', error);

      // Revert optimistic updates on error
      setResolvedMatches((prev) => {
        const newSet = new Set(prev);
        newSet.delete(matchId);
        return newSet;
      });

      // Restore match if it was removed
      if (!matches.find((m) => m._id === matchId)) {
        fetchUserMatches().catch(console.error);
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to mark as returned';

      // Show user-friendly error message
      toast.error('Failed to resolve case. Please try again.', {
        description: errorMessage.includes('validation')
          ? 'There was a system error. Please refresh and try again.'
          : errorMessage,
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
      });
    }
  };

  const handleMessageSent = (matchId: string) => {
    setSentMessages((prev) => new Set(prev).add(matchId));
    toast.success('Message sent successfully!', {
      style: {
        background: '#111111',
        color: '#FFFFFF',
        border: '1px solid #333333',
      },
      icon: <Check className="w-4 h-4" />,
    });
  };

  const dismissNewReports = () => {
    setHasNewReports(false);
  };

  // Data processing for UI
  const activeReports = reports.filter((r) => r.status !== 'resolved');
  const lostReports = activeReports.filter((r) => r.type === 'lost');
  const foundReports = activeReports.filter((r) => r.type === 'found');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const pendingMatches = matches.filter((m) => m.status === 'pending');
  const hasPendingMatches = pendingMatches.length > 0;

  // Loading state with modern spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
            className="mb-6"
          >
            <Loader2 className="h-16 w-16 text-white mx-auto" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-xl font-medium"
          ></motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        {/* Modern Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50  to-neutral-800 font-bold tracking-tight sm:text-6xl leading-tight  glowing-text text-5xl md:text-6xl lg:text-6xl xl:text-6xl">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-white/60 text-lg sm:text-xl">
              Track your reports and manage your activity
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="border-white/30 bg-black/50 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300 shadow-lg"
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : {}}
                  transition={{
                    duration: 1,
                    repeat: refreshing ? Number.POSITIVE_INFINITY : 0,
                    ease: 'linear',
                  }}
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                </motion.div>
                {refreshing ? 'Updating...' : 'Refresh'}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* New Reports Notification - Improved UX */}
        <AnimatePresence>
          {hasNewReports && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8 sm:mb-12"
            >
              <Alert className="border-white/30 bg-black backdrop-blur-sm shadow-2xl">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Bell className="h-5 w-5 text-white" />
                </motion.div>
                <AlertDescription className="text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    <span className="text-lg font-medium">
                      New reports available! Someone might have found your lost
                      item.
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-white/30 text-white hover:bg-white hover:text-black bg-transparent"
                      >
                        <Link href="/reports">Browse Reports</Link>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={dismissNewReports}
                        className="text-white hover:bg-white/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending Matches Alert - Improved UX */}
        <AnimatePresence>
          {hasPendingMatches && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8 sm:mb-12"
            >
              <Alert className="border-yellow-400/30 bg-black backdrop-blur-sm shadow-2xl">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </motion.div>
                <AlertDescription className="text-white flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-lg font-medium">
                    Potential matches found! Review them in the Matches tab to
                    confirm.
                  </span>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FIXED: Modern Stats Cards - Show ALL stats with proper counts */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 sm:mb-12 grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          {[
            {
              title: 'Total Reports',
              value: stats.totalReports,
              icon: Phone,
              show: true,
            },
            {
              title: 'Lost Items',
              value: stats.lostReports,
              icon: Search,
              show: true,
            },
            {
              title: 'Found Items',
              value: stats.foundReports,
              icon: Users,
              show: true,
            },
            {
              title: 'Matches',
              value: matches.length,
              icon: TrendingUp,
              show: true,
            },
            {
              title: 'Messages',
              value: stats.unreadMessages,
              icon: MessageCircle,
              show: true,
            },
          ]
            .filter((stat) => stat.show)
            .map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  scale: 1.05,
                  rotateY: 5,
                  transition: { type: 'spring', stiffness: 400, damping: 25 },
                }}
                className="relative group"
              >
                <Card className="relative overflow-hidden bg-black border-white/20 hover:border-white/40 transition-all duration-500 backdrop-blur-sm transform-gpu perspective-1000 shadow-2xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                  {/* 3D Shadow Effect */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* 3D Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform rotate-45" />

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                    <CardTitle className="text-sm sm:text-base font-medium text-white/80 group-hover:text-white transition-colors duration-300">
                      {stat.title}
                    </CardTitle>
                    <div className="relative">
                      <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110 shadow-lg">
                        <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white/70 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-2xl sm:text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <p className="text-xs text-white/60 mt-1 group-hover:text-white/80 transition-colors duration-300">
                      {stat.value === 1 ? 'item' : 'items'}
                    </p>
                  </CardContent>

                  {/* 3D Corner Highlight */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </motion.div>
            ))}
        </motion.div>

        {/* Stunning Modern QuickActions - Black themed with power effects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-8 sm:mb-12"
        >
          <Card className="bg-black border-white/20 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                <Zap className="h-6 w-6 text-white" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-white/60 text-lg">
                Get started with these powerful tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  {
                    href: '/report',
                    icon: Plus,
                    title: 'Submit New Report',
                    desc: 'Report a lost or found item',
                  },
                  {
                    href: '/reports',
                    icon: Search,
                    title: 'Browse Reports',
                    desc: 'Search through all reports',
                  },
                  {
                    href: '/inbox',
                    icon: MessageCircle,
                    title: 'Messages',
                    desc: 'Check your inbox',
                  },
                ].map((action, index) => (
                  <motion.div
                    key={action.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.6 }}
                    whileHover={{
                      scale: 1.05,
                      rotateY: 5,
                      boxShadow:
                        '0 20px 40px rgba(255, 255, 255, 0.2), 0 0 30px rgba(255, 255, 255, 0.1)',
                      transition: {
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                      },
                    }}
                    className="relative group"
                  >
                    <Link href={action.href}>
                      <div className="relative overflow-hidden rounded-xl p-8 bg-black border border-white/20 hover:border-white/40 transition-all duration-500 shadow-xl hover:shadow-2xl backdrop-blur-sm">
                        {/* Power glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                          <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                            <action.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-bold text-xl text-white group-hover:text-white transition-colors duration-300">
                              {action.title}
                            </h3>
                            <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                              {action.desc}
                            </p>
                          </div>
                        </div>

                        {/* Corner accent */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modern Tabs Section - Improved UX with icons instead of numbers */}
        {(activeReports.length > 0 ||
          matches.length > 0 ||
          resolvedReports.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full"
          >
            <div className="flex flex-wrap sm:flex-nowrap space-x-2 rounded-xl bg-black border border-white/20 p-2 backdrop-blur-sm shadow-xl">
              {[
                {
                  id: 'overview',
                  label: 'Overview',
                  icon: Activity,
                  show: true,
                },
                {
                  id: 'matches',
                  label: 'Matches',
                  icon: Sparkles,
                  show: matches.length > 0,
                },
                {
                  id: 'reports',
                  label: 'My Reports',
                  icon: Phone,
                  show: activeReports.length > 0,
                },
                {
                  id: 'resolved',
                  label: 'Resolved',
                  icon: CheckCircle,
                  show: resolvedReports.length > 0,
                },
              ]
                .filter((tab) => tab.show)
                .map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      flex-1 rounded-lg px-4 py-3 text-sm sm:text-base font-medium
                      transition-all duration-300 relative flex items-center justify-center gap-2
                      ${
                        activeTab === tab.id
                          ? 'bg-white text-black shadow-lg'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="truncate">{tab.label}</span>
                  </motion.button>
                ))}
            </div>

            {/* Tab Content with improved animations */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="mt-8"
              >
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Recent Activity Card */}
                      <Card className="bg-black border-white/20 backdrop-blur-sm shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Recent Activity
                          </CardTitle>
                          <CardDescription className="text-white/60">
                            Your latest reports and matches
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {activeReports.length > 0 ? (
                            <div className="space-y-4">
                              {activeReports
                                .slice(0, 3)
                                .map((report, index) => (
                                  <motion.div
                                    key={report._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="flex items-center space-x-4 p-4 rounded-lg border border-white/10 bg-black/30 hover:bg-black/50 transition-colors duration-300"
                                  >
                                    <div
                                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                                        report.type === 'lost'
                                          ? 'bg-black border-white'
                                          : 'bg-white border-black'
                                      }`}
                                    >
                                      <Phone
                                        className={`h-5 w-5 ${
                                          report.type === 'lost'
                                            ? 'text-white'
                                            : 'text-black'
                                        }`}
                                      />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <p className="text-base font-medium text-white">
                                        {report.brand} {report.color}
                                      </p>
                                      <p className="text-sm text-white/60">
                                        {report.location}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="bg-black/50 text-white border-white/20"
                                    >
                                      {report.type.toUpperCase()}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteReport(report._id)
                                      }
                                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                ))}
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12"
                            >
                              <Phone className="h-16 w-16 mx-auto text-white/30 mb-4" />
                              <p className="text-white/60 mb-6">
                                No reports yet
                              </p>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  asChild
                                  className="bg-white text-black hover:bg-white/90"
                                >
                                  <Link href="/report">
                                    Submit Your First Report
                                  </Link>
                                </Button>
                              </motion.div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Matches Overview Card */}
                      <Card className="bg-black border-white/20 backdrop-blur-sm shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-400" />
                            Matches
                          </CardTitle>
                          <CardDescription className="text-white/60">
                            Potential matches for your reports
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {matches.length > 0 ? (
                            <div className="space-y-4">
                              {matches.slice(0, 2).map((match, index) => (
                                <motion.div
                                  key={match._id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 * index }}
                                  className="p-4 rounded-lg border border-white/10 bg-black/30 hover:bg-black/50 transition-colors duration-300"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-base font-medium text-white">
                                      {match.report?.brand ||
                                        match.matchedReport?.brand}{' '}
                                      {match.report?.color ||
                                        match.matchedReport?.color}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className="bg-black/50 text-white border-white/20"
                                      >
                                        {Math.round(match.similarity * 100)}%
                                        Match
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteMatch(match._id)
                                        }
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className="text-sm text-white/60">
                                    Status:{' '}
                                    {match.status === 'pending'
                                      ? 'Needs Review'
                                      : match.status}
                                  </p>
                                </motion.div>
                              ))}
                              {matches.length > 2 && (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button
                                    variant="outline"
                                    onClick={() => handleTabChange('matches')}
                                    className="w-full border-white/20 bg-black/30 text-white hover:bg-white hover:text-black"
                                  >
                                    View All Matches
                                  </Button>
                                </motion.div>
                              )}
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-center py-12"
                            >
                              <Search className="h-16 w-16 mx-auto text-white/30 mb-4" />
                              <p className="text-white/60 mb-2">
                                No matches found yet
                              </p>
                              <p className="text-sm text-white/40">
                                We&apos;ll notify you when potential matches are
                                detected
                              </p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === 'matches' && (
                  <div className="space-y-6">
                    {matchesError ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Alert className="border-red-500/30 bg-red-900/20 backdrop-blur-sm">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                          <AlertDescription className="text-white">
                            <strong>Error loading matches:</strong>{' '}
                            {matchesError}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchUserMatches()}
                              className="ml-3 border-white/30 text-white hover:bg-white hover:text-black"
                            >
                              Retry
                            </Button>
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    ) : matches.length > 0 ? (
                      <div className="space-y-6">
                        <AnimatePresence>
                          {matches.map((match, index) => {
                            // Determine user roles based on report ownership
                            const lostReport =
                              match.report?.type === 'lost'
                                ? match.report
                                : match.matchedReport;
                            const foundReport =
                              match.report?.type === 'found'
                                ? match.report
                                : match.matchedReport;

                            // Check if current user owns the lost report (they are the lost phone owner)
                            const isLostUser =
                              lostReport?.user?._id === user?._id ||
                              lostReport?.userId === user?._id;
                            // Check if current user owns the found report (they are the finder)
                            const isFoundUser =
                              foundReport?.user?._id === user?._id ||
                              foundReport?.userId === user?._id;

                            // Show the OTHER person's report (what they need to see)
                            const otherReport = isLostUser
                              ? foundReport
                              : lostReport;
                            const myReport = isLostUser
                              ? lostReport
                              : foundReport;

                            const hasMessageSent = sentMessages.has(match._id);

                            return (
                              <motion.div
                                key={match._id || index}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{
                                  delay: 0.1 * index,
                                  duration: 0.6,
                                }}
                                layout
                              >
                                <Card
                                  className={`${
                                    match.status === 'pending'
                                      ? 'ring-2 ring-yellow-400/50 bg-black border-yellow-400/30'
                                      : match.status === 'confirmed'
                                      ? 'ring-2 ring-green-400/50 bg-black border-green-400/30'
                                      : 'bg-black border-white/20'
                                  } backdrop-blur-sm shadow-xl`}
                                >
                                  <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                      <CardTitle className="text-xl flex items-center gap-3 text-white">
                                        <motion.div
                                          animate={{ rotate: [0, 10, -10, 0] }}
                                          transition={{
                                            duration: 2,
                                            repeat: Number.POSITIVE_INFINITY,
                                          }}
                                        >
                                          <Sparkles className="h-6 w-6 text-yellow-400" />
                                        </motion.div>
                                        {isLostUser
                                          ? '📱 Found Phone Match!'
                                          : '🔍 Lost Phone Match!'}
                                      </CardTitle>
                                      <div className="flex flex-wrap items-center gap-3">
                                        <Badge
                                          variant="secondary"
                                          className="bg-black/50 text-white border-white/20"
                                        >
                                          {Math.round(match.similarity * 100)}%
                                          Match
                                        </Badge>
                                        <Badge
                                          variant={
                                            match.status === 'pending'
                                              ? 'secondary'
                                              : match.status === 'confirmed'
                                              ? 'default'
                                              : 'outline'
                                          }
                                          className={
                                            match.status === 'pending'
                                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                                              : match.status === 'confirmed'
                                              ? 'bg-green-500/20 text-green-300 border-green-400/30'
                                              : 'bg-black/50 text-white border-white/20'
                                          }
                                        >
                                          {match.status === 'pending'
                                            ? 'Needs Review'
                                            : match.status === 'confirmed'
                                            ? 'Confirmed'
                                            : 'Returned'}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteMatch(match._id)
                                          }
                                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>

                                  <CardContent className="space-y-6">
                                    {/* Phone Details */}
                                    <div className="flex flex-col sm:flex-row gap-6">
                                      {otherReport?.imageUrl && (
                                        <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-black flex-shrink-0 border-2 border-white/20">
                                          <Image
                                            src={
                                              otherReport.imageUrl ||
                                              '/placeholder.svg'
                                            }
                                            alt={`${otherReport.brand} ${otherReport.color}`}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1 space-y-2">
                                        <p className="font-bold text-xl text-white">
                                          {otherReport?.brand}{' '}
                                          {otherReport?.color}
                                          {otherReport?.model && (
                                            <span className="text-white/60 font-normal">
                                              {' '}
                                              ({otherReport.model})
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-white/70 flex items-center gap-2">
                                          📍 {otherReport?.location}
                                        </p>
                                        <p className="text-white/70 flex items-center gap-2">
                                          📅{' '}
                                          {otherReport?.dateLostFound &&
                                            format(
                                              new Date(
                                                otherReport.dateLostFound
                                              ),
                                              'MMM dd, yyyy'
                                            )}
                                        </p>
                                        <p className="text-white/70">
                                          {isLostUser ? 'Found' : 'Lost'} by:{' '}
                                          <strong className="text-white">
                                            {otherReport?.user?.name}
                                          </strong>
                                        </p>
                                        {otherReport?.description && (
                                          <p className="text-white/60 italic">
                                            &quot;{otherReport.description}
                                            &quot;
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* My Report Summary */}
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                      <p className="text-base font-medium mb-2 text-white">
                                        Your {isLostUser ? 'Lost' : 'Found'}{' '}
                                        Report:
                                      </p>
                                      <p className="text-white/70">
                                        {myReport?.brand} {myReport?.color} -{' '}
                                        {myReport?.location}
                                      </p>
                                    </div>

                                    {/* Status-based Actions */}
                                    {match.status === 'pending' && (
                                      <>
                                        {isLostUser ? (
                                          // Lost Phone Owner - Show confirmation buttons
                                          <div className="space-y-4">
                                            <Alert className="border-yellow-400/30 bg-yellow-900/20 backdrop-blur-sm">
                                              <Clock className="h-5 w-5 text-yellow-400" />
                                              <AlertDescription className="text-white">
                                                <strong>
                                                  🤔 Is this your lost phone?
                                                </strong>{' '}
                                                Please confirm if this matches
                                                your device.
                                              </AlertDescription>
                                            </Alert>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                              <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex-1"
                                              >
                                                <Button
                                                  onClick={() =>
                                                    handleConfirmMatch(
                                                      match._id
                                                    )
                                                  }
                                                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                  <CheckCircle className="w-5 h-5 mr-2" />
                                                  ✅ Yes, This Is My Phone!
                                                </Button>
                                              </motion.div>
                                              <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex-1"
                                              >
                                                <Button
                                                  variant="outline"
                                                  onClick={() =>
                                                    handleRejectMatch(match._id)
                                                  }
                                                  className="w-full border-white/30 text-white hover:bg-white hover:text-black"
                                                >
                                                  ❌ Not My Phone
                                                </Button>
                                              </motion.div>
                                            </div>
                                          </div>
                                        ) : isFoundUser ? (
                                          // Phone Finder - Show waiting message
                                          <Alert className="border-blue-400/30 bg-blue-900/20 backdrop-blur-sm">
                                            <Clock className="h-5 w-5 text-blue-400" />
                                            <AlertDescription className="text-white">
                                              <strong>
                                                ⏳ Waiting for owner
                                                confirmation...
                                              </strong>{' '}
                                              {lostReport?.user?.name} needs to
                                              confirm this is their phone before
                                              you can proceed.
                                            </AlertDescription>
                                          </Alert>
                                        ) : (
                                          // Fallback for unknown role
                                          <Alert className="border-red-400/30 bg-red-900/20 backdrop-blur-sm">
                                            <AlertDescription className="text-white">
                                              <strong>Unknown role.</strong>{' '}
                                              Please refresh the page.
                                            </AlertDescription>
                                          </Alert>
                                        )}
                                      </>
                                    )}

                                    {match.status === 'confirmed' && (
                                      <div className="space-y-4">
                                        <Alert className="border-green-400/30 bg-green-900/20 backdrop-blur-sm">
                                          <CheckCircle className="h-5 w-5 text-green-400" />
                                          <AlertDescription className="text-white">
                                            <strong>✅ Match Confirmed!</strong>{' '}
                                            Contact each other to arrange
                                            pickup.
                                          </AlertDescription>
                                        </Alert>

                                        {/* Contact Info */}
                                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                                          <h4 className="font-bold mb-3 text-white text-lg">
                                            Contact Information:
                                          </h4>
                                          <div className="space-y-2 text-base">
                                            <p className="text-white/70">
                                              <strong className="text-white">
                                                Name:
                                              </strong>{' '}
                                              {otherReport?.user?.name}
                                            </p>
                                            <p className="text-white/70">
                                              <strong className="text-white">
                                                Email:
                                              </strong>{' '}
                                              {otherReport?.user?.email}
                                            </p>
                                            {otherReport?.contactPhone && (
                                              <p className="text-white/70">
                                                <strong className="text-white">
                                                  Phone:
                                                </strong>{' '}
                                                {otherReport.contactPhone}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                          {!hasMessageSent ? (
                                            <ContactModal
                                              trigger={
                                                <motion.div
                                                  whileHover={{ scale: 1.02 }}
                                                  whileTap={{ scale: 0.98 }}
                                                  className="flex-1"
                                                >
                                                  <Button
                                                    variant="outline"
                                                    className="w-full border-white/30 text-white hover:bg-white hover:text-black bg-transparent"
                                                  >
                                                    <MessageCircle className="w-5 h-5 mr-2" />
                                                    Send Message
                                                  </Button>
                                                </motion.div>
                                              }
                                              reportData={{
                                                _id: otherReport?._id || '',
                                                brand: otherReport?.brand || '',
                                                color: otherReport?.color || '',
                                                model: otherReport?.model,
                                                location:
                                                  otherReport?.location || '',
                                                type:
                                                  otherReport?.type || 'lost',
                                                user: {
                                                  name:
                                                    otherReport?.user?.name ||
                                                    '',
                                                  email:
                                                    otherReport?.user?.email ||
                                                    '',
                                                },
                                              }}
                                              userRole={
                                                isLostUser ? 'owner' : 'finder'
                                              }
                                              onMessageSent={() =>
                                                handleMessageSent(match._id)
                                              }
                                            />
                                          ) : (
                                            <div className="flex-1">
                                              <Button
                                                disabled
                                                variant="outline"
                                                className="w-full border-green-400/30 text-green-300 bg-green-900/20"
                                              >
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Message Sent ✓
                                              </Button>
                                            </div>
                                          )}
                                          <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1"
                                          >
                                            <Button
                                              onClick={() =>
                                                handleMarkReturned(
                                                  match._id,
                                                  isLostUser
                                                )
                                              }
                                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            >
                                              {isLostUser
                                                ? '📱 I Got My Phone Back'
                                                : '📱 I Returned The Phone'}
                                            </Button>
                                          </motion.div>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Card className="bg-black border-white/20 backdrop-blur-sm shadow-xl">
                          <CardContent className="py-20 text-center">
                            <Search className="mx-auto h-20 w-20 text-white/30 mb-6" />
                            <h3 className="text-2xl font-bold mb-4 text-white">
                              No Active Matches
                            </h3>
                            <p className="text-white/60 text-lg">
                              We&lsquo;re actively searching for matches.
                              You&apos;ll be notified when we find one!
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    {activeReports.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      >
                        {activeReports.map((report, index) => (
                          <motion.div
                            key={report._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.6 }}
                          >
                            <ModernReportCard
                              report={report}
                              isOwner={true}
                              onDelete={() => handleDeleteReport(report._id)}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Card className="bg-black border-white/20 backdrop-blur-sm shadow-xl">
                          <CardContent className="py-20 text-center">
                            <Phone className="mx-auto h-20 w-20 text-white/30 mb-6" />
                            <h3 className="text-2xl font-bold mb-4 text-white">
                              No Reports Yet
                            </h3>
                            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
                              You haven&apos;t submitted any reports yet. Get
                              started by reporting a lost or found item.
                            </p>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                asChild
                                className="bg-white text-black hover:bg-white/90 text-lg px-8 py-3"
                              >
                                <Link href="/report">
                                  <Plus className="mr-2 h-5 w-5" />
                                  Submit Your First Report
                                </Link>
                              </Button>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}

                {activeTab === 'resolved' && (
                  <div className="space-y-6">
                    {resolvedReports.length > 0 ? (
                      <div className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Alert className="border-green-400/30 bg-green-900/20 backdrop-blur-sm shadow-xl">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <AlertDescription className="text-white">
                              <strong>✅ Cases Successfully Resolved!</strong>{' '}
                              Congratulations! These items have been
                              successfully returned to their owners.
                            </AlertDescription>
                          </Alert>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {resolvedReports.map((report, index) => (
                            <motion.div
                              key={report._id}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index, duration: 0.6 }}
                            >
                              <ModernReportCard
                                report={report}
                                isOwner={true}
                                onDelete={() => handleDeleteReport(report._id)}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Card className="bg-black border-white/20 backdrop-blur-sm shadow-xl">
                          <CardContent className="py-20 text-center">
                            <CheckCircle className="mx-auto h-20 w-20 text-white/30 mb-6" />
                            <h3 className="text-2xl font-bold mb-4 text-white">
                              No Resolved Cases
                            </h3>
                            <p className="text-white/60 text-lg max-w-md mx-auto">
                              Once you confirm matches and resolve cases,
                              they&apos;ll appear here as success stories.
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Success Popup */}
        <SuccessPopup
          isOpen={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          title={successPopupData.title}
          message={successPopupData.message}
          type={successPopupData.type}
        />
      </div>
    </div>
  );
}
