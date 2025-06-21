'use client';

import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-md mx-auto text-center p-8">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We&apos;re sorry, but something unexpected happened. Please try again.
        </p>
        <div className="space-y-4">
          <FuturisticButton onClick={reset} variant="glow" className="w-full">
            Try again
          </FuturisticButton>
          <FuturisticButton
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="w-full"
          >
            Go home
          </FuturisticButton>
        </div>
      </GlassCard>
    </div>
  );
}
