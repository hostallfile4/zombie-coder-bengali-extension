import { NextResponse } from "next/server"
import { initDatabase } from "@/lib/db"

export async function GET() {
  try {
    const db = initDatabase()
    await db.connect()
    
    const agents = await db.query("SELECT * FROM agents ORDER BY created_at DESC")
    return NextResponse.json({ success: true, agents: agents || [] })
  } catch (error) {
    console.error("[API] Error fetching agents:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch agents" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = initDatabase()
    await db.connect()

    const sql = `INSERT INTO agents (name, type, description, port, host, endpoint, capabilities, config, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    
    const result = await db.query(sql, [
      body.name,
      body.type,
      body.description,
      body.port,
      body.host || "localhost",
      body.endpoint,
      JSON.stringify(body.capabilities || {}),
      JSON.stringify(body.config || {}),
      body.status || "inactive",
    ])

    return NextResponse.json({ success: true, id: (result as any).lastID || (result as any).insertId })
  } catch (error) {
    console.error("[API] Error creating agent:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create agent" },
      { status: 500 }
    )
  }
}
