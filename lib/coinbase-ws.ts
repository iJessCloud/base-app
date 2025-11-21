export interface TickerUpdate {
  product_id: string
  price: string
  time: string
  high_24h?: string
  low_24h?: string
  volume_24h?: string
}

export class CoinbaseWS {
  private ws: WebSocket | null = null
  private subscribers: ((data: any) => void)[] = []
  private productIds: string[] = []
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isConnecting = false

  constructor(products: string[]) {
    this.productIds = products
    this.connect()
  }

  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return
    }

    this.isConnecting = true

    try {
      this.ws = new WebSocket("wss://advanced-trade-ws.coinbase.com")

      this.ws.onopen = () => {
        this.isConnecting = false
        this.subscribeToProducts()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.channel === "ticker" && data.events) {
            this.subscribers.forEach((cb) => cb(data))
          }
        } catch (error) {
          console.error("WebSocket message error:", error)
        }
      }

      this.ws.onerror = (error) => {
        this.isConnecting = false
        console.error("WebSocket error:", error)
      }

      this.ws.onclose = () => {
        this.isConnecting = false
        this.reconnectTimeout = setTimeout(() => this.connect(), 5000)
      }
    } catch (error) {
      this.isConnecting = false
      console.error("WebSocket connection error:", error)
    }
  }

  public updateProducts(newProducts: string[]) {
    this.productIds = newProducts
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.subscribeToProducts()
    }
  }

  private subscribeToProducts() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.productIds.length === 0) {
      return
    }

    const msg = {
      type: "subscribe",
      product_ids: this.productIds,
      channel: "ticker",
    }

    try {
      this.ws.send(JSON.stringify(msg))
    } catch (error) {
      console.error("WebSocket send error:", error)
    }
  }

  public subscribe(callback: (data: any) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback)
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
