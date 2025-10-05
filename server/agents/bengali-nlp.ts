import express from "express"

const app = express()
const PORT = 8002

app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "healthy", agent: "bengali-nlp" })
})

app.post("/chat", async (req, res) => {
  const { model, messages, stream } = req.body

  if (stream) {
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    // Simulate Bengali NLP processing
    const response = "আমি আপনার বাংলা প্রশ্ন বুঝতে পেরেছি। এখানে একটি কোড উদাহরণ..."
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
            content: "আমি আপনার বাংলা প্রশ্ন বুঝতে পেরেছি। এখানে একটি কোড উদাহরণ...",
          },
        },
      ],
    })
  }
})

app.listen(PORT, () => {
  console.log(`🇧🇩 Bengali NLP Agent running on http://localhost:${PORT}`)
})
