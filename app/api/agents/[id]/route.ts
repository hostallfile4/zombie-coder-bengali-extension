import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id

    // Mock agent details
    const agent = {
      id: agentId,
      name: "Code Analyzer",
      description: "Analyzes code quality and suggests improvements",
      type: "analyzer",
      status: "idle",
      config: { language: "typescript", rules: ["eslint", "prettier"] },
      stats: {
        totalExecutions: 25,
        successfulExecutions: 23,
        averageExecutionTime: 45000, // milliseconds
        lastExecution: new Date(Date.now() - 3600000),
      },
    }

    return NextResponse.json({ agent })
  } catch (error) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id
    const updates = await request.json()

    console.log("[v0] Updating agent:", agentId, updates)

    // Mock update response
    const updatedAgent = {
      id: agentId,
      ...updates,
      updatedAt: new Date(),
    }

    return NextResponse.json({ agent: updatedAgent })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id

    console.log("[v0] Deleting agent:", agentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete agent" }, { status: 500 })
  }
}
