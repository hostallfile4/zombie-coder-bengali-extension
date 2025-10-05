import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

export async function GET() {
  try {
    const db = getDatabase()
    const config = await db.query("SELECT * FROM system_config ORDER BY config_key")
    return NextResponse.json({ config })
  } catch (error) {
    console.error("Error fetching config:", error)
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const db = getDatabase()

    await db.query(
      `UPDATE system_config SET config_value = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE config_key = ?`,
      [body.value, body.key],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating config:", error)
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 })
  }
}
