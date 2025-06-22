'use client';

import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';


interface NoMatchBannerProps {
  reportType: 'lost' | 'found';
  onNotifyMe: () => void;
}

export function NoMatchBanner({ reportType, onNotifyMe }: NoMatchBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-1">
              🔍 No match yet, but we&lsquo;re still looking...
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              We&apos;re actively searching for{' '}
              {reportType === 'lost' ? 'someone who found' : 'the owner of'}{' '}
              your phone. Check back soon!
            </p>
          </div>
          <Button

            onClick={onNotifyMe}
            className="border-blue-300 text-blue-700"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
