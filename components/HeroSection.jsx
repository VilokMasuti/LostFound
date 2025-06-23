'use client';

import { FuturisticButton } from '@/components/ui/futuristic-button';
import { ArrowRight, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Beams from './ui/Beams';
import CardSwap, { Card } from './ui/CardSwap';
import FuzzyText from './ui/FuzzyText ';
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
  const hoverIntensity = 0.6;
  const enableHover = true;
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
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <Beams
          beamWidth={3}
          beamHeight={16}
          beamNumber={16}
          lightColor="#ffffff"
          speed={3}
          noiseIntensity={1.75}
          scale={0.3}
          rotation={0}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="grid lg:grid-cols-2 items-center gap-16">
          {/* Left Text Section */}
          <div className="space-y-8 ">
            <FuzzyText
              baseIntensity={0.2}
              hoverIntensity={hoverIntensity}
              enableHover={enableHover}
              fontSize={'5rem'}
              className="ml-[-4rem] bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-900 font-mono font-bold tracking-tight"
            >
              Reconnect
            </FuzzyText>

            <p className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-100   to-zinc-800  font-blod h-8">
              {displayText}
              <span className="animate-pulse ">|</span>
            </p>
            <p className="text-lg  bg-clip-text text-transparent bg-gradient-to-r from-zinc-100   to-zinc-800 uppercase  max-w-xl font-bold">
              Our system matches lost and found phones securely and quickly.
              Privacy-first, efficient, and trustworthy.
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

          {/* Right Side - CardSwap */}
          <div className="flex justify-center w-full ml-[-13rem] sm:ml-0 ">
            <div
              style={{
                height: '420px',
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
              }}
            >
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={3000}
                pauseOnHover={false}
              >
                {/* Phone */}
                <Card className="bg-gradient-to-br from-[#000000] to-[#1a1a1a] text-white border border-neutral-800 rounded-xl shadow-xl p-6 space-y-3 text-center">
                  <h3 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-100   to-zinc-950 font-semibold uppercase ">
                    Lost a Phone?
                  </h3>
                  <p className="text-sm text-gray-300">
                    Your digital life deserves a second chance. We help
                    reconnect devices to their rightful owners.
                  </p>
                  <p className="text-xs text-gray-500">
                    Match engine updating...
                  </p>
                  <Image
                    src="/LOGO-removebg-preview.png"
                    alt="Emotional Card"
                    width={500}
                    height={500}
                    className=" ml-[-1rem] mt-[-6rem] rotate-90"
                  />
                </Card>

                {/* Pet */}
                <Card className="bg-gradient-to-br from-[#000000] to-[#1a1a1a] text-white border border-neutral-800 rounded-xl shadow-xl p-6 space-y-3 text-center">
                  <h3 className="text-xl  bg-clip-text text-transparent bg-gradient-to-r from-zinc-100   to-zinc-950 font-semibold uppercase ">
                    Missing Pet
                  </h3>
                  <p className="text-sm text-gray-300">
                    Every pet has a home. We're here to bring them back to yours
                    — safely and with care.
                  </p>
                  <p className="text-xs text-gray-500">
                    Nearby sightings processed
                  </p>
                  <Image
                    src="/LOGO-removebg-preview.png"
                    alt="Emotional Card"
                    width={500}
                    height={500}
                    className=" ml-[-1rem] mt-[-6rem] rotate-90"
                  />
                </Card>

                {/* Person */}
                <Card className="bg-gradient-to-br from-[#000000] to-[#1a1a1a] text-white border border-neutral-800 rounded-xl shadow-xl p-6 space-y-3 text-center">
                  <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-zinc-800   to-zinc-100 uppercase">
                    Lost Someone Important?
                  </h3>
                  <p className="text-sm text-gray-300">
                    Beyond things — we’re helping people reunite with their
                    loved ones, one verified lead at a time.
                  </p>
                  <p className="text-xs text-gray-500">
                    Trusted leads added recently
                  </p>
                  <Image
                    src="/LOGO-removebg-preview.png"
                    alt="Emotional Card"
                    width={500}
                    height={500}
                    className=" ml-[-1rem] mt-[-6rem] rotate-90"
                  />
                </Card>

                {/* Emotional Card */}
                <Card className="bg-gradient-to-br from-[#000000] to-[#1a1a1a] text-white border border-neutral-800 rounded-xl shadow-xl p-6 space-y-3 text-center">
                  <h3 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-zinc-100   to-zinc-950 font-semibold uppercase ">
                    This is More Than Lost Items
                  </h3>
                  <p className="text-sm text-gray-300">
                    We recover what matters — phones, pets, people, and
                    sometimes, a little hope.
                  </p>
                  <p className="text-xs text-gray-500">
                    Private. Secure. Human-first.
                  </p>
                  <Image
                    src="/LOGO-removebg-preview.png"
                    alt="Emotional Card"
                    width={500}
                    height={500}
                    className=" ml-[-1rem] mt-[-6rem] rotate-90"
                  />
                </Card>
              </CardSwap>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
