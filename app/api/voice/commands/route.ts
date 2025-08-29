import { type NextRequest, NextResponse } from "next/server"
import { BENGALI_COMMANDS } from "@/lib/config"

export async function GET() {
  try {
    const commands = Object.entries(BENGALI_COMMANDS).map(([bengali, english], index) => ({
      id: index.toString(),
      bengaliText: bengali,
      englishTranslation: english,
      action: english.replace(/\s+/g, "_").toLowerCase(),
      category: getCategoryFromCommand(english),
      examples: getExamplesForCommand(bengali),
    }))

    return NextResponse.json({
      success: true,
      commands,
      total: commands.length,
    })
  } catch (error) {
    console.error("[v0] Commands fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch commands" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bengaliText, englishTranslation, action } = await request.json()

    console.log("[v0] Adding new voice command:", { bengaliText, englishTranslation, action })

    // In a real implementation, this would save to database
    const newCommand = {
      id: Date.now().toString(),
      bengaliText,
      englishTranslation,
      action,
      category: "custom",
      createdAt: new Date(),
    }

    return NextResponse.json({
      success: true,
      command: newCommand,
    })
  } catch (error) {
    console.error("[v0] Command creation error:", error)
    return NextResponse.json({ error: "Failed to create command" }, { status: 500 })
  }
}

function getCategoryFromCommand(english: string): string {
  if (english.includes("code") || english.includes("write")) return "coding"
  if (english.includes("file") || english.includes("open")) return "file"
  if (english.includes("analyze") || english.includes("project")) return "analysis"
  if (english.includes("task") || english.includes("create")) return "task"
  if (english.includes("ai") || english.includes("start")) return "system"
  if (english.includes("voice") || english.includes("stop")) return "voice"
  return "general"
}

function getExamplesForCommand(bengali: string): string[] {
  // Mock examples for each command
  const examples: Record<string, string[]> = {
    "কোড লিখো": ["একটি ফাংশন লিখো", "রিয়েক্ট কম্পোনেন্ট তৈরি করো"],
    "ফাইল খোলো": ["প্রধান ফাইল খোলো", "কনফিগ ফাইল দেখাও"],
    "প্রজেক্ট বিশ্লেষণ করো": ["কোড কোয়ালিটি চেক করো", "পারফরমেন্স দেখো"],
  }

  return examples[bengali] || []
}
