import { type NextRequest, NextResponse } from "next/server"
import type { AIProvider } from "@/lib/types"

// In-memory storage for demo (use database in production)
let providers: AIProvider[] = [
  {
    id: "1",
    name: "OpenRouter",
    type: "openrouter",
    status: "active",
    models: ["gpt-4", "claude-3-sonnet"],
    lastChecked: new Date(),
  },
]

export async function GET() {
  return NextResponse.json({ providers })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newProvider: AIProvider = {
      id: Date.now().toString(),
      ...body,
      status: "inactive",
      lastChecked: new Date(),
    }

    providers.push(newProvider)

    return NextResponse.json({ provider: newProvider }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const providerIndex = providers.findIndex((p) => p.id === id)
    if (providerIndex === -1) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    providers[providerIndex] = { ...providers[providerIndex], ...updates }

    return NextResponse.json({ provider: providers[providerIndex] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update provider" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Provider ID required" }, { status: 400 })
    }

    providers = providers.filter((p) => p.id !== id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete provider" }, { status: 500 })
  }
}
