"use client"

import { motion } from "framer-motion"
import { CheckCircle, Clock, AlertTriangle, X } from "lucide-react"
import { Button } from "./ui/button"


interface MatchStatusBannerProps {
  type: "match_found" | "match_pending" | "match_confirmed" | "match_rejected"
  title: string
  message: string
  onAction?: () => void
  onDismiss?: () => void
  actionLabel?: string
}

export function MatchStatusBanner({
  type,
  title,
  message,
  onAction,
  onDismiss,
  actionLabel = "View Details",
}: MatchStatusBannerProps) {
  const getConfig = () => {
    switch (type) {
      case "match_found":
        return {
          icon: AlertTriangle,
          bgColor: "bg-gradient-to-r from-yellow-500 to-orange-500",
          iconColor: "text-white",
          textColor: "text-white",
        }
      case "match_pending":
        return {
          icon: Clock,
          bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
          iconColor: "text-white",
          textColor: "text-white",
        }
      case "match_confirmed":
        return {
          icon: CheckCircle,
          bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
          iconColor: "text-white",
          textColor: "text-white",
        }
      case "match_rejected":
        return {
          icon: X,
          bgColor: "bg-gradient-to-r from-red-500 to-pink-500",
          iconColor: "text-white",
          textColor: "text-white",
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${config.bgColor} rounded-xl p-6 shadow-lg relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative flex items-start gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex-shrink-0"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <motion.h3
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-lg font-bold ${config.textColor} mb-1`}
          >
            {title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`${config.textColor} opacity-90 text-sm leading-relaxed`}
          >
            {message}
          </motion.p>
        </div>

        <div className="flex items-center gap-2">
          {onAction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={onAction}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {actionLabel}
              </Button>
            </motion.div>
          )}

          {onDismiss && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              onClick={onDismiss}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
