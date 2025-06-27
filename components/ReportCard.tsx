'use client';

import { ModernReportCard } from '@/components/modern-report-card';
import type { Report } from '@/type';

interface ReportCardProps {
  report: Report;
  showActions?: boolean;
  isOwner?: boolean;
  onMessage?: () => void;
}

export function ReportCard(props: ReportCardProps) {
  return <ModernReportCard {...props} />;
}
