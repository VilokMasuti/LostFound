'use client';

import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { ArrowRight, Phone, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Beams from './ui/Beams';

const typewriterTexts = [
  'Reuniting people with their lost phones.',
  'Smart matching technology at work.',
  'Secure and private communication.',
  "Your phone's journey back home starts here.",
];

export function HeroSection() {
  const [currentText, setCurrentText] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = typewriterTexts[currentText];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(text.substring(0, displayText.length + 1));
          if (displayText === text) {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          setDisplayText(text.substring(0, displayText.length - 1));
          if (displayText === '') {
            setIsDeleting(false);
            setCurrentText((prev) => (prev + 1) % typewriterTexts.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentText]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Full-screen beams background */}
      <div className="absolute inset-0 z-0  w-full h-full overflow-hidden">
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={0}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="grid lg:grid-cols-2 items-center gap-16">
          {/* Left Side Text */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Lost Your Phone?
            </h1>
            <p className="text-xl text-gray-300 h-8">
              {displayText}
              <span className="animate-pulse">|</span>
            </p>
            <p className="text-lg text-gray-400 max-w-xl">
              Our AI-powered system matches lost and found phones securely and
              quickly. Privacy-first, efficient, and trustworthy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/report">
                <FuturisticButton variant="glow" size="lg">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Report Lost/Found
                </FuturisticButton>
              </Link>
              <Link href="/reports">
                <FuturisticButton variant="outline" size="lg">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Reports
                </FuturisticButton>
              </Link>
            </div>
          </div>

          {/* Right Side Phone Card */}
          <div className="flex justify-center">
            <GlassCard className="p-8 w-full max-w-md" glow>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">iPhone 14 Pro</h3>
                  <p className="text-sm text-gray-400">Deep Purple</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <p>📍 Found near Central Park</p>
                <p>🔍 2 potential matches</p>
                <p>🔒 Owner contacted securely</p>
              </div>
              <div className="pt-6">
                <FuturisticButton variant="outline" className="w-full">
                  View Match Details
                </FuturisticButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
