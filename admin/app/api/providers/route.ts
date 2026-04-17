import { NextResponse } from "next/server"
import { initDatabase } from "@/lib/db"

export async function GET() {
  try {
    const db = initDatabase()
    await db.connect()
    
    const providers = await db.query("SELECT * FROM ai_providers ORDER BY created_at DESC")
    return NextResponse.json({ success: true, providers: providers || [] })
  } catch (error) {
    console.error("[API] Error fetching providers:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch providers" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = initDatabase()
    await db.connect()

    const sql = `INSERT INTO ai_providers (name, provider_type, api_key, api_url, models, status, config) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`
    
    const result = await db.query(sql, [
      body.name,
      body.provider_type,
      body.api_key,
      body.api_url,
      JSON.stringify(body.models || []),
      body.status || "inactive",
      JSON.stringify(body.config || {}),
    ])

    return NextResponse.json({ success: true, id: (result as any).lastID || (result as any).insertId })
  } catch (error) {
    console.error("[API] Error creating provider:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create provider" },
      { status: 500 }
    )
  }
}
