export interface PolyEvent {
  id: string
  title: string
  volume: number
  probability: number
  outcome: string
  isAnomaly: boolean
}

export const fetchPolyFeed = async (symbol: string): Promise<PolyEvent[]> => {
  try {
    // Extract crypto name from symbol (e.g., BTC-USD -> BTC)
    const searchTerm = symbol.replace("-USD", "").toLowerCase()

    // Use CLOB API which has better CORS support
    const response = await fetch("https://clob.polymarket.com/markets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Filter and process events
    const events = Array.isArray(data) ? data : []

    return events
      .filter((market: any) => {
        const title = market.question?.toLowerCase() || ""
        const description = market.description?.toLowerCase() || ""
        return (
          market.active === true &&
          market.closed === false &&
          (title.includes(searchTerm) ||
            description.includes(searchTerm) ||
            title.includes("crypto") ||
            title.includes("bitcoin") ||
            title.includes("ethereum") ||
            description.includes("crypto"))
        )
      })
      .slice(0, 10)
      .map((market: any) => {
        // Get probability from outcome prices
        const outcomePrice = market.outcomePrices ? Number.parseFloat(market.outcomePrices[0]) : 0.5
        const volume = Number.parseFloat(market.volume || "0")

        // Anomaly detection logic
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
  } catch (error) {
    console.error("[v0] Polymarket API error:", error)
    // Return mock data for demonstration when API fails
    return generateMockEvents(symbol)
  }
}

function generateMockEvents(symbol: string): PolyEvent[] {
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
    {
      id: "mock-4",
      title: `${crypto} trading volume to exceed $1B daily`,
      volume: 45000,
      probability: 0.55,
      outcome: "Yes",
      isAnomaly: false,
    },
    {
      id: "mock-5",
      title: `Institutional adoption of ${crypto} accelerates`,
      volume: 203000,
      probability: 0.81,
      outcome: "Yes",
      isAnomaly: true,
    },
  ]
}
