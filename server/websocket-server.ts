import { WebSocketServer, WebSocket } from "ws"
import { createServer } from "http"
import { initDatabase } from "../database/db"
import { EventEmitter } from "events"

interface ChatMessage {
  id: string
  sessionId: string
  userId: string
  type: "user" | "assistant" | "system"
  content: string
  metadata?: Record<string, any>
  createdAt: string
}

interface SystemMessage {
  type: "health" | "error" | "agent-status" | "connection"
  severity: "info" | "warning" | "error"
  message: string
  timestamp: string
}

export class ZombieCoder WSServer extends EventEmitter {
  private wss: WebSocketServer | null = null
  private clients: Map<string, WebSocket> = new Map()
  private sessions: Map<string, string[]> = new Map() // sessionId -> [clientIds]
  private port: number
  private db: any
  private heartbeatInterval: NodeJS.Timeout | null = null

  constructor(port: number) {
    super()
    this.port = port
  }

  async initialize(): Promise<void> {
    try {
      // Initialize database
      this.db = initDatabase()
      await this.db.connect()
      console.log("[WS] Database initialized")

      // Create HTTP server
      const server = createServer()

      // Create WebSocket server
      this.wss = new WebSocketServer({ server, perMessageDeflate: false })

      this.wss.on("connection", (ws: WebSocket, req) => {
        this.handleConnection(ws, req)
      })

      // Start heartbeat
      this.startHeartbeat()

      // Start HTTP server
      server.listen(this.port, () => {
        console.log(`[WS] WebSocket server running on port ${this.port}`)
      })
    } catch (error) {
      console.error("[WS] Initialization error:", error)
      throw error
    }
  }

