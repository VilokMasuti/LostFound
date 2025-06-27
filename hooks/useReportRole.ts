/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAuth } from '@/context/AuthContext';

export type UserRole = 'owner' | 'finder' | 'anonymous';

export function useUserRole(reportUserId?: string) {
  const { user } = useAuth();

  if (!user || !reportUserId) return 'anonymous';
  if (user._id === reportUserId) return 'owner';
  return 'finder';
}

export function useReportRole(report: any) {
  const { user } = useAuth();

  // Return safe defaults if no user or report
  if (!user || !report) {
    return {
      role: 'anonymous' as const,
      canMessage: false,
      canEdit: false,
      canDelete: false,
      canConfirmMatch: false,
      isOwner: false,
      isFinder: false,
    };
  }

  // Safely extract userId from report - handle both populated and non-populated cases
  let reportUserId: string | null = null;

  if (typeof report.userId === 'string') {
    reportUserId = report.userId;
  } else if (report.userId && typeof report.userId === 'object') {
    reportUserId = report.userId._id || report.userId.toString();
  }

  // If we can't determine the report owner, treat as anonymous
  if (!reportUserId) {
    return {
      role: 'anonymous' as const,
      canMessage: false,
      canEdit: false,
      canDelete: false,
      canConfirmMatch: false,
      isOwner: false,
      isFinder: false,
    };
  }

  const isOwner = user._id === reportUserId;
  const isFinder = !isOwner;

  return {
    role: isOwner ? ('owner' as const) : ('finder' as const),
    canMessage: isFinder && report.status === 'active',
    canEdit: isOwner,
    canDelete: isOwner && report.status !== 'resolved',
    canConfirmMatch: isFinder && report.status === 'active',
    isOwner,
    isFinder,
  };
}
