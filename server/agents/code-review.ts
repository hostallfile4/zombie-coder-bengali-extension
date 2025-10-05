import express from "express"

const app = express()
const PORT = 8004

app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "healthy", agent: "code-review" })
})

app.post("/chat", async (req, res) => {
  const { model, messages, stream } = req.body

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    // Simulate code review response
    const response =
      "Let me review your code:\n\n✅ Good practices:\n- Clean variable names\n- Proper error handling\n\n⚠️ Suggestions:\n- Consider adding type annotations\n- Extract magic numbers to constants"
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
            content:
              "Let me review your code:\n\n✅ Good practices:\n- Clean variable names\n- Proper error handling\n\n⚠️ Suggestions:\n- Consider adding type annotations\n- Extract magic numbers to constants",
          },
        },
      ],
    })
  }
})

app.listen(PORT, () => {
  console.log(`🔍 Code Review Agent running on http://localhost:${PORT}`)
})
