'use client';

import { HeroSection } from '@/components/HeroSection';
import { HomepageLoader } from '@/components/homepage-loader';
import { useState } from 'react';

export default function HomePage() {
  const [showWebsite, setShowWebsite] = useState(false);

  if (!showWebsite) {
    return (
      <HomepageLoader
        onComplete={() => setShowWebsite(true)}
        brandName="Reconnect"
        duration={5000} // Exactly 10 seconds
      />
    );
  }

  return <HeroSection />;
}
