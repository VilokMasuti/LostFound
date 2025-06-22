"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "./ui/button"


interface NotificationBannerProps {
  type: "success" | "warning" | "info" | "error"
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
  show: boolean
}

export function NotificationBanner({ type, title, message, action, onDismiss, show }: NotificationBannerProps) {
  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          iconColor: "text-green-600 dark:text-green-400",
          textColor: "text-green-800 dark:text-green-200",
        }
      case "warning":
        return {
          icon: AlertTriangle,
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          textColor: "text-yellow-800 dark:text-yellow-200",
        }
      case "info":
        return {
          icon: Info,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          iconColor: "text-blue-600 dark:text-blue-400",
          textColor: "text-blue-800 dark:text-blue-200",
        }
      case "error":
        return {
          icon: AlertCircle,
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          iconColor: "text-red-600 dark:text-red-400",
          textColor: "text-red-800 dark:text-red-200",
        }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 mb-4`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`${config.iconColor} w-5 h-5 mt-0.5 flex-shrink-0`} />

            <div className="flex-1 min-w-0">
              <h3 className={`${config.textColor} font-medium text-sm`}>{title}</h3>
              <p className={`${config.textColor} text-sm mt-1 opacity-90`}>{message}</p>

              {action && (
                <Button variant="outline" size="sm" onClick={action.onClick} className="mt-3">
                  {action.label}
                </Button>
              )}
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className={`${config.textColor} hover:bg-black/5 dark:hover:bg-white/5 p-1 h-auto`}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
