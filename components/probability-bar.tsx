"use client"

interface ProbabilityBarProps {
  probability: number
}

export default function ProbabilityBar({ probability }: ProbabilityBarProps) {
  const percent = Math.round(probability * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">Probability</span>
        <span className="text-white font-semibold">{percent}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            probability > 0.7
              ? "bg-gradient-to-r from-green-500 to-emerald-400"
              : probability < 0.3
                ? "bg-gradient-to-r from-red-500 to-rose-400"
                : "bg-gradient-to-r from-cyan-500 to-teal-400"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
