'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from './ui/badge';

interface ResolvedStatusIndicatorProps {
  status: 'active' | 'resolved' | 'expired';
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ResolvedStatusIndicator({
  status,
  className,
  showIcon = true,
  size = 'md',
}: ResolvedStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'resolved':
        return {
          label: 'Resolved',
          icon: CheckCircle,
          variant: 'default' as const,
          className:
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border-green-200 dark:border-green-800',
        };
      case 'active':
        return {
          label: 'Active',
          icon: Clock,
          variant: 'secondary' as const,
          className:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border-blue-200 dark:border-blue-800',
        };
      case 'expired':
        return {
          label: 'Expired',
          icon: AlertCircle,
          variant: 'outline' as const,
          className:
            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200 border-gray-200 dark:border-gray-800',
        };
      default:
        return {
          label: 'Unknown',
          icon: AlertCircle,
          variant: 'outline' as const,
          className:
            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200 border-gray-200 dark:border-gray-800',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        sizeClasses[size],
        'flex items-center gap-1.5 font-medium',
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}
