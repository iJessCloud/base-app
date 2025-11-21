"use client"

import { useState } from "react"
import { Radio, Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface BroadcastSignalProps {
  symbol: string
  price: number
}

export default function BroadcastSignal({ symbol, price }: BroadcastSignalProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://galactai.me?symbol=${symbol}&price=${price}`
  const shareText = `🚨 TETSUO SIGNAL 🚨\n\n${symbol}: $${price.toFixed(2)}\n\nTrack real-time crypto intelligence at Tetsuo Terminal\n\n${shareUrl}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Tetsuo Terminal Signal",
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {
      handleCopy()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white font-semibold"
          size="sm"
        >
          <Radio className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Broadcast Signal</span>
          <span className="sm:hidden">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Broadcast Signal
          </DialogTitle>
          <DialogDescription className="text-slate-400">Share this intelligence signal on Farcaster</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Signal Preview */}
          <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50">
            <div className="text-fuchsia-400 mb-2 font-semibold">🚨 TETSUO SIGNAL 🚨</div>
            <div className="text-white text-2xl font-bold mb-2">
              {symbol}: ${price.toFixed(2)}
            </div>
            <div className="text-slate-400 text-sm">Track real-time crypto intelligence at Tetsuo Terminal</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleCopy} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <div className="text-slate-500 text-xs text-center">Viral signal protocol active</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
