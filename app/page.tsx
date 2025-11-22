"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { CoinbaseWS } from "@/lib/coinbase-ws"
import { Plus, TrendingUp, AlertTriangle, Activity, BarChart3, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MiniChart from "@/components/mini-chart"
import ProbabilityBar from "@/components/probability-bar"
import BroadcastSignal from "@/components/broadcast-signal"
import { useMiniAppAuth } from "@/lib/use-miniapp-auth"

interface CoinData {
  id: string
  symbol: string
  price: number
  high24h?: number
  low24h?: number
}

interface PolyEvent {
  id: string
  title: string
  volume: number
  probability: number
  outcome: string
  isAnomaly: boolean
}

export default function TetsuoTerminal() {
  const { user, isInMiniApp, isInitializing, isConnecting, deepLinkUrl, connectWallet } = useMiniAppAuth()
  const [view, setView] = useState<"watchlist" | "feed">("watchlist")
  const [watchlist, setWatchlist] = useState<CoinData[]>([
    { id: "BTC-USD", symbol: "BTC", price: 0 },
    { id: "ETH-USD", symbol: "ETH", price: 0 },
    { id: "SOL-USD", symbol: "SOL", price: 0 },
  ])
  const [activeSymbol, setActiveSymbol] = useState<string>("BTC-USD")
  const [polyEvents, setPolyEvents] = useState<PolyEvent[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const wsRef = useRef<CoinbaseWS | null>(null)

  // Connect to Coinbase WebSocket
  useEffect(() => {
    const ids = watchlist.map((c) => c.id)
    if (ids.length === 0) return

    wsRef.current = new CoinbaseWS(ids)

    const unsubscribe = wsRef.current.subscribe((data) => {
      if (data.events) {
        data.events.forEach((e: any) => {
          if (e.tickers) {
            e.tickers.forEach((t: any) => {
              setWatchlist((prev) =>
                prev.map((coin) =>
                  coin.id === t.product_id
                    ? {
                        ...coin,
                        price: Number.parseFloat(t.price),
                        high24h: t.high_24_h ? Number.parseFloat(t.high_24_h) : undefined,
                        low24h: t.low_24_h ? Number.parseFloat(t.low_24_h) : undefined,
                      }
                    : coin,
                ),
              )
            })
          }
        })
      }
    })

    return () => {
      unsubscribe()
      wsRef.current?.disconnect()
    }
  }, [])

  // Add coin to watchlist
  const addCoin = () => {
    if (!input) return
    const newId = `${input.toUpperCase()}-USD`
    if (watchlist.find((c) => c.id === newId)) {
      setInput("")
      return
    }
    const newCoin = { id: newId, symbol: input.toUpperCase(), price: 0 }
    const newList = [...watchlist, newCoin]
    setWatchlist(newList)
    wsRef.current?.updateProducts(newList.map((c) => c.id))
    setInput("")
  }

  // Fetch Polymarket data via API route
  useEffect(() => {
    const fetchPolyData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/polymarket?symbol=${activeSymbol}`)
        const data = await res.json()
        setPolyEvents(data)
      } catch (error) {
        console.error("Polymarket fetch error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPolyData()
  }, [activeSymbol])

  const activeCoin = watchlist.find((c) => c.id === activeSymbol)

  const connectionLabel = useMemo(() => {
    if (user?.username) return `@${user.username}`
    if (user?.address) return `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
    return "Connect"
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Tetsuo Terminal
            </h1>
            <Button
              variant="outline"
              size="sm"
              disabled={isConnecting || isInitializing}
              onClick={connectWallet}
              className="gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">{isConnecting ? "Connecting..." : connectionLabel}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isInMiniApp === false && (
          <div className="mb-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:grid-cols-[1.2fr,1fr]">
            <div className="space-y-2">
              <p className="text-cyan-300 font-semibold">Open in Base App</p>
              <p className="text-sm text-slate-300">
                Connect your Farcaster account by opening this miniapp inside Base App. Use the deep link below or scan the QR
                code to launch it.
              </p>
              {deepLinkUrl && (
                <Button
                  asChild
                  className="mt-2 w-fit bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                >
                  <a href={`https://warpcast.com/~/link?url=${encodeURIComponent(deepLinkUrl)}`} target="_blank" rel="noreferrer">
                    Open in Farcaster
                  </a>
                </Button>
              )}
            </div>
            {deepLinkUrl && (
              <div className="flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(deepLinkUrl)}`}
                  alt="Scan to open in Base App"
                  className="rounded-lg border border-slate-800 bg-white p-2"
                />
              </div>
            )}
          </div>
        )}
        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === "watchlist" ? "default" : "outline"}
            onClick={() => setView("watchlist")}
            className={
              view === "watchlist"
                ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700"
            }
          >
            <Activity className="w-4 h-4 mr-2" />
            Watchlist
          </Button>
          <Button
            variant={view === "feed" ? "default" : "outline"}
            onClick={() => setView("feed")}
            className={
              view === "feed"
                ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white"
                : "bg-slate-800 border-slate-700 hover:bg-slate-700"
            }
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Intelligence Feed
          </Button>
        </div>

        {/* Watchlist View */}
        {view === "watchlist" && (
          <div className="space-y-4">
            {/* Add Coin */}
            <div className="gradient-card rounded-xl p-4 glow-cyan">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCoin()}
                  placeholder="Add crypto (BTC, ETH, SOL...)"
                  className="flex-1 bg-slate-900 border-slate-700 focus:border-cyan-500"
                />
                <Button
                  onClick={addCoin}
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Watchlist Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((coin) => (
                <div
                  key={coin.id}
                  onClick={() => {
                    setActiveSymbol(coin.id)
                    setView("feed")
                  }}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 cursor-pointer hover:border-cyan-500 hover:glow-cyan transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center font-bold">
                        {coin.symbol[0]}
                      </div>
                      <span className="text-lg font-semibold">{coin.symbol}</span>
                    </div>
                    <Activity className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent tabular-nums">
                    {coin.price > 0 ? `$${coin.price.toFixed(2)}` : "---"}
                  </div>
                  {coin.price > 0 && (
                    <div className="mt-4">
                      <MiniChart price={coin.price} high24h={coin.high24h} low24h={coin.low24h} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Intelligence Feed View */}
        {view === "feed" && (
          <div className="space-y-6">
            {/* Active Coin Header */}
            {activeCoin && (
              <div className="gradient-card rounded-xl p-6 glow-teal">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center text-xl font-bold">
                      {activeCoin.symbol[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{activeCoin.symbol} Intelligence</h2>
                      <p className="text-slate-400 text-sm">Polymarket predictions and market insights</p>
                    </div>
                  </div>
                  {activeCoin.price > 0 && <BroadcastSignal symbol={activeCoin.symbol} price={activeCoin.price} />}
                </div>
                {activeCoin.price > 0 && (
                  <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent tabular-nums">
                    ${activeCoin.price.toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {/* Polymarket Events */}
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-20">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-slate-400">Scanning markets...</p>
                </div>
              )}

              {!loading && polyEvents.length === 0 && (
                <div className="text-center py-20">
                  <BarChart3 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400">No market data available</p>
                  <p className="text-slate-500 text-sm mt-2">Try a different symbol</p>
                </div>
              )}

              {!loading &&
                polyEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-lg font-semibold leading-relaxed flex-1">{evt.title}</h3>
                      {evt.isAnomaly && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-semibold whitespace-nowrap">
                          <AlertTriangle className="w-3 h-3" />
                          Anomaly
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-slate-400 text-xs mb-1">Outcome</div>
                        <div className="text-cyan-400 font-semibold">{evt.outcome}</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="text-slate-400 text-xs mb-1">Volume</div>
                        <div className="text-teal-400 font-semibold">${evt.volume.toLocaleString()}</div>
                      </div>
                    </div>

                    <ProbabilityBar probability={evt.probability} />

                    <div className="mt-4">
                      <Button
                        asChild
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                      >
                        <a href="https://polymarket.com" target="_blank" rel="noopener noreferrer">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Trade on Polymarket
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
