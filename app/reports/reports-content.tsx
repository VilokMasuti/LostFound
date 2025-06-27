/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { CustomMessageDialog } from '@/components/CustomMessageDialog';
import { EnhancedEmptyState } from '@/components/enhanced-empty-state';
import { ModernReportCard } from '@/components/modern-report-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebouncs';
import { useGlobalReportNotifications } from '@/hooks/useGlobalReportNotifications';
import type { FrontendReport } from '@/type';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle,
  Clock,
  Filter,
  Grid,
  List,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export default function ReportsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'all';

  const [reports, setReports] = useState<FrontendReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>(
    initialType as any
  );
  const [selectedReport, setSelectedReport] = useState<FrontendReport | null>(
    null
  );
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newReportsCount, setNewReportsCount] = useState(0);
  const [lastReportCount, setLastReportCount] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Enable global report notifications
  useGlobalReportNotifications();

  const fetchReports = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    setRefreshing(true);

    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedType !== 'all') params.append('type', selectedType);

      const url = `/api/report/search?${params.toString()}`;
      console.log('🔍 Fetching reports from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('✅ Fetched reports:', data.length);

      const validReports = data.filter(
        (report: any) =>
          report && report._id && report.brand && report.color && report.type
      );

      // Check for new reports
      if (lastReportCount > 0 && validReports.length > lastReportCount) {
        const newCount = validReports.length - lastReportCount;
        setNewReportsCount(newCount);

        if (silent) {
          toast.success(
            `📱 ${newCount} new report${newCount > 1 ? 's' : ''} found!`,
            {
              duration: 4000,
              style: {
                background: '#111111',
                color: '#FFFFFF',
                border: '1px solid #333333',
              },
              icon: <Bell className="w-4 h-4" />,
            }
          );
        }
      }

      setReports(validReports);
      setLastReportCount(validReports.length);
      setLastRefresh(new Date());
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);

      if (!silent) {
        toast.error(`Failed to load reports: ${errorMessage}`, {
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
  };

  useEffect(() => {
    fetchReports();
  }, [debouncedSearchTerm, selectedType]);

  // Auto-refresh every 30 seconds for new reports with real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchReports(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [debouncedSearchTerm, selectedType]);

  const handleManualRefresh = () => {
    setNewReportsCount(0); // Reset new reports indicator
    fetchReports();
    toast.success('Refreshing reports...', {
      duration: 2000,
      style: {
        background: '#111111',
        color: '#FFFFFF',
        border: '1px solid #333333',
      },
    });
  };

  // FIXED: Report deletion handler for reports page
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

      // Remove from local state immediately
      setReports((prev) => prev.filter((r) => r._id !== reportId));

      // Refresh data
      fetchReports(true);
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

  const handleMessageClick = (report: FrontendReport) => {
    if (!user) {
      toast.error('Please login to send messages', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
      });
      return;
    }

    if (!report || !report._id || !report.brand || !report.color) {
      toast.error('Report data is incomplete', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
      });
      return;
    }

    if (report.userId === user._id) {
      toast.error('You cannot message your own report', {
        style: {
          background: '#111111',
          color: '#FFFFFF',
          border: '1px solid #333333',
        },
      });
      return;
    }

    console.log('Opening message dialog for report:', report);
    setSelectedReport(report);
    setShowMessageDialog(true);
  };

  const getUserRole = (
    report: FrontendReport
  ): 'owner' | 'finder' | 'anonymous' => {
    if (!user) return 'anonymous';
    if (report.userId === user._id) return 'owner';
    return 'finder';
  };

  // Filter and categorize reports
  const activeReports = reports.filter((r) => r.status === 'active');
  const resolvedReports = reports.filter((r) => r.status === 'resolved');
  const lostReports = reports.filter((r) => r.type === 'lost');
  const foundReports = reports.filter((r) => r.type === 'found');
  const displayReports =
    selectedType === 'all'
      ? reports
      : selectedType === 'lost'
      ? lostReports
      : foundReports;

  // Stats for all reports with real-time indicators
  const stats = {
    total: reports.length,
    active: activeReports.length,
    resolved: resolvedReports.length,
    lost: lostReports.length,
    found: foundReports.length,
    recentlyAdded: reports.filter((r) => {
      const reportDate = new Date(r.createdAt || r.dateLostFound);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return reportDate > oneDayAgo;
    }).length,
    newReports: newReportsCount,
  };

  const lostUsers = new Set(
    lostReports
      .filter((r) => r.user && r.userId !== user?._id)
      .map((r) => r.user?.name)
      .filter(Boolean)
  );

  const foundUsers = new Set(
    foundReports
      .filter((r) => r.user && r.userId !== user?._id)
      .map((r) => r.user?.name)
      .filter(Boolean)
  );

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
            <RefreshCw className="h-16 w-16 text-white mx-auto" />
          </motion.div>
          <p className="text-white text-xl font-medium">Loading reports...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4 text-white">
            Failed to Load Reports
          </h2>
          <p className="text-white/60 mb-6">{error}</p>
          <Button
            onClick={() => fetchReports()}
            disabled={refreshing}
            className="bg-white text-black hover:bg-white/90"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container py-8">
        {/* Modern Header with Real-time Updates */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="bg-clip-text text-transparent bg-gradient-to-b from-neutral-50  to-neutral-800 font-bold tracking-tight sm:text-6xl leading-tight  glowing-text text-5xl md:text-6xl lg:text-6xl xl:text-xl gap-3 break-words">
                Browse Reports
                {newReportsCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                  >
                    <Badge className="bg-red-500 text-white border-red-400 animate-pulse whitespace-nowrap px-2 py-1 text-xs sm:text-sm">
                      +{newReportsCount} New
                    </Badge>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    />
                  </motion.div>
                )}
              </h1>
              <p className="text-white/60 text-base sm:text-lg break-words">
                Find lost phones or help return found devices
              </p>
            </div>
            <div className="flex flex-col gap-4 items-start sm:items-end">
              <div className="text-left sm:text-right text-xs sm:text-sm gap-1.5 text-white/60">
                <p>Last updated: {lastRefresh.toLocaleTimeString()}</p>
                {stats.recentlyAdded > 0 && (
                  <p className="text-green-400 font-medium flex items-center gap-1 flex-wrap">
                    <Sparkles className="h-3 w-3" />
                    🆕 {stats.recentlyAdded} new report
                    {stats.recentlyAdded > 1 ? 's' : ''} today
                  </p>
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={refreshing}
                  className="border-white/30 text-white hover:bg-white hover:text-black bg-transparent relative w-full sm:w-auto"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      refreshing ? 'animate-spin' : ''
                    }`}
                  />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                  {newReportsCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black"
                    />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* New Reports Alert with Enhanced UI */}
          <AnimatePresence>
            {stats.recentlyAdded > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="mb-6"
              >
                <Alert className="border-green-400/30 bg-green-900/20 backdrop-blur-sm shadow-xl">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  ></motion.div>
                  <AlertDescription className="text-white flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Bell className="h-4 w-4 text-green-400 animate-pulse duration-1000" />
                      <strong>
                        {stats.recentlyAdded} new report
                        {stats.recentlyAdded > 1 ? 's' : ''} added today!
                      </strong>{' '}
                      <span className="whitespace-nowrap">
                        Check if any match your lost or found device.
                      </span>
                    </div>
                    {newReportsCount > 0 && (
                      <Badge className="bg-red-500 text-white animate-pulse px-2 py-1 text-xs sm:text-sm whitespace-nowrap mt-2 sm:mt-0">
                        {newReportsCount} Unread
                      </Badge>
                    )}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Stats Cards with Real-time Indicators */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {[
            {
              title: 'Total Reports',
              value: stats.total,
              icon: Phone,
              hasUpdate: newReportsCount > 0,
            },
            { title: 'Active Cases', value: stats.active, icon: Clock },
            { title: 'Resolved', value: stats.resolved, icon: CheckCircle },
            { title: 'Lost Phones', value: stats.lost, icon: Search },
            { title: 'Found Phones', value: stats.found, icon: UserCheck },
            {
              title: 'New Today',
              value: stats.recentlyAdded,
              icon: Sparkles,
              hasUpdate: stats.recentlyAdded > 0,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{
                y: -8,
                scale: 1.05,
                transition: { type: 'spring', stiffness: 400, damping: 25 },
              }}
              className="relative group"
            >
              <Card className="relative overflow-hidden bg-black border-white/20 hover:border-white/40 transition-all duration-500 backdrop-blur-sm shadow-2xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/80 group-hover:text-white transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                  <div className="relative">
                    <stat.icon className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-300" />
                    {/* Real-time update indicator */}
                    {stat.hasUpdate && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                          className="w-full h-full bg-red-500 rounded-full"
                        />
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300 flex items-center gap-2">
                    {stat.value}
                    {stat.hasUpdate && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-red-400 text-sm"
                      >
                        🔴
                      </motion.span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* User Badges Section */}
        {(lostUsers.size > 0 || foundUsers.size > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {lostUsers.size > 0 && (
              <Card className="bg-black border-white/20 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    People Looking for Phones ({lostUsers.size})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(lostUsers)
                      .slice(0, 10)
                      .map((userName, index) => (
                        <Badge
                          key={index}
                          variant="destructive"
                          className="text-xs bg-red-500/20 text-red-300 border-red-400/30"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {userName}
                        </Badge>
                      ))}
                    {lostUsers.size > 10 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-white/30 text-white/70"
                      >
                        +{lostUsers.size - 10} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {foundUsers.size > 0 && (
              <Card className="bg-black border-white/20 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    People Who Found Phones ({foundUsers.size})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(foundUsers)
                      .slice(0, 10)
                      .map((userName, index) => (
                        <Badge
                          key={index}
                          variant="default"
                          className="text-xs bg-green-500/20 text-green-300 border-green-400/30"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          {userName}
                        </Badge>
                      ))}
                    {foundUsers.size > 10 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-white/30 text-white/70"
                      >
                        +{foundUsers.size - 10} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Modern Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-black border-white/20 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <Input
                    placeholder="Search by brand, color, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/50 border-white/20 text-white placeholder:text-white/40 focus:border-white/40"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedType === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('all')}
                    className={
                      selectedType === 'all'
                        ? 'bg-white text-black'
                        : 'border-white/30 text-white hover:bg-white hover:text-black bg-transparent'
                    }
                  >
                    All ({stats.total})
                  </Button>
                  <Button
                    variant={
                      selectedType === 'lost' ? 'destructive' : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedType('lost')}
                    className={
                      selectedType === 'lost'
                        ? 'bg-red-600 text-white'
                        : 'border-white/30 text-white hover:bg-red-600 hover:text-white bg-transparent'
                    }
                  >
                    Lost ({stats.lost})
                  </Button>
                  <Button
                    variant={selectedType === 'found' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType('found')}
                    className={
                      selectedType === 'found'
                        ? 'bg-green-600 text-white'
                        : 'border-white/30 text-white hover:bg-green-600 hover:text-white bg-transparent'
                    }
                  >
                    Found ({stats.found})
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={
                      viewMode === 'grid'
                        ? 'bg-white text-black'
                        : 'border-white/30 text-white hover:bg-white hover:text-black bg-transparent'
                    }
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={
                      viewMode === 'list'
                        ? 'bg-white text-black'
                        : 'border-white/30 text-white hover:bg-white hover:text-black bg-transparent'
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reports Grid/List with Real-time Updates and Delete Buttons */}
        {displayReports.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            <AnimatePresence>
              {displayReports.map((report, index) => (
                <motion.div
                  key={report._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.1 * index }}
                  layout
                >
                  <ModernReportCard
                    report={report}
                    showActions={true}
                    isOwner={report.userId === user?._id}
                    onMessage={() => handleMessageClick(report)}
                    onDelete={() => handleDeleteReport(report._id)}
                    userRole={getUserRole(report)}
                    showDeleteButton={report.userId === user?._id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <EnhancedEmptyState
              icon={Search}
              title={
                searchTerm
                  ? 'No reports found'
                  : selectedType === 'lost'
                  ? 'No lost phone reports'
                  : selectedType === 'found'
                  ? 'No found phone reports'
                  : 'No reports available'
              }
              description={
                searchTerm
                  ? `No reports match "${searchTerm}". Try different keywords.`
                  : selectedType === 'lost'
                  ? 'No one has reported a lost phone yet. Be the first to help!'
                  : selectedType === 'found'
                  ? 'No found phones reported yet. Check back later!'
                  : 'No reports available. Be the first to submit one!'
              }
              actionLabel={searchTerm ? 'Clear Search' : 'Submit Report'}
              actionHref={searchTerm ? undefined : '/report'}
              onAction={searchTerm ? () => setSearchTerm('') : undefined}
            />
          </motion.div>
        )}

        {/* Message Dialog */}
        {selectedReport && (
          <CustomMessageDialog
            report={{
              ...selectedReport,
              dateLostFound:
                typeof selectedReport.dateLostFound === 'string'
                  ? selectedReport.dateLostFound
                  : selectedReport.dateLostFound?.toISOString?.() ?? '',
              expiresAt:
                typeof selectedReport.expiresAt === 'string'
                  ? selectedReport.expiresAt
                  : selectedReport.expiresAt?.toISOString?.(),
              createdAt:
                typeof selectedReport.createdAt === 'string'
                  ? selectedReport.createdAt
                  : selectedReport.createdAt?.toISOString?.() ?? '',
              updatedAt:
                typeof selectedReport.updatedAt === 'string'
                  ? selectedReport.updatedAt
                  : selectedReport.updatedAt?.toISOString?.() ?? '',
            }}
            onMessageSent={() => {
              toast.success('Message sent successfully!', {
                style: {
                  background: '#111111',
                  color: '#FFFFFF',
                  border: '1px solid #333333',
                },
              });
            }}
          />
        )}
      </div>
    </div>
  );
}
