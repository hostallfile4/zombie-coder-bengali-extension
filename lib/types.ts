// Core system types for ZombieCoder Bengali Extension

export interface AIProvider {
  id: string
  name: string
  type: "openrouter" | "together" | "huggingface" | "anthropic" | "openai"
  apiKey?: string
  baseUrl?: string
  models: string[]
  status: "active" | "inactive" | "error"
  lastChecked?: Date
}

export interface IndexedFile {
  id: string
  path: string
  name: string
  extension: string
  size: number
  lastModified: Date
  content?: string
  summary?: string
  functions?: string[]
  imports?: string[]
  exports?: string[]
}

export interface Agent {
  id: string
  name: string
  description: string
  type: "coder" | "analyzer" | "reviewer" | "translator"
  status: "idle" | "running" | "completed" | "error"
  config: Record<string, any>
  lastRun?: Date
}

export interface VoiceCommand {
  id: string
  bengaliText: string
  englishTranslation: string
  action: string
  parameters?: Record<string, any>
  confidence: number
}

export interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  assignedAgent?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface SystemConfig {
  mcpPort: number
  smartRouterPort: number
  mainServerPort: number
  enableBengaliVoice: boolean
  defaultProvider: string
  indexingEnabled: boolean
  voiceLanguage: "bn" | "en" | "both"
}
