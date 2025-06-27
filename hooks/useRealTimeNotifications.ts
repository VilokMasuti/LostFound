/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useRealTimeNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const lastCheckRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout>(null);

  const checkNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/notifications?since=${lastCheckRef.current.toISOString()}`
      );

      if (response.ok) {
        const notifications = await response.json();

        notifications.forEach((notification: any) => {
          // Show toast based on notification type
          switch (notification.type) {
            case 'match_found':
              toast.success('🎯 Match Found!', {
                description: notification.message,
                duration: 8000,
                action: {
                  label: 'View Match',
                  onClick: () => router.push('/dashboard?tab=matches'),
                },
              });
              break;

            case 'match_confirmed':
              toast.success('✅ Match Confirmed!', {
                description: notification.message,
                duration: 8000,
                action: {
                  label: 'View Details',
                  onClick: () => router.push('/dashboard?tab=matches'),
                },
              });
              break;

            case 'case_resolved':
              toast.success('🎉 Case Resolved!', {
                description: notification.message,
                duration: 10000,
              });
              break;

            case 'new_report':
              toast.info(`📱 New ${notification.data?.type} phone reported`, {
                description: `${notification.data?.brand} ${notification.data?.color} near ${notification.data?.location}`,
                duration: 6000,
                action: {
                  label: 'Browse Reports',
                  onClick: () => router.push('/reports'),
                },
              });
              break;

            default:
              toast.info(notification.title, {
                description: notification.message,
                duration: 5000,
              });
          }
        });

        lastCheckRef.current = new Date();
      }
    } catch (error) {
      console.error('Failed to check notifications:', error);
    }
  }, [user?.id, router]);

  useEffect(() => {
    if (!user?.id) return;

    // Check immediately
    checkNotifications();

    // Then check every 15 seconds
    intervalRef.current = setInterval(checkNotifications, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user?.id, checkNotifications]);

  return { checkNotifications };
}
