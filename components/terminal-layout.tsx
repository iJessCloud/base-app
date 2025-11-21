"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface TerminalLayoutProps {
  children: React.ReactNode
}

export default function TerminalLayout({ children }: TerminalLayoutProps) {
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour12: false }))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-tetsuo-bg p-2 sm:p-4 flex flex-col gap-4 relative z-10 font-mono">
      {/* Header */}
      <header className="border border-tetsuo-dim bg-tetsuo-panel p-3 flex justify-between items-center text-xs sm:text-sm">
        <div className="flex gap-4">
          <span className="text-tetsuo-pink font-bold">◉ CPU</span>
          <span className="text-white">MENU</span>
        </div>
        <div className="text-tetsuo-cyan tracking-widest font-bold neon-cyan hidden sm:block">TETSUO CORPORATION</div>
        <div className="text-right">
          <div className="text-white">{time}</div>
          <div className="text-tetsuo-green neon-green">SYS: ONLINE</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">{children}</main>

      {/* Footer */}
      <footer className="border border-tetsuo-dim bg-tetsuo-panel p-2 text-center text-xs text-tetsuo-dim">
        <span>// TETSUO TERMINAL v1.0.0 // POWERED BY VERCEL //</span>
      </footer>
    </div>
  )
}
