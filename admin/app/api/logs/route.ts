import { NextResponse } from "next/server"
import { initDatabase } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get("level")
    const component = searchParams.get("component")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const db = initDatabase()
    await db.connect()
    
    let query = "SELECT * FROM system_logs WHERE 1=1"
    const params: any[] = []

    if (level) {
      query += " AND log_level = ?"
      params.push(level)
    }

    if (component) {
      query += " AND component = ?"
      params.push(component)
    }

    query += " ORDER BY created_at DESC LIMIT ?"
    params.push(limit)

    const logs = await db.query(query, params)
    return NextResponse.json({ success: true, logs: logs || [] })
  } catch (error) {
    console.error("[API] Error fetching logs:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch logs" },
      { status: 500 }
    )
  }
}
