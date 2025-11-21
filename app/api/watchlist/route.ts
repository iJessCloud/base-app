import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || "demo-user"

  try {
    const watchlist = await sql`
      SELECT coin_symbol, coin_id, added_at
      FROM watchlists
      WHERE user_id = ${userId}
      ORDER BY added_at DESC
    `

    return NextResponse.json(watchlist)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId, coinSymbol, coinId } = await request.json()

    if (!userId || !coinSymbol || !coinId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await sql`
      INSERT INTO watchlists (user_id, coin_symbol, coin_id)
      VALUES (${userId}, ${coinSymbol}, ${coinId})
      ON CONFLICT (user_id, coin_id) DO NOTHING
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, coinId } = await request.json()

    if (!userId || !coinId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await sql`
      DELETE FROM watchlists
      WHERE user_id = ${userId} AND coin_id = ${coinId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 })
  }
}
