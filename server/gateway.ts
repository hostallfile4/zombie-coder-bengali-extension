import express from "express"
import cors from "cors"
import { createProxyMiddleware } from "http-proxy-middleware"

const app = express()
const PORT = process.env.GATEWAY_PORT || 8001

app.use(cors())
app.use(express.json())

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      gateway: "running",
      ollama: "running",
      agents: "running",
    },
  })
})

// Get available models
app.get("/v1/models", async (req, res) => {
  try {
    const models = [
      // Ollama models
      { id: "codellama", provider: "ollama", type: "local" },
      { id: "llama2", provider: "ollama", type: "local" },
      { id: "mistral", provider: "ollama", type: "local" },
      // OpenAI models
      { id: "gpt-3.5-turbo", provider: "openai", type: "cloud" },
      { id: "gpt-4", provider: "openai", type: "cloud" },
      // Anthropic models
      { id: "claude-3-sonnet", provider: "anthropic", type: "cloud" },
      { id: "claude-3-opus", provider: "anthropic", type: "cloud" },
    ]

    res.json({ data: models })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

// Chat completions with streaming
app.post("/v1/chat/completions", async (req, res) => {
  const { model, messages, stream = false } = req.body

  try {
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")

      // Determine which backend to use based on model
      if (model.includes("codellama") || model.includes("llama") || model.includes("mistral")) {
        // Route to Ollama
        await streamFromOllama(model, messages, res)
      } else {
        // Route to appropriate agent
        await streamFromAgent(model, messages, res)
      }
    } else {
      // Non-streaming response
      const response = await generateResponse(model, messages)
      res.json(response)
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

async function streamFromOllama(model: string, messages: any[], res: express.Response) {
  const ollamaUrl = process.env.OLLAMA_HOST || "http://localhost:11434"
  const prompt = messages.map((m) => m.content).join("\n")

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: true,
    }),
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error("No response body")
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split("\n").filter((line) => line.trim())

    for (const line of lines) {
      try {
        const json = JSON.parse(line)
        if (json.response) {
          const sseData = {
            choices: [
              {
                delta: { content: json.response },
                index: 0,
              },
            ],
          }
          res.write(`data: ${JSON.stringify(sseData)}\n\n`)
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }

  res.write("data: [DONE]\n\n")
  res.end()
}

async function streamFromAgent(model: string, messages: any[], res: express.Response) {
  // Route to appropriate agent based on model
  const agentPort = getAgentPort(model)
  const agentUrl = `http://localhost:${agentPort}/chat`

  const response = await fetch(agentUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: true }),
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error("No response body")
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    res.write(chunk)
  }

  res.write("data: [DONE]\n\n")
  res.end()
}

async function generateResponse(model: string, messages: any[]) {
  // Non-streaming response generation
  return {
    id: "chatcmpl-" + Date.now(),
    object: "chat.completion",
    created: Date.now(),
    model: model,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "This is a placeholder response. Implement actual model integration.",
        },
        finish_reason: "stop",
      },
    ],
  }
}

function getAgentPort(model: string): number {
  // Map models to agent ports
  const portMap: Record<string, number> = {
    "gpt-3.5-turbo": 8003,
    "gpt-4": 8003,
    "claude-3-sonnet": 8004,
    "claude-3-opus": 8004,
  }
  return portMap[model] || 8003
}

// Proxy routes for specific agents
app.use(
  "/agents/bengali",
  createProxyMiddleware({
    target: "http://localhost:8002",
    changeOrigin: true,
  }),
)

app.use(
  "/agents/codegen",
  createProxyMiddleware({
    target: "http://localhost:8003",
    changeOrigin: true,
  }),
)

app.use(
  "/agents/review",
  createProxyMiddleware({
    target: "http://localhost:8004",
    changeOrigin: true,
  }),
)

app.listen(PORT, () => {
  console.log(`🚀 Gateway Server running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/health`)
  console.log(`🤖 Models endpoint: http://localhost:${PORT}/v1/models`)
})
