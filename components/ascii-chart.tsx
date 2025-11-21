interface AsciiChartProps {
  percent: number
}

export default function AsciiChart({ percent }: AsciiChartProps) {
  const bars = Math.floor(percent * 20)
  const str = "█".repeat(bars).padEnd(20, "░")

  const color = percent > 0.7 ? "text-[#00ff00]" : percent < 0.3 ? "text-[#ff00ff]" : "text-[#00ffff]"

  return (
    <div className={`font-mono text-xs ${color} tracking-wider`}>
      [{str}] {Math.round(percent * 100)}%
    </div>
  )
}
