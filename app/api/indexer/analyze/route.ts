import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { filePath, content } = await request.json()

    console.log("[v0] Analyzing file:", filePath)

    // Mock file analysis
    const analysis = {
      functions: extractFunctions(content),
      imports: extractImports(content),
      exports: extractExports(content),
      summary: generateSummary(filePath, content),
      complexity: calculateComplexity(content),
      dependencies: extractDependencies(content),
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("[v0] File analysis error:", error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

// Mock analysis functions
function extractFunctions(content: string): string[] {
  // Simple regex to find function declarations
  const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*\()/g
  const functions: string[] = []
  let match

  while ((match = functionRegex.exec(content)) !== null) {
    const funcName = match[1] || match[2] || match[3]
    if (funcName && !functions.includes(funcName)) {
      functions.push(funcName)
    }
  }

  return functions.slice(0, 10) // Limit to first 10
}

function extractImports(content: string): string[] {
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g
  const imports: string[] = []
  let match

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1])
  }

  return imports
}

function extractExports(content: string): string[] {
  const exportRegex = /export\s+(?:default\s+)?(?:function\s+)?(\w+)/g
  const exports: string[] = []
  let match

  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1])
  }

  return exports
}

function generateSummary(filePath: string, content: string): string {
  const fileName = filePath.split("/").pop() || ""
  const lineCount = content.split("\n").length

  if (fileName.includes("component") || fileName.includes("tsx")) {
    return `React component with ${lineCount} lines of code`
  } else if (fileName.includes("api") || fileName.includes("route")) {
    return `API route handler with ${lineCount} lines of code`
  } else if (fileName.includes("type") || fileName.includes("interface")) {
    return `TypeScript definitions with ${lineCount} lines of code`
  }

  return `Code file with ${lineCount} lines`
}

function calculateComplexity(content: string): number {
  // Simple complexity calculation based on control structures
  const complexityPatterns = [/if\s*\(/g, /for\s*\(/g, /while\s*\(/g, /switch\s*\(/g, /catch\s*\(/g]
  let complexity = 1 // Base complexity

  complexityPatterns.forEach((pattern) => {
    const matches = content.match(pattern)
    if (matches) {
      complexity += matches.length
    }
  })

  return complexity
}

function extractDependencies(content: string): string[] {
  const depRegex = /from\s+['"]([^'"]+)['"]/g
  const dependencies: string[] = []
  let match

  while ((match = depRegex.exec(content)) !== null) {
    const dep = match[1]
    if (!dep.startsWith(".") && !dep.startsWith("/")) {
      dependencies.push(dep)
    }
  }

  return [...new Set(dependencies)] // Remove duplicates
}
