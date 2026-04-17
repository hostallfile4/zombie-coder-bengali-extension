import { NextResponse } from "next/server"
import { initDatabase } from "@/lib/db"

export async function GET() {
  try {
    const db = initDatabase()
    await db.connect()
    
    const config = await db.query("SELECT * FROM system_config ORDER BY config_key")
    return NextResponse.json({ success: true, config: config || [] })
  } catch (error) {
    console.error("[API] Error fetching config:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch config" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const db = initDatabase()
    await db.connect()

    const sql = `UPDATE system_config SET config_value = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE config_key = ?`
    
    await db.query(sql, [body.value, body.key])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error updating config:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update config" },
      { status: 500 }
    )
  }
}
