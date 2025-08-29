// Voice utility functions for Bengali voice system

export interface VoiceRecognitionOptions {
  language: "bn-BD" | "en-US" | "both"
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
}

export interface SpeechSynthesisOptions {
  language: "bn-BD" | "en-US"
  voice?: string
  rate: number
  pitch: number
  volume: number
}

export class BengaliVoiceManager {
  private recognition: any = null
  private synthesis: any = null
  private isListening = false
  private isSpeaking = false

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeRecognition()
      this.initializeSynthesis()
    }
  }

  private initializeRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      this.recognition = new SpeechRecognition()
    }
  }

  private initializeSynthesis() {
    if ("speechSynthesis" in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  startListening(options: Partial<VoiceRecognitionOptions> = {}) {
    if (!this.recognition || this.isListening) return

    const defaultOptions: VoiceRecognitionOptions = {
      language: "bn-BD",
      continuous: false,
      interimResults: true,
      maxAlternatives: 3,
    }

    const config = { ...defaultOptions, ...options }

    this.recognition.lang = config.language === "both" ? "bn-BD" : config.language
    this.recognition.continuous = config.continuous
    this.recognition.interimResults = config.interimResults
    this.recognition.maxAlternatives = config.maxAlternatives

    this.isListening = true
    this.recognition.start()

    console.log("[v0] Voice recognition started with config:", config)
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
      console.log("[v0] Voice recognition stopped")
    }
  }

  speak(text: string, options: Partial<SpeechSynthesisOptions> = {}) {
    if (!this.synthesis || this.isSpeaking) return

    const defaultOptions: SpeechSynthesisOptions = {
      language: "bn-BD",
      rate: 1,
      pitch: 1,
      volume: 0.8,
    }

    const config = { ...defaultOptions, ...options }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = config.language
    utterance.rate = config.rate
    utterance.pitch = config.pitch
    utterance.volume = config.volume

    utterance.onstart = () => {
      this.isSpeaking = true
      console.log("[v0] Speech synthesis started:", text)
    }

    utterance.onend = () => {
      this.isSpeaking = false
      console.log("[v0] Speech synthesis completed")
    }

    utterance.onerror = (event) => {
      this.isSpeaking = false
      console.error("[v0] Speech synthesis error:", event.error)
    }

    this.synthesis.speak(utterance)
  }

  getAvailableVoices() {
    if (!this.synthesis) return []

    return this.synthesis.getVoices().filter((voice: any) => voice.lang.startsWith("bn") || voice.lang.startsWith("en"))
  }

  isRecognitionSupported() {
    return !!this.recognition
  }

  isSynthesisSupported() {
    return !!this.synthesis
  }

  getCurrentStatus() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      recognitionSupported: this.isRecognitionSupported(),
      synthesisSupported: this.isSynthesisSupported(),
    }
  }
}

// Utility functions for command processing
export function processBengaliCommand(bengaliText: string): {
  command: string
  confidence: number
  action: string
} {
  // Simple command matching (in production, use more sophisticated NLP)
  const commands = {
    "কোড লিখো": "write_code",
    "ফাইল খোলো": "open_file",
    "প্রজেক্ট বিশ্লেষণ করো": "analyze_project",
    "টাস্ক তৈরি করো": "create_task",
    "এআই চালু করো": "start_ai",
    "ভয়েস বন্ধ করো": "stop_voice",
  }

  const normalizedInput = bengaliText.trim()
  const matchedCommand = Object.keys(commands).find((cmd) => normalizedInput.includes(cmd))

  if (matchedCommand) {
    return {
      command: matchedCommand,
      confidence: 0.9,
      action: commands[matchedCommand as keyof typeof commands],
    }
  }

  // Fuzzy matching for partial commands
  const partialMatches = Object.keys(commands).filter((cmd) => {
    const words = cmd.split(" ")
    return words.some((word) => normalizedInput.includes(word))
  })

  if (partialMatches.length > 0) {
    return {
      command: partialMatches[0],
      confidence: 0.6,
      action: commands[partialMatches[0] as keyof typeof commands],
    }
  }

  return {
    command: bengaliText,
    confidence: 0.3,
    action: "unknown",
  }
}

export function generateBengaliResponse(action: string): string {
  const responses: Record<string, string> = {
    write_code: "আমি কোড লিখছি",
    open_file: "ফাইল খুলছি",
    analyze_project: "প্রজেক্ট বিশ্লেষণ করছি",
    create_task: "নতুন টাস্ক তৈরি করছি",
    start_ai: "এআই সিস্টেম চালু করছি",
    stop_voice: "ভয়েস সিস্টেম বন্ধ করছি",
    unknown: "দুঃখিত, আমি বুঝতে পারিনি",
  }

  return responses[action] || responses.unknown
}
