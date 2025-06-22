"use client"

import { motion } from "framer-motion"
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react"

interface StatusIndicatorProps {
  status: "active" | "matched" | "pending" | "resolved" | "expired"
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function StatusIndicator({ status, size = "md", showText = true }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          icon: Clock,
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          text: "Active",
          pulse: true,
        }
      case "matched":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bg: "bg-green-500/10",
          text: "Matched",
          pulse: false,
        }
      case "pending":
        return {
          icon: AlertCircle,
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
          text: "Pending",
          pulse: true,
        }
      case "resolved":
        return {
          icon: CheckCircle,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          text: "Resolved",
          pulse: false,
        }
      case "expired":
        return {
          icon: XCircle,
          color: "text-red-500",
          bg: "bg-red-500/10",
          text: "Expired",
          pulse: false,
        }
      default:
        return {
          icon: Clock,
          color: "text-gray-500",
          bg: "bg-gray-500/10",
          text: "Unknown",
          pulse: false,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`${config.bg} ${sizeClasses[size]} rounded-full flex items-center justify-center`}
        animate={config.pulse ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <Icon className={`${config.color} ${size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"}`} />
      </motion.div>
      {showText && (
        <span className={`font-medium ${config.color} ${size === "sm" ? "text-xs" : "text-sm"}`}>{config.text}</span>
      )}
    </div>
  )
}
