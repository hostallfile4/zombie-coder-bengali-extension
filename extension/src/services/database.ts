import type * as vscode from "vscode"
import * as path from "path"

export interface ChatHistory {
  id: number
  message: string
  response: string
  timestamp: Date
}

export class DatabaseService {
  private context: vscode.ExtensionContext
  private dbPath: string

  constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.dbPath = path.join(context.globalStorageUri.fsPath, "zombiecoder.db")
  }

  async initialize(): Promise<void> {
    // Store database path in global state
    await this.context.globalState.update("dbPath", this.dbPath)
    console.log(`Database initialized at: ${this.dbPath}`)
  }

  async saveChatHistory(message: string, response: string): Promise<void> {
    const history = this.context.globalState.get<ChatHistory[]>("chatHistory", [])
    history.push({
      id: Date.now(),
      message,
      response,
      timestamp: new Date(),
    })
    await this.context.globalState.update("chatHistory", history)
  }

  async getChatHistory(limit = 50): Promise<ChatHistory[]> {
    const history = this.context.globalState.get<ChatHistory[]>("chatHistory", [])
    return history.slice(-limit)
  }

  async clearChatHistory(): Promise<void> {
    await this.context.globalState.update("chatHistory", [])
  }

  async deleteChatHistoryItem(id: number): Promise<void> {
    const history = this.context.globalState.get<ChatHistory[]>("chatHistory", [])
    const filtered = history.filter((item) => item.id !== id)
    await this.context.globalState.update("chatHistory", filtered)
  }

  close(): void {
    console.log("Database service closed")
  }
}
