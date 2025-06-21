"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Hide navbar and footer on auth pages
  const hideNavAndFooter = pathname === "/login" || pathname === "/register"

  if (hideNavAndFooter) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
