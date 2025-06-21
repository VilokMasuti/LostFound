'use client';

import { HeroSection } from '@/components/HeroSection';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <HeroSection />;
}
