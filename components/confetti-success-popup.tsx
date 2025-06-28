"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import { CheckCircle, Sparkles, Heart, Trophy, X } from "lucide-react"
import { Button } from "./ui/button"

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
  const [confettiActive, setConfettiActive] = useState(false)

  useEffect(() => {
    if (isOpen && showConfetti) {
      setConfettiActive(true)
      const timer = setTimeout(() => setConfettiActive(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, showConfetti])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "resolved":
        return <Trophy className="w-16 h-16 text-yellow-400" />
      case "matched":
        return <Sparkles className="w-16 h-16 text-blue-400" />
      case "submitted":
        return <Heart className="w-16 h-16 text-pink-400" />
      default:
        return <CheckCircle className="w-16 h-16 text-green-400" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      {confettiActive && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.3}
        />
      )}

      <div className="relative bg-black border border-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">{getIcon()}</div>

        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/80 mb-6">{message}</p>

        <Button
          onClick={onClose}
          className="w-full bg-white text-black hover:bg-white/90 font-semibold py-3 text-md"
        >
          🎉 Got it!
        </Button>
      </div>
    </div>
  )
}
