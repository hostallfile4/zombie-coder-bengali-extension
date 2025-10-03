import express from "express"

const app = express()
const PORT = 8003

app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "healthy", agent: "code-generator" })
})

app.post("/chat", async (req, res) => {
  const { model, messages, stream } = req.body

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    // Simulate streaming response
    const response = "Here's a code example that might help with your request..."
    for (const char of response) {
      const sseData = {
        choices: [{ delta: { content: char }, index: 0 }],
      }
      res.write(`data: ${JSON.stringify(sseData)}\n\n`)
      await new Promise((resolve) => setTimeout(resolve, 30))
    }

    res.write("data: [DONE]\n\n")
    res.end()
  } else {
    res.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: "Here's a code example that might help with your request...",
          },
        },
      ],
    })
  }
})

app.listen(PORT, () => {
  console.log(`🤖 Code Generator Agent running on http://localhost:${PORT}`)
})
