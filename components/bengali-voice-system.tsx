"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, MicOff, Volume2, Play, CheckCircle, AlertCircle } from "lucide-react"
import { BENGALI_COMMANDS } from "@/lib/config"
import type { VoiceCommand } from "@/lib/types"

interface VoiceSettings {
  enabled: boolean
  language: "bn" | "en" | "both"
  volume: number
  sensitivity: number
  autoResponse: boolean
  continuousListening: boolean
}

interface RecognitionResult {
  id: string
  timestamp: Date
  bengaliText: string
  englishTranslation: string
  confidence: number
  action: string
  executed: boolean
}

export function BengaliVoiceSystem() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentCommand, setCurrentCommand] = useState<string>("")
  const [recognitionResults, setRecognitionResults] = useState<RecognitionResult[]>([])
  const [settings, setSettings] = useState<VoiceSettings>({
    enabled: true,
    language: "both",
    volume: 80,
    sensitivity: 70,
    autoResponse: true,
    continuousListening: false,
  })

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<any>(null)

  // Mock voice commands for demonstration
  const voiceCommands: VoiceCommand[] = Object.entries(BENGALI_COMMANDS).map(([bengali, english], index) => ({
    id: index.toString(),
    bengaliText: bengali,
    englishTranslation: english,
    action: english.replace(/\s+/g, "_").toLowerCase(),
    confidence: 0.9,
  }))

  useEffect(() => {
    // Initialize speech recognition and synthesis
    if (typeof window !== "undefined") {
      // Mock speech recognition setup
      console.log("[v0] Initializing Bengali voice recognition system")

      // Mock speech synthesis setup
      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleStartListening = () => {
    if (!settings.enabled) return

    setIsListening(true)
    setCurrentCommand("")
    console.log("[v0] Starting voice recognition...")

    // Simulate voice recognition
    setTimeout(() => {
      const mockCommand = "কোড লিখো" // "Write code" in Bengali
      setCurrentCommand(mockCommand)

      const result: RecognitionResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        bengaliText: mockCommand,
        englishTranslation: BENGALI_COMMANDS[mockCommand] || "Unknown command",
        confidence: 0.87,
        action: "write_code",
        executed: false,
      }

      setRecognitionResults((prev) => [result, ...prev])

      if (settings.autoResponse) {
        handleExecuteCommand(result)
      }
    }, 2000)

    setTimeout(() => {
      setIsListening(false)
    }, 3000)
  }

  const handleStopListening = () => {
    setIsListening(false)
    setCurrentCommand("")
    console.log("[v0] Stopping voice recognition...")
  }

  const handleExecuteCommand = (result: RecognitionResult) => {
    console.log("[v0] Executing command:", result.action)

    // Update result as executed
    setRecognitionResults((prev) => prev.map((r) => (r.id === result.id ? { ...r, executed: true } : r)))

    // Provide voice feedback
    if (settings.autoResponse) {
      handleSpeak(`আমি ${result.englishTranslation} করছি`) // "I am doing [action]" in Bengali
    }
  }

  const handleSpeak = (text: string) => {
    if (!synthRef.current || !settings.enabled) return

    setIsSpeaking(true)
    console.log("[v0] Speaking:", text)

    // Mock text-to-speech
    setTimeout(() => {
      setIsSpeaking(false)
    }, 2000)
  }

  const handleTestVoice = () => {
    handleSpeak("আমি বাংলা ভয়েস সিস্টেম। আমি আপনার কমান্ড শুনতে প্রস্তুত।") // "I am Bengali voice system. I am ready to listen to your commands."
  }

  const handleVolumeChange = (value: number[]) => {
    setSettings((prev) => ({ ...prev, volume: value[0] }))
  }

  const handleSensitivityChange = (value: number[]) => {
    setSettings((prev) => ({ ...prev, sensitivity: value[0] }))
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge className="bg-green-100 text-green-800">High</Badge>
    if (confidence >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
    return <Badge className="bg-red-100 text-red-800">Low</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Control Center
          </CardTitle>
          <CardDescription>Control voice recognition and text-to-speech in Bengali</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={isListening ? handleStopListening : handleStartListening}
              disabled={!settings.enabled}
              className={`w-32 h-32 rounded-full ${
                isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
          </div>

          <div className="text-center">
            <div className="text-lg font-medium mb-2">
              {isListening ? "শুনছি..." : isSpeaking ? "বলছি..." : "প্রস্তুত"}{" "}
              {/* "Listening...", "Speaking...", "Ready" */}
            </div>
            {currentCommand && <div className="text-2xl font-bold text-blue-600 mb-2">"{currentCommand}"</div>}
            <div className="flex justify-center gap-2">
              <Badge variant={settings.enabled ? "default" : "secondary"}>
                {settings.enabled ? "সক্রিয়" : "নিষ্ক্রিয়"} {/* "Active" : "Inactive" */}
              </Badge>
              <Badge variant="outline">
                ভাষা: {settings.language === "bn" ? "বাংলা" : settings.language === "en" ? "English" : "উভয়"}
              </Badge>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleTestVoice} disabled={isSpeaking}>
              <Volume2 className="h-4 w-4 mr-2" />
              Test Voice
            </Button>
            <Button variant="outline" onClick={() => setRecognitionResults([])}>
              Clear History
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="commands" className="w-full">
        <TabsList>
          <TabsTrigger value="commands">Available Commands</TabsTrigger>
          <TabsTrigger value="history">Recognition History</TabsTrigger>
          <TabsTrigger value="settings">Voice Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bengali Voice Commands</CardTitle>
              <CardDescription>Supported voice commands in Bengali with English translations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {voiceCommands.map((command) => (
                    <div key={command.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-lg">{command.bengaliText}</div>
                        <div className="text-sm text-muted-foreground">{command.englishTranslation}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSpeak(`${command.bengaliText} মানে ${command.englishTranslation}`)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recognition History</CardTitle>
              <CardDescription>Recent voice recognition results and executed commands</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {recognitionResults.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No voice commands recognized yet. Try speaking a Bengali command!
                    </div>
                  ) : (
                    recognitionResults.map((result) => (
                      <div key={result.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium">{result.bengaliText}</div>
                            <div className="text-sm text-muted-foreground">{result.englishTranslation}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getConfidenceBadge(result.confidence)}
                            {result.executed ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{result.timestamp.toLocaleTimeString()}</span>
                          <span className={getConfidenceColor(result.confidence)}>
                            Confidence: {Math.round(result.confidence * 100)}%
                          </span>
                        </div>
                        {!result.executed && (
                          <Button size="sm" className="mt-2" onClick={() => handleExecuteCommand(result)}>
                            Execute Command
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voice System Settings</CardTitle>
              <CardDescription>Configure voice recognition and text-to-speech preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voice-enabled">Enable Voice System</Label>
                  <p className="text-sm text-muted-foreground">Turn voice recognition and synthesis on/off</p>
                </div>
                <Switch
                  id="voice-enabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enabled: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Language Mode</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value: "bn" | "en" | "both") => setSettings((prev) => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bn">বাংলা (Bengali Only)</SelectItem>
                    <SelectItem value="en">English Only</SelectItem>
                    <SelectItem value="both">উভয় (Both Languages)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Volume: {settings.volume}%</Label>
                <Slider
                  value={[settings.volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Microphone Sensitivity: {settings.sensitivity}%</Label>
                <Slider
                  value={[settings.sensitivity]}
                  onValueChange={handleSensitivityChange}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-response">Auto Response</Label>
                  <p className="text-sm text-muted-foreground">Automatically respond to recognized commands</p>
                </div>
                <Switch
                  id="auto-response"
                  checked={settings.autoResponse}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoResponse: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="continuous-listening">Continuous Listening</Label>
                  <p className="text-sm text-muted-foreground">Keep listening for commands continuously</p>
                </div>
                <Switch
                  id="continuous-listening"
                  checked={settings.continuousListening}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, continuousListening: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
