'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  errors: string[];
  onRetry?: () => void;
}

export function ErrorDialog({
  isOpen,
  onClose,
  title = 'Validation Errors',
  errors,
  onRetry,
}: ErrorDialogProps) {
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    if (isOpen && errors.length === 1) {
      // Auto-close for single errors after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      setAutoCloseTimer(timer);
    }

    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [isOpen, errors.length, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-red-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <AnimatePresence>
            {errors.map((error, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Alert className="border-red-500/30 bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/30 text-white hover:bg-white hover:text-black bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            {onRetry && (
              <Button
                onClick={onRetry}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>

          {errors.length === 1 && (
            <p className="text-xs text-center text-white/60">
              This dialog will close automatically in 5 seconds
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
