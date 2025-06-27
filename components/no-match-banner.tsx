'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Search } from 'lucide-react';

interface ModernNoMatchBannerProps {
  reportType: 'lost' | 'found';
  onNotifyMe: () => void;
}

export function ModernNoMatchBanner({
  reportType,
  onNotifyMe,
}: ModernNoMatchBannerProps) {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
            <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">
              🔍 No match yet, but we&apos;re still looking...
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              We&apos;re actively searching for{' '}
              {reportType === 'lost' ? 'someone who found' : 'the owner of'}{' '}
              your item. Check back soon!
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onNotifyMe}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
