/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ReportCard } from '@/components/ReportCard';

import { AnimatedInput } from '@/components/ui/AnimatedInput';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Report } from '@/type';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Filter, Phone, Search, Sparkles } from 'lucide-react';
import { SetStateAction, useMemo, useState } from 'react';
import { useDebounce } from '../../hooks/useDebouncs';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: reports = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await fetch('/api/report');
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const filteredReports = useMemo(() => {
    return reports.filter(
      (report: {
        brand: string;
        color: string;
        location: string;
        description: string;
        type: string;
      }) => {
        const matchesSearch =
          !debouncedSearchTerm ||
          report.brand
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          report.color
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          report.location
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          report.description
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase());

        const matchesBrand = !selectedBrand || report.brand === selectedBrand;
        const matchesColor = !selectedColor || report.color === selectedColor;
        const matchesLocation =
          !selectedLocation ||
          report.location
            .toLowerCase()
            .includes(selectedLocation.toLowerCase());
        const matchesType = activeTab === 'all' || report.type === activeTab;

        return (
          matchesSearch &&
          matchesBrand &&
          matchesColor &&
          matchesLocation &&
          matchesType
        );
      }
    );
  }, [
    reports,
    debouncedSearchTerm,
    selectedBrand,
    selectedColor,
    selectedLocation,
    activeTab,
  ]);

  const uniqueBrands = [
    ...new Set(reports.map((r: { brand: any }) => r.brand)),
  ].sort();
  const uniqueColors = [
    ...new Set(reports.map((r: { color: any }) => r.color)),
  ].sort();

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedColor('');
    setSelectedLocation('');
  };

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900" />
        <FloatingParticles count={20} />

        <div className="container mx-auto px-4 py-24 relative z-10">
          <GlassCard className="text-center py-16" glow>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Phone className="h-24 w-24 text-destructive mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">
                Failed to Load Reports
              </h2>
              <p className="text-muted-foreground mb-8">
                We&apos;re having trouble loading the reports. Please try again.
              </p>
              <FuturisticButton onClick={() => refetch()} variant="glow">
                <Sparkles className="w-4 h-4 mr-2" />
                Try Again
              </FuturisticButton>
            </motion.div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900 dark:to-teal-900" />



      <div className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Browse Reports
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Search through lost and found phone reports. Use filters to narrow
            down your search and find matches.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-12"
        >
          <GlassCard className="p-8" glow>
            <div className="space-y-6">
              <div className="relative">
                <AnimatedInput
                  placeholder="Search by brand, color, location, or description..."
                  value={searchTerm}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="glass h-12">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="all">All Brands</SelectItem>
                    {uniqueBrands.map((brand) => (
                      <SelectItem key={String(brand)} value={String(brand)}>
                        {String(brand)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="glass h-12">
                    <SelectValue placeholder="All Colors" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="all">All Colors</SelectItem>
                    {uniqueColors.map((color) => (
                      <SelectItem key={String(color)} value={String(color)}>
                        {String(color)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <AnimatedInput
                  placeholder="Filter by location..."
                  value={selectedLocation}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => setSelectedLocation(e.target.value)}
                />

                <FuturisticButton
                  variant="outline"
                  onClick={clearFilters}
                  className="h-12"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </FuturisticButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'all' | 'lost' | 'found')
            }
          >
            <TabsList className="grid w-full grid-cols-3 mb-8 glass h-14">
              <TabsTrigger value="all" className="text-base">
                All Reports ({reports.length})
              </TabsTrigger>
              <TabsTrigger value="lost" className="text-base">
                Lost (
                {
                  reports.filter((r: { type: string }) => r.type === 'lost')
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="found" className="text-base">
                Found (
                {
                  reports.filter((r: { type: string }) => r.type === 'found')
                    .length
                }
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredReports.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredReports.map((report: Report, index: number) => (
                    <motion.div
                      key={report._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <ReportCard report={report} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <GlassCard className="text-center py-16" glow>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Search className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">
                      No Reports Found
                    </h3>
                    <p className="text-muted-foreground text-lg mb-6">
                      No reports found matching your criteria. Try adjusting
                      your filters or search terms.
                    </p>
                    <FuturisticButton variant="outline" onClick={clearFilters}>
                      Clear All Filters
                    </FuturisticButton>
                  </motion.div>
                </GlassCard>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
