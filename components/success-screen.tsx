"use client"

import { motion } from "framer-motion"
import { CheckCircle, Heart, ArrowRight, Sparkles } from "lucide-react"


import {Card} from "./ui/card"
import { Button } from "./ui/button"
interface SuccessScreenProps {
  type: "lost" | "found"
  onContinue: () => void
  matchCount?: number
}

export function SuccessScreen({ type, onContinue, matchCount = 0 }: SuccessScreenProps) {
  const isLost = type === "lost"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <Card className="max-w-md w-full text-center p-8" >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
          className="mb-6"
        >
          {isLost ? (
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4">{isLost ? "✅ Your report is live!" : "❤️ Thank you for helping!"}</h2>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {isLost ? (
              <>
                We&apos;ve published your lost phone report and started searching for matches.
                {matchCount > 0 ? (
                  <span className="block mt-2 text-primary font-medium">
                    🎯 Great news! We found {matchCount} potential match{matchCount > 1 ? "es" : ""}!
                  </span>
                ) : (
                  <span className="block mt-2">We&apos;ll notify you immediately if we find a match.</span>
                )}
              </>
            ) : (
              <>
                Your found phone report has been submitted successfully. We&apos;ll let the owner know right away!
                {matchCount > 0 && (
                  <span className="block mt-2 text-primary font-medium">
                    🎯 We found {matchCount} potential owner{matchCount > 1 ? "s" : ""}!
                  </span>
                )}
              </>
            )}
          </p>

          {matchCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6"
            >
              <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-sm text-primary font-medium">
                Check your dashboard to review the match{matchCount > 1 ? "es" : ""}!
              </p>
            </motion.div>
          )}

          <Button onClick={onContinue}  className="w-full">
            <ArrowRight className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  )
}
