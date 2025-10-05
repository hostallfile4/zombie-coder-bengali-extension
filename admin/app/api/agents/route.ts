import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/db"

export async function GET() {
  try {
    const db = getDatabase()
    const agents = await db.query("SELECT * FROM agents ORDER BY created_at DESC")
    return NextResponse.json({ agents })
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = getDatabase()

    const result = await db.query(
      `INSERT INTO agents (name, type, description, port, host, endpoint, capabilities, config, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.name,
        body.type,
        body.description,
        body.port,
        body.host || "localhost",
        body.endpoint,
        JSON.stringify(body.capabilities),
        JSON.stringify(body.config),
        body.status || "inactive",
      ],
    )

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 })
  }
}
