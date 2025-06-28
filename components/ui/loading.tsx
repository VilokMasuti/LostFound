'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AwwwardsLoadingProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function AwwwardsLoading({
  isLoading,
  onComplete,
}: AwwwardsLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showText, setShowText] = useState(false);

  const phases = [
    'Initializing Experience',
    'Loading Assets',
    'Preparing Interface',
    'Almost Ready',
    'Welcome',
  ];

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (Math.random() * 15 + 5);

        // Update phase based on progress
        if (newProgress > 20 && currentPhase === 0) setCurrentPhase(1);
        if (newProgress > 40 && currentPhase === 1) setCurrentPhase(2);
        if (newProgress > 70 && currentPhase === 2) setCurrentPhase(3);
        if (newProgress > 90 && currentPhase === 3) setCurrentPhase(4);

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 800);
          return 100;
        }

        return newProgress;
      });
    }, 100);

    // Show text after initial animation
    setTimeout(() => setShowText(true), 1000);

    return () => clearInterval(interval);
  }, [isLoading, currentPhase, onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.1,
            filter: 'blur(20px)',
          }}
          transition={{
            duration: 1.2,
            ease: [0.76, 0, 0.24, 1],
          }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
        >
          {/* Animated Background Grid */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
                style={{
                  top: `${(i + 1) * 5}%`,
                  left: 0,
                  right: 0,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.1,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 2,
                }}
              />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`v-${i}`}
                className="absolute w-px bg-gradient-to-b from-transparent via-white to-transparent"
                style={{
                  left: `${(i + 1) * 5}%`,
                  top: 0,
                  bottom: 0,
                }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: [0, 1, 0],
                  opacity: [0, 0.2, 0],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.15,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 2.5,
                }}
              />
            ))}
          </div>

          {/* Floating Particles */}
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Main Content Container */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-8">
            {/* Logo/Brand Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 1.5,
                ease: [0.76, 0, 0.24, 1],
                type: 'spring',
                stiffness: 100,
              }}
              className="mb-12"
            >
              <div className="relative">
                {/* Outer Ring */}
                <motion.div
                  className="w-32 h-32 border-2 border-white/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  }}
                />

                {/* Inner Ring */}
                <motion.div
                  className="absolute inset-4 border border-white/40 rounded-full"
                  animate={{ rotate: -360 }}
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
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="w-4 h-4 bg-white rounded-full" />
                </motion.div>

                {/* Pulsing Glow */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-full opacity-20"
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.2, 0, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </motion.div>

            {/* Progress Bar Container */}
            <div className="w-full max-w-md mb-8">
              {/* Progress Track */}
              <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/20 to-white/5"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  }}
                />

                {/* Progress Fill */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-white via-white/90 to-white rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #ffffff 0%, #ffffff99 50%, #ffffff 100%)',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    duration: 0.5,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                />

                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-y-0 left-0 bg-white rounded-full blur-sm opacity-50"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    duration: 0.5,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                />
              </div>

              {/* Progress Percentage */}
              <motion.div
                className="flex justify-between items-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: showText ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-white/60 text-sm font-mono">
                  {Math.round(progress)}%
                </span>
                <motion.span
                  className="text-white/60 text-sm font-mono"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  {phases[currentPhase]}
                </motion.span>
              </motion.div>
            </div>

            {/* Loading Text Animation */}
            <AnimatePresence mode="wait">
              {showText && (
                <motion.div
                  key={currentPhase}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{
                    duration: 0.8,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                  className="text-center"
                >
                  <h1 className="text-4xl md:text-6xl font-bold font-serif uppercase text-white mb-4 tracking-tight">
                    <motion.span
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 3,
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
                      Reconnect
                    </motion.span>
                  </h1>

                  <motion.p
                    className="text-white/70 text-lg uppercase  font-serif  md:text-xl font-light tracking-wide"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    Hare krishna
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Decorative Elements */}
            <motion.div
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: showText ? 1 : 0 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              <div className="flex space-x-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white/40 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Corner Decorations */}
          <motion.div
            className="absolute top-8 left-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <div className="w-16 h-16 border-l-2 border-t-2 border-white/20" />
          </motion.div>

          <motion.div
            className="absolute top-8 right-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: 2.2, duration: 1 }}
          >
            <div className="w-16 h-16 border-r-2 border-t-2 border-white/20" />
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: 2.4, duration: 1 }}
          >
            <div className="w-16 h-16 border-l-2 border-b-2 border-white/20" />
          </motion.div>

          <motion.div
            className="absolute bottom-8 right-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: 2.6, duration: 1 }}
          >
            <div className="w-16 h-16 border-r-2 border-b-2 border-white/20" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
