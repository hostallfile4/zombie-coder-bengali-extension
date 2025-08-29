import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "all"
    const extension = searchParams.get("ext") || "all"

    console.log("[v0] Searching files:", { query, type, extension })

    // Mock search results
    const mockResults = [
      {
        id: "1",
        path: "app/page.tsx",
        name: "page.tsx",
        type: "file",
        matches: ["HomePage component", "dashboard layout"],
        score: 0.95,
      },
      {
        id: "2",
        path: "components/mcp-manager.tsx",
        name: "MCPManager",
        type: "function",
        matches: ["AI provider management"],
        score: 0.87,
      },
    ]

    const filteredResults = mockResults.filter((result) => {
      if (type !== "all" && result.type !== type) return false
      if (query && !result.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })

    return NextResponse.json({
      success: true,
      results: filteredResults,
      total: filteredResults.length,
      query,
    })
  } catch (error) {
    console.error("[v0] Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
