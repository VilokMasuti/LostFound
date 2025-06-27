"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface NotificationIconProps {
  icon: React.ReactNode
  count: number
  label: string
  onClick?: () => void
  color?: "blue" | "green" | "red" | "yellow" | "purple"
}

export function NotificationIcon({ icon, count, label, onClick, color = "blue" }: NotificationIconProps) {
  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "text-green-500 hover:text-green-400 hover:bg-green-500/10"
      case "red":
        return "text-red-500 hover:text-red-400 hover:bg-red-500/10"
      case "yellow":
        return "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
      case "purple":
        return "text-purple-500 hover:text-purple-400 hover:bg-purple-500/10"
      default:
        return "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
    }
  }

  const getBadgeColor = () => {
    switch (color) {
      case "green":
        return "bg-green-500 text-white"
      case "red":
        return "bg-red-500 text-white"
      case "yellow":
        return "bg-yellow-500 text-black"
      case "purple":
        return "bg-purple-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`relative p-3 rounded-full transition-all duration-200 ${getColorClasses()}`}
          >
            <motion.div
              animate={
                count > 0
                  ? {
                      scale: [1, 1.1, 1],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: count > 0 ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
            >
              {icon}
            </motion.div>

            {count > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
                <Badge
                  className={`h-6 w-6 p-0 text-xs flex items-center justify-center ${getBadgeColor()} animate-pulse`}
                >
                  <motion.span
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    {count > 99 ? "99+" : count}
                  </motion.span>
                </Badge>
              </motion.div>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
