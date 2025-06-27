'use client';

import { useAuth } from '@/context/AuthContext';
import { useGlobalReportNotifications } from '@/hooks/useGlobalReportNotifications';
import { useMatchNotifications } from '@/hooks/useMatchNotifications';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useCallback, useEffect, useState } from 'react';

// Simple notifications checker that only runs on manual trigger
export function NotificationsChecker() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Only check notifications once when component mounts
  useEffect(() => {
    if (user) {
      checkNotifications();
    }
  }, [user]); // Remove checkNotifications from dependencies to prevent loops

  useRealTimeNotifications();
  useMatchNotifications();
  useGlobalReportNotifications();

  return null; // This component doesn't render anything
}
