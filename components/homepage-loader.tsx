'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HomepageLoaderProps {
  onComplete: () => void;
  brandName?: string;
  duration?: number;
}

export function HomepageLoader({
  onComplete,
  brandName = 'LostFormed',
  duration = 10000, // 10 seconds
}: HomepageLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showText, setShowText] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const phases = [
    'Initializing Experience',
    'Loading Assets',
    'Preparing Interface',
    'Optimizing Performance',
    'Almost Ready',
    'Welcome',
  ];

  useEffect(() => {
    // Show text after initial animation
    setTimeout(() => setShowText(true), 1000);

    // Progress animation - exactly 10 seconds
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (duration / 100); // Smooth increment
        const newProgress = prev + increment;

        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setIsComplete(true);
          // Complete after showing 100% for a moment
          setTimeout(() => {
            onComplete();
          }, 1000);
          return 100;
        }

        return newProgress;
      });
    }, 100);

    // Phase updates
    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => {
        if (prev < phases.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, duration / phases.length);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
    };
  }, [duration, onComplete, phases.length]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.1,
          filter: 'blur(20px)',
        }}
        transition={{
          duration: 1.5,
          ease: [0.76, 0, 0.24, 1],
        }}
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={`h-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                top: `${(i + 1) * 4}%`,
                left: 0,
                right: 0,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 4,
                delay: i * 0.1,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
              }}
            />
          ))}
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={`v-${i}`}
              className="absolute w-px bg-gradient-to-b from-transparent via-white to-transparent"
              style={{
                left: `${(i + 1) * 4}%`,
                top: 0,
                bottom: 0,
              }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 4,
                delay: i * 0.12,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3.5,
              }}
            />
          ))}
        </div>

        {/* Floating Particles */}
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
              scale: [0, Math.random() * 1.5 + 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-3xl mx-auto px-8">
          {/* Logo/Brand Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 2,
              ease: [0.76, 0, 0.24, 1],
              type: 'spring',
              stiffness: 80,
            }}
            className="mb-16"
          >
            <div className="relative">
              {/* Outer Ring */}
              <motion.div
                className="w-40 h-40 border-2 border-white/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 12,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
              />

              {/* Middle Ring */}
              <motion.div
                className="absolute inset-6 border border-white/40 rounded-full"
                animate={{ rotate: -360 }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
              />

              {/* Inner Ring */}
              <motion.div
                className="absolute inset-12 border border-white/60 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
              />

              {/* Center Dot */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              >
                <div className="w-6 h-6 bg-white rounded-full" />
              </motion.div>

              {/* Pulsing Glow */}
              <motion.div
                className="absolute inset-0 bg-white rounded-full opacity-10"
                animate={{
                  scale: [1, 2.5, 1],
                  opacity: [0.1, 0, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>

          {/* Progress Bar Container */}
          <div className="w-full max-w-lg mb-12">
            {/* Progress Track */}
            <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/25 to-white/5"
                animate={{ x: ['-100%', '100%'] }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
              />

              {/* Progress Fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progress}%`,
                  background:
                    'linear-gradient(90deg, #ffffff 0%, #ffffff99 50%, #ffffff 100%)',
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />

              {/* Glow Effect */}
              <motion.div
                className="absolute inset-y-0 left-0 bg-white rounded-full blur-sm opacity-60"
                style={{ width: `${progress}%` }}
                transition={{
                  duration: 0.3,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            </div>

            {/* Progress Info */}
            <motion.div
              className="flex justify-between items-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: showText ? 1 : 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                className="text-white/70 text-lg font-mono tabular-nums"
                animate={{
                  scale: isComplete ? [1, 1.1, 1] : 1,
                  color: isComplete ? '#ffffff' : '#ffffff99',
                }}
                transition={{ duration: 0.5 }}
              >
                {Math.round(progress)}%
              </motion.span>

              <motion.span
                className="text-white/60 text-sm font-light tracking-wide"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                {phases[currentPhase]}
              </motion.span>
            </motion.div>
          </div>

          {/* Brand Text Animation */}
          <AnimatePresence mode="wait">
            {showText && (
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
                transition={{
                  duration: 1,
                  ease: [0.76, 0, 0.24, 1],
                }}
                className="text-center"
              >
                <h1 className="text-5xl uppercase  font-serif  md:text-8xl font-bold text-white mb-6 tracking-tight">
                  <motion.span
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'linear',
                    }}
                    style={{
                      background:
                        'linear-gradient(90deg, #ffffff 0%, #ffffff66 25%, #ffffff 50%, #ffffff66 75%, #ffffff 100%)',
                      backgroundSize: '200% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {brandName}
                  </motion.span>
                </h1>

                <motion.p
                  className="text-white/80 text-xl md:text-2xl font-serif font-light  tracking-widest antialiased"
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                >
                  HARE KRISHNA
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Corner Decorations */}
        {[
          {
            position: 'top-8 left-8',
            border: 'border-l-2 border-t-2',
            delay: 2,
          },
          {
            position: 'top-8 right-8',
            border: 'border-r-2 border-t-2',
            delay: 2.2,
          },
          {
            position: 'bottom-8 left-8',
            border: 'border-l-2 border-b-2',
            delay: 2.4,
          },
          {
            position: 'bottom-8 right-8',
            border: 'border-r-2 border-b-2',
            delay: 2.6,
          },
        ].map((corner, i) => (
          <motion.div
            key={i}
            className={`absolute ${corner.position}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: corner.delay, duration: 1 }}
          >
            <div className={`w-20 h-20 ${corner.border} border-white/20`} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
