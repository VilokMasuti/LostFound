/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAuth } from '@/context/AuthContext';

export type UserRole = 'owner' | 'finder' | 'anonymous';

export function useUserRole(reportUserId?: string) {
  const { user } = useAuth();

  if (!user) return 'anonymous';
  if (user._id === reportUserId) return 'owner';
  return 'finder';
}

export function useReportRole(report: any) {
  const { user } = useAuth();

  // If no user or report yet, safely return anonymous
  if (!user || !report) {
    return {
      role: 'anonymous' as const,
      canMessage: false,
      canEdit: false,
      canDelete: false,
    };
  }

  // Handle if userId is either a string or an object (populated)
  const reportUserId =
    typeof report.userId === 'string' ? report.userId : report.userId?._id;

  const isOwner = user._id === reportUserId;

  return {
    role: isOwner ? ('owner' as const) : ('finder' as const),
    canMessage: !isOwner && report.status === 'active',
    canEdit: isOwner,
    canDelete: isOwner && report.status !== 'resolved',
  };
}
