"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"

interface StunningHomepageTitleProps {
  title: string
  subtitle?: string
  showParticles?: boolean
  animationSpeed?: "slow" | "normal" | "fast"
  colorTheme?: "white" | "gradient" | "rainbow" | "gold"
  glowEffect?: boolean
}

export function StunningHomepageTitle({
  title,
  subtitle,
  showParticles = true,
  animationSpeed = "normal",
  colorTheme = "gradient",
  glowEffect = true,
}: StunningHomepageTitleProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const speeds = {
    slow: { duration: 3, delay: 0.3 },
    normal: { duration: 2, delay: 0.2 },
    fast: { duration: 1, delay: 0.1 },
  }

  const themes = {
    white: "text-white",
    gradient: "bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent",
    rainbow:
      "bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-green-500 to-yellow-500 bg-clip-text text-transparent",
    gold: "bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent",
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const speed = speeds[animationSpeed]

  return (
    <div ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 80%, rgba(119, 255, 198, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />

      {/* Floating Particles */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                delay: Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Mouse Follower Effect */}
      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />

      <div className="text-center z-10 px-4">
        {/* Main Title */}
        <motion.h1
          className={`text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none ${themes[colorTheme]} ${
            glowEffect ? "drop-shadow-2xl" : ""
          }`}
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{
            ...(isInView ? { opacity: 1, y: 0, scale: 1 } : {}),
            ...(colorTheme === "gradient" || colorTheme === "rainbow"
              ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
              : {}),
          }}
          transition={{
            ...(colorTheme === "gradient" || colorTheme === "rainbow"
              ? {
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }
              : {
                  duration: speed.duration,
                  delay: speed.delay,
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                }),
          }}
          style={{
            backgroundSize: colorTheme === "gradient" || colorTheme === "rainbow" ? "200% 200%" : "100%",
            textShadow: glowEffect ? "0 0 40px rgba(255,255,255,0.5)" : "none",
          }}
        >
          {title.split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 50, rotateX: -90 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{
                duration: speed.duration * 0.5,
                delay: speed.delay + i * 0.05,
                type: "spring",
                stiffness: 200,
                damping: 12,
              }}
              whileHover={{
                scale: 1.2,
                rotateZ: Math.random() * 10 - 5,
                transition: { duration: 0.2 },
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className="text-xl md:text-3xl text-white/80 font-light tracking-wide mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: speed.duration * 0.8,
              delay: speed.delay + 0.5,
            }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Animated Underline */}
        <motion.div
          className="w-32 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
          transition={{
            duration: speed.duration,
            delay: speed.delay + 0.8,
          }}
        />

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + Math.sin(i) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
