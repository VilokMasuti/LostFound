'use client';

import { FuturisticButton } from '@/components/ui/futuristic-button';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Phone, Shield, Sparkles, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import Beams from './ui/Beams';
import CardSwap, { Card } from './ui/CardSwap';

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
    <div className="relative min-h-[80vh] sm:min-h-[85vh] md:min-h-[90vh] bg-black text-white overflow-hidden">
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

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 items-center gap-6 md:gap-8 lg:gap-10">
          {/* Left Text Section */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left ml-[] md:ml-0">
            <Badge className="mx-auto lg:mx-0 mb-4 md:mb-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border-white/20 hover:bg-gradient-to-r hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 max-w-max text-xs md:text-sm">
              <Sparkles className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Powered by VILOK - STILL WORK  IN PROGRESS
            </Badge>

            <div className="space-y-3 md:space-y-4">
              <motion.h1
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 5, delay: 6 }}
                className=" bg-clip-text text-transparent bg-gradient-to-b from-neutral-50  to-neutral-800 font-bold tracking-tight sm:text-6xl leading-tight  glowing-text text-5xl md:text-7xl lg:text-8xl xl:text-9xl"
              >
                Reconnect
              </motion.h1>

              <div className="h-12 md:h-16 flex items-center justify-center lg:justify-start">
                <p className="text-base md:text-lg lg:text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 font-medium px-2 md:px-0 max-w-lg mx-auto lg:mx-0">
                  {displayText}
                  <span className="animate-pulse text-white">|</span>
                </p>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start items-center">
              <Link
                href="/report?type=lost"
                className="w-full sm:w-auto max-w-xs"
              >
                <FuturisticButton
                  variant="glow"
                  size="lg"
                  className="w-full group py-3"
                >
                  <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:animate-bounce" />
                  <span className="text-sm md:text-base">I Lost Something</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </FuturisticButton>
              </Link>
              <Link
                href="/report?type=found"
                className="w-full sm:w-auto max-w-xs"
              >
                <FuturisticButton
                  variant="outline"
                  size="lg"
                  className="w-full group py-3"
                >
                  <Heart className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:text-red-400 transition-colors" />
                  <span className="text-sm md:text-base">
                    I Found Something
                  </span>
                </FuturisticButton>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4 text-xs md:text-sm text-white/60 pt-3 md:pt-4">
              <div className="flex items-center space-x-1.5">
                <Shield className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                <span>Instant Matching</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-400" />
                <span>Community Driven</span>
              </div>
            </div>
          </div>

          {/* Right Side - CardSwap */}
          <div className="flex justify-center w-full ml-[-10rem]  sm:ml-0 sm-mt-0 mt-[6rem] mb-[10rem] ">
            <div className="relative w-full max-w-[320px] md:max-w-[400px] h-[260px] sm:h-[300px] md:h-[360px] lg:h-[420px]">
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