  private handleConnection(ws: WebSocket, req: any): void {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const url = new URL(req.url || "", `http://${req.headers.host}`)
    const sessionId = url.searchParams.get("session") || `session-${Date.now()}`

    this.clients.set(clientId, ws)
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, [])
    }
    this.sessions.get(sessionId)?.push(clientId)

    console.log(`[WS] Client connected: ${clientId} (session: ${sessionId})`)

    // Send connection confirmation
    this.sendMessage(ws, {
      type: "connection",
      status: "connected",
      clientId,
      sessionId,
    })

    ws.on("message", async (data: any) => {
      try {
        await this.handleMessage(clientId, sessionId, data)
      } catch (error) {
        console.error("[WS] Message handler error:", error)
        this.sendError(ws, error instanceof Error ? error.message : "Unknown error")
      }
    })

    ws.on("close", () => {
      this.handleDisconnection(clientId, sessionId)
    })

    ws.on("error", (error) => {
      console.error(`[WS] WebSocket error for ${clientId}:`, error)
    })
  }

  private async handleMessage(clientId: string, sessionId: string, data: any): Promise<void> {
    try {
      const message = typeof data === "string" ? JSON.parse(data) : data

      console.log(`[WS] Message from ${clientId}:`, message.type)

      switch (message.type) {
        case "chat":
          await this.handleChatMessage(clientId, sessionId, message)
          break

        case "agent-command":
          await this.handleAgentCommand(clientId, sessionId, message)
          break

        case "health-check":
          this.handleHealthCheck(clientId)
          break

        case "subscribe-agent":
          this.handleAgentSubscription(clientId, sessionId, message.agentId)
          break

        default:
          console.warn(`[WS] Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error("[WS] Handle message error:", error)
      throw error
    }
  }

  private async handleChatMessage(
    clientId: string,
    sessionId: string,
    message: any
  ): Promise<void> {
    const ws = this.clients.get(clientId)
    if (!ws) return

    try {
      // Save to database
      const chatMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sessionId,
        userId: message.userId || "anonymous",
        type: "user",
        content: message.content,
        metadata: message.metadata,
        createdAt: new Date().toISOString(),
      }

      await this.db.query(
        `INSERT INTO chat_sessions (session_id, user_id, message_content, message_type, metadata)
         VALUES (?, ?, ?, ?, ?)`,
        [
          sessionId,
          chatMessage.userId,
          chatMessage.content,
          "user",
          JSON.stringify(chatMessage.metadata || {}),
        ]
      )

      // Broadcast to all clients in session
      this.broadcastToSession(sessionId, {
        type: "chat",
        message: chatMessage,
      })

      // Notify system
      this.emit("chat-message", chatMessage)
    } catch (error) {
      console.error("[WS] Chat message handling error:", error)
      this.sendError(ws, "Failed to process chat message")
    }
  }

  private async handleAgentCommand(
    clientId: string,
    sessionId: string,
    message: any
  ): Promise<void> {
    const ws = this.clients.get(clientId)
    if (!ws) return

    try {
      // Fetch agent details
      const agents = await this.db.query("SELECT * FROM agents WHERE id = ?", [message.agentId])

      if (!agents || agents.length === 0) {
        this.sendError(ws, "Agent not found")
        return
      }

      const agent = agents[0]

      // Send command response
      this.sendMessage(ws, {
        type: "agent-response",
        agentId: message.agentId,
        command: message.command,
        status: "executing",
        timestamp: new Date().toISOString(),
      })

      // Log command
      await this.db.query(
        `INSERT INTO system_logs (component, log_level, message, metadata)
         VALUES (?, ?, ?, ?)`,
        [
          `agent-${message.agentId}`,
          "info",
          `Command executed: ${message.command}`,
          JSON.stringify({ sessionId, clientId }),
        ]
      )

      this.emit("agent-command", { sessionId, agentId: message.agentId, command: message.command })
    } catch (error) {
      console.error("[WS] Agent command error:", error)
      const ws = this.clients.get(clientId)
      if (ws) this.sendError(ws, "Failed to execute agent command")
    }
  }

  private handleHealthCheck(clientId: string): void {
    const ws = this.clients.get(clientId)
    if (!ws) return

    this.sendMessage(ws, {
      type: "health",
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      connectedClients: this.clients.size,
      activeSessions: this.sessions.size,
    })
  }

  private handleAgentSubscription(clientId: string, sessionId: string, agentId: string): void {
    const ws = this.clients.get(clientId)
    if (!ws) return

    console.log(`[WS] Client ${clientId} subscribed to agent ${agentId}`)

    this.sendMessage(ws, {
      type: "subscription",
      agentId,
      status: "subscribed",
    })
  }

  private handleDisconnection(clientId: string, sessionId: string): void {
    console.log(`[WS] Client disconnected: ${clientId}`)

    this.clients.delete(clientId)

    const sessionClients = this.sessions.get(sessionId)
    if (sessionClients) {
      const index = sessionClients.indexOf(clientId)
      if (index > -1) sessionClients.splice(index, 1)

      if (sessionClients.length === 0) {
        this.sessions.delete(sessionId)
      }
    }

    this.emit("client-disconnected", { clientId, sessionId })
  }

  private broadcastToSession(sessionId: string, message: any): void {
    const clientIds = this.sessions.get(sessionId) || []

    clientIds.forEach((clientId) => {
      const ws = this.clients.get(clientId)
      if (ws && ws.readyState === WebSocket.OPEN) {
        this.sendMessage(ws, message)
      }
    })
  }

  private sendMessage(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    }
  }

  private sendError(ws: WebSocket, error: string): void {
    this.sendMessage(ws, {
      type: "error",
      message: error,
      timestamp: new Date().toISOString(),
    })
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping()
        }
      })
    }, 30000) // Every 30 seconds
  }

  async shutdown(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.clients.forEach((ws) => {
      ws.close(1000, "Server shutting down")
    })

    this.clients.clear()
    this.sessions.clear()

    if (this.wss) {
      this.wss.close()
    }

    console.log("[WS] WebSocket server shut down")
  }
}

// Start server if this is main module
if (require.main === module) {
  const port = Number(process.env.WEBSOCKET_PORT) || 9001
  const server = new ZombieCoder WSServer(port)

  server.initialize().catch((error) => {
    console.error("[WS] Fatal error:", error)
    process.exit(1)
  })

  process.on("SIGTERM", async () => {
    await server.shutdown()
    process.exit(0)
  })
}

export default ZombieCoder WSServer
