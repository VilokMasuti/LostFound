'use client';

import { FuturisticButton } from '@/components/ui/futuristic-button';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Search, Shield, Sparkles, Zap } from 'lucide-react';
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 " />

      <div style={{ width: '100%', height: '600px', position: 'relative' }}>
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

      {/* Animated Blobs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Lost Your Phone?
              </h1>
              <div className="h-16 mt-4">
                <p className="text-xl lg:text-2xl text-muted-foreground">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Our AI-powered matching system connects lost and found phones
              instantly. Secure, private, and designed to reunite you with what
              matters most.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/report">
                <FuturisticButton variant="glow" size="lg" className="group">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Report Lost/Found Phone
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </FuturisticButton>
              </Link>

              <Link href="/reports">
                <FuturisticButton variant="glass" size="lg">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Reports
                </FuturisticButton>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex gap-8 pt-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">
                  Phones Reunited
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">
                  Success Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Active Matching
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Floating Phone Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            >
              <GlassCard className="p-8 max-w-md mx-auto" glow>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">iPhone 14 Pro</h3>
                      <p className="text-sm text-muted-foreground">
                        Deep Purple
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Found near Central Park</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span>2 potential matches found</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                      <span>Owner contacted securely</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <FuturisticButton variant="outline" className="w-full">
                      View Match Details
                    </FuturisticButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our intelligent system makes reuniting with lost phones effortless
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Phone,
                title: 'Report Your Phone',
                description:
                  'Submit details about your lost or found device with photos',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Search,
                title: 'AI Matching',
                description:
                  'Our system searches for potential matches automatically',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Shield,
                title: 'Secure Contact',
                description: 'Connect safely with verified contact information',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Zap,
                title: 'Quick Reunion',
                description:
                  'Get your phone back or help someone else get theirs',
                color: 'from-orange-500 to-red-500',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.2, duration: 0.6 }}
              >
                <GlassCard className="text-center h-full" hover>
                  <motion.div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mx-auto mb-4`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
