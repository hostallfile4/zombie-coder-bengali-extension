import axios, { type AxiosInstance } from "axios"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface CodeGenerationResponse {
  code: string
  explanation: string
  language: string
}

export interface CodeReviewResponse {
  summary: string
  issues: Array<{
    severity: "error" | "warning" | "info"
    message: string
    line?: number
  }>
  suggestions: string[]
}

export class ZombieCoderClient {
  private axios: AxiosInstance

  constructor(baseURL: string, apiKey: string) {
    this.axios = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 30000,
    })
  }

  async chat(message: string, history: ChatMessage[] = []): Promise<{ message: string }> {
    const response = await this.axios.post("/api/chat", {
      message,
      history,
    })
    return { message: response.data.response || response.data.message }
  }

  async *chatStream(message: string, history: ChatMessage[] = []): AsyncGenerator<string> {
    const response = await fetch(`${this.axios.defaults.baseURL}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: this.axios.defaults.headers.Authorization as string,
      },
      body: JSON.stringify({ message, history }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error("No response body")
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split("\n")

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") return
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              yield parsed.content
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  async generateCode(prompt: string): Promise<CodeGenerationResponse> {
    const response = await this.axios.post("/api/generate", {
      prompt,
    })
    return response.data
  }

  async reviewCode(code: string): Promise<CodeReviewResponse> {
    const response = await this.axios.post("/api/review", {
      code,
    })
    return response.data
  }

  async explainCode(code: string): Promise<string> {
    const response = await this.axios.post("/api/explain", {
      code,
    })
    return response.data.explanation
  }

  async translateToBengali(text: string): Promise<string> {
    const response = await this.axios.post("/api/translate", {
      text,
      target: "bn",
    })
    return response.data.translation
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.axios.get("/health")
      return true
    } catch {
      return false
    }
  }
}
