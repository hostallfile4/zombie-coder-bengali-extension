import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

export async function GET() {
  try {
    const db = getDatabase()
    const providers = await db.query("SELECT * FROM ai_providers ORDER BY created_at DESC")
    return NextResponse.json({ providers })
  } catch (error) {
    console.error("Error fetching providers:", error)
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = getDatabase()

    const result = await db.query(
      `INSERT INTO ai_providers (name, provider_type, api_key, api_url, models, status, config) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.provider_type,
        body.api_key,
        body.api_url,
        JSON.stringify(body.models),
        body.status || "inactive",
        JSON.stringify(body.config),
      ],
    )

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error("Error creating provider:", error)
    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 })
  }
}
