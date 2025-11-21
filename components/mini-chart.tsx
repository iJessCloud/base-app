"use client"

import { useMemo } from "react"

interface MiniChartProps {
  price: number
  high24h?: number
  low24h?: number
}

export default function MiniChart({ price, high24h, low24h }: MiniChartProps) {
  const data = useMemo(() => {
    // Generate simple price trend visualization
    const points = 20
    const variance = price * 0.05
    return Array.from({ length: points }, (_, i) => {
      const factor = Math.sin(i * 0.5) * 0.5 + 0.5
      return price * (0.95 + factor * 0.1)
    })
  }, [price])

  const max = Math.max(...data, high24h || price)
  const min = Math.min(...data, low24h || price)
  const range = max - min || 1

  return (
    <div className="space-y-3">
      {/* Chart */}
      <div className="h-24 flex items-end gap-[2px] bg-gradient-to-t from-teal-950/20 to-transparent rounded-lg p-2">
        {data.map((value, i) => {
          const height = ((value - min) / range) * 100
          return (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-teal-400 to-cyan-300 rounded-sm transition-all"
              style={{ height: `${height}%` }}
            />
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-900/50 rounded-lg p-2">
          <div className="text-slate-400 text-[10px]">24H HIGH</div>
          <div className="text-green-400 font-semibold tabular-nums">
            ${high24h ? high24h.toFixed(2) : (price * 1.05).toFixed(2)}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2">
          <div className="text-slate-400 text-[10px]">24H LOW</div>
          <div className="text-red-400 font-semibold tabular-nums">
            ${low24h ? low24h.toFixed(2) : (price * 0.95).toFixed(2)}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2">
          <div className="text-slate-400 text-[10px]">CURRENT</div>
          <div className="text-cyan-400 font-semibold tabular-nums">${price.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
