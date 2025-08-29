import type { SystemConfig } from "./types"

export const defaultConfig: SystemConfig = {
  mcpPort: 12351,
  smartRouterPort: 9000,
  mainServerPort: 12345,
  enableBengaliVoice: true,
  defaultProvider: "openrouter",
  indexingEnabled: true,
  voiceLanguage: "both",
}

export const AI_PROVIDERS = {
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    models: ["gpt-4", "claude-3-sonnet", "llama-2-70b"],
  },
  together: {
    name: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    models: ["llama-2-70b-chat", "mistral-7b-instruct"],
  },
  huggingface: {
    name: "HuggingFace",
    baseUrl: "https://api-inference.huggingface.co",
    models: ["microsoft/DialoGPT-large", "facebook/blenderbot-400M-distill"],
  },
  anthropic: {
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    models: ["claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
  },
}

export const BENGALI_COMMANDS = {
  "কোড লিখো": "write code",
  "ফাইল খোলো": "open file",
  "প্রজেক্ট বিশ্লেষণ করো": "analyze project",
  "টাস্ক তৈরি করো": "create task",
  "এআই চালু করো": "start ai",
  "ভয়েস বন্ধ করো": "stop voice",
}
