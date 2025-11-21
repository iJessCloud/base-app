import { NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol") || "BTC"
  const searchTerm = symbol.replace("-USD", "").toLowerCase()

  try {
    // Use Polymarket CLOB API (public, no auth required)
    const response = await fetch("https://clob.polymarket.com/markets?limit=100&active=true", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`)
    }

    const data = await response.json()
    const markets = Array.isArray(data) ? data : []

    // Filter markets related to the crypto symbol
    const filtered = markets
      .filter((market: any) => {
        const title = market.question?.toLowerCase() || ""
        const description = market.description?.toLowerCase() || ""
        return (
          title.includes(searchTerm) ||
          description.includes(searchTerm) ||
          title.includes("crypto") ||
          title.includes("bitcoin") ||
          title.includes("ethereum")
        )
      })
      .slice(0, 10)
      .map((market: any) => {
        const outcomePrice = market.outcomePrices ? Number.parseFloat(market.outcomePrices[0]) : 0.5
        const volume = Number.parseFloat(market.volume || "0")
        const isWhaleActivity = volume > 50000
        const isExtreme = outcomePrice > 0.85 || outcomePrice < 0.15

        return {
          id: market.condition_id || market.id || Math.random().toString(),
          title: market.question || market.description || "Unknown Market",
          volume: volume,
          probability: outcomePrice,
          outcome: market.outcomes?.[0] || "Yes",
          isAnomaly: isWhaleActivity || isExtreme,
        }
      })

    return NextResponse.json(filtered)
  } catch (error) {
    console.error("Polymarket API error:", error)
    // Return mock data as fallback
    return NextResponse.json(generateMockEvents(symbol))
  }
}

function generateMockEvents(symbol: string) {
  const crypto = symbol.replace("-USD", "")
  return [
    {
      id: "mock-1",
      title: `Will ${crypto} reach new ATH this month?`,
      volume: 125000,
      probability: 0.62,
      outcome: "Yes",
      isAnomaly: true,
    },
    {
      id: "mock-2",
      title: `${crypto} price prediction for Q4 2024`,
      volume: 89000,
      probability: 0.48,
      outcome: "Higher",
      isAnomaly: false,
    },
    {
      id: "mock-3",
      title: `Major ${crypto} ETF approval by year end?`,
      volume: 156000,
      probability: 0.73,
      outcome: "Yes",
      isAnomaly: true,
    },
  ]
}
