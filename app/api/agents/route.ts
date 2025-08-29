import { type NextRequest, NextResponse } from "next/server"
import type { Agent } from "@/lib/types"

// In-memory storage for demo (use database in production)
const agents: Agent[] = [
  {
    id: "1",
    name: "Code Analyzer",
    description: "Analyzes code quality and suggests improvements",
    type: "analyzer",
    status: "idle",
    config: { language: "typescript", rules: ["eslint", "prettier"] },
  },
]

export async function GET() {
  return NextResponse.json({ agents })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newAgent: Agent = {
      id: Date.now().toString(),
      ...body,
      status: "idle",
    }

    agents.push(newAgent)

    return NextResponse.json({ agent: newAgent }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 })
  }
}
