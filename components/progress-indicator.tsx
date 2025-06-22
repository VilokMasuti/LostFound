"use client"

import { motion } from "framer-motion"
import { Upload, CheckCircle, Loader2 } from "lucide-react"

interface ProgressIndicatorProps {
  stage: "uploading" | "processing" | "matching" | "complete"
  progress?: number
}

export function ProgressIndicator({ stage, progress = 0 }: ProgressIndicatorProps) {
  const stages = [
    { id: "uploading", label: "Uploading image...", icon: Upload },
    { id: "processing", label: "Processing report...", icon: Loader2 },
    { id: "matching", label: "Finding matches...", icon: Loader2 },
    { id: "complete", label: "Complete!", icon: CheckCircle },
  ]

  const currentStageIndex = stages.findIndex((s) => s.id === stage)
  const CurrentIcon = stages[currentStageIndex]?.icon || Loader2

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-background/95 backdrop-blur-sm rounded-xl p-8 max-w-sm w-full mx-4 text-center">
        <motion.div
          animate={stage !== "complete" ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: stage !== "complete" ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
          className="mb-6"
        >
          <CurrentIcon className={`w-16 h-16 mx-auto ${stage === "complete" ? "text-green-500" : "text-primary"}`} />
        </motion.div>

        <h3 className="text-lg font-semibold mb-2">{stages[currentStageIndex]?.label || "Processing..."}</h3>

        {progress > 0 && stage !== "complete" && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {stage === "uploading" && "Please wait while we upload your image..."}
          {stage === "processing" && "We're processing your report details..."}
          {stage === "matching" && "Searching our database for potential matches..."}
          {stage === "complete" && "Your report has been submitted successfully!"}
        </p>
      </div>
    </motion.div>
  )
}
