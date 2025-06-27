"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, X, Sparkles, Heart } from "lucide-react"
import { Button } from "./button"

interface SuccessPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: "resolved" | "matched" | "submitted"
}

export function SuccessPopup({ isOpen, onClose, title, message, type }: SuccessPopupProps) {
  const getIcon = () => {
    switch (type) {
      case "resolved":
        return <CheckCircle className="w-16 h-16 text-white" />
      case "matched":
        return <Sparkles className="w-16 h-16 text-white" />
      case "submitted":
        return <Heart className="w-16 h-16 text-white" />
      default:
        return <CheckCircle className="w-16 h-16 text-white" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-black border-2 border-white rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.6 }}
              className="mb-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                {getIcon()}
              </motion.div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 mb-8"
            >
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl sm:text-2xl font-bold text-white"
              >
                {title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/70 text-sm sm:text-base"
              >
                {message}
              </motion.p>
            </motion.div>

            {/* Action Button */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onClose}
                  className="w-full bg-white text-black hover:bg-white/90 font-semibold py-3"
                  size="lg"
                >
                  Continue
                </Button>
              </motion.div>
            </motion.div>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  initial={{
                    opacity: 0,
                    x: Math.random() * 400,
                    y: Math.random() * 300,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -60, -120],
                    x: [0, Math.random() * 60 - 30, Math.random() * 120 - 60],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    delay: 1 + i * 0.15,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>

            {/* Pulse Ring Effect */}
            <motion.div
              className="absolute inset-0 border-2 border-white/20 rounded-xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
