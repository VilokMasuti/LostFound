'use client';

import { useEffect } from 'react';

export function useReportView(reportId: string | undefined) {
  useEffect(() => {
    if (!reportId) return;

    const recordView = async () => {
      try {
        await fetch(`/api/report/${reportId}/view`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to record view:', error);
      }
    };

    // Record view after a short delay to avoid spam
    const timer = setTimeout(recordView, 1000);
    return () => clearTimeout(timer);
  }, [reportId]);
}
