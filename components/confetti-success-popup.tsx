"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, X, Sparkles, Heart, Trophy } from "lucide-react"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"

interface ConfettiSuccessPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: "resolved" | "matched" | "submitted"
  showConfetti?: boolean
}

export function ConfettiSuccessPopup({
  isOpen,
  onClose,
  title,
  message,
  type,
  showConfetti = true,
}: ConfettiSuccessPopupProps) {
  const { width, height } = useWindowSize()
  const [showConfettiAnimation, setShowConfettiAnimation] = useState(false)

  useEffect(() => {
    if (isOpen && showConfetti) {
      setShowConfettiAnimation(true)
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfettiAnimation(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, showConfetti])

  const getIcon = () => {
    switch (type) {
      case "resolved":
        return <Trophy className="w-20 h-20 text-yellow-400" />
      case "matched":
        return <Sparkles className="w-20 h-20 text-blue-400" />
      case "submitted":
        return <Heart className="w-20 h-20 text-pink-400" />
      default:
        return <CheckCircle className="w-20 h-20 text-green-400" />
    }
  }

  const getGradient = () => {
    switch (type) {
      case "resolved":
        return "from-yellow-400 via-orange-500 to-red-500"
      case "matched":
        return "from-blue-400 via-purple-500 to-pink-500"
      case "submitted":
        return "from-pink-400 via-red-500 to-yellow-500"
      default:
        return "from-green-400 via-blue-500 to-purple-600"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti Animation */}
          {showConfettiAnimation && (
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
              colors={["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                type: "spring",
                bounce: 0.4,
              }}
              className="relative bg-black border-2 border-white rounded-2xl p-8 max-w-lg w-full shadow-2xl text-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Background Gradient */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-10`}
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.8,
                  type: "spring",
                  bounce: 0.6,
                }}
                className="mb-6 relative"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  {getIcon()}
                </motion.div>

                {/* Pulsing Ring */}
                <motion.div
                  className="absolute inset-0 border-4 border-white/20 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4 mb-8"
              >
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-2xl sm:text-3xl font-bold text-white"
                >
                  {title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-white/80 text-base sm:text-lg leading-relaxed"
                >
                  {message}
                </motion.p>
              </motion.div>

              {/* Action Button */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={onClose}
                    className="w-full bg-white text-black hover:bg-white/90 font-semibold py-4 text-lg"
                    size="lg"
                  >
                    🎉 Awesome!
                  </Button>
                </motion.div>
              </motion.div>

              {/* Floating Particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/40 rounded-full"
                    initial={{
                      opacity: 0,
                      x: Math.random() * 400,
                      y: Math.random() * 300,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [0, -80, -160],
                      x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 6,
                      delay: 1.5 + i * 0.2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: 4,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
