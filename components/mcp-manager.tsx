"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle, Plus, Trash2, RefreshCw } from "lucide-react"
import type { AIProvider } from "@/lib/types"
import { AI_PROVIDERS } from "@/lib/config"

export function MCPManager() {
  const [providers, setProviders] = useState<AIProvider[]>([
    {
      id: "1",
      name: "OpenRouter",
      type: "openrouter",
      status: "active",
      models: ["gpt-4", "claude-3-sonnet"],
      lastChecked: new Date(),
    },
    {
      id: "2",
      name: "Together AI",
      type: "together",
      status: "active",
      models: ["llama-2-70b-chat"],
      lastChecked: new Date(),
    },
    {
      id: "3",
      name: "HuggingFace",
      type: "huggingface",
      status: "active",
      models: ["microsoft/DialoGPT-large"],
      lastChecked: new Date(),
    },
    {
      id: "4",
      name: "Anthropic",
      type: "anthropic",
      status: "active",
      models: ["claude-3-sonnet-20240229"],
      lastChecked: new Date(),
    },
    {
      id: "5",
      name: "OpenAI",
      type: "openai",
      status: "inactive",
      models: [],
    },
  ])

  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [newProvider, setNewProvider] = useState({
    name: "",
    type: "openrouter" as const,
    apiKey: "",
    baseUrl: "",
  })

  const getStatusIcon = (status: AIProvider["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "inactive":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: AIProvider["status"]) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      error: "destructive",
    } as const

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  const handleTestProvider = async (providerId: string) => {
    console.log("[v0] Testing provider:", providerId)
    // Simulate API test
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, status: "active" as const, lastChecked: new Date() } : p)),
    )
  }

  const handleAddProvider = () => {
    const provider: AIProvider = {
      id: Date.now().toString(),
      name: newProvider.name,
      type: newProvider.type,
      apiKey: newProvider.apiKey,
      baseUrl: newProvider.baseUrl,
      status: "inactive",
      models: AI_PROVIDERS[newProvider.type]?.models || [],
    }

    setProviders((prev) => [...prev, provider])
    setNewProvider({ name: "", type: "openrouter", apiKey: "", baseUrl: "" })
    setIsAddingProvider(false)
  }

  const handleDeleteProvider = (providerId: string) => {
    setProviders((prev) => prev.filter((p) => p.id !== providerId))
  }

  const handleToggleProvider = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">AI Providers</h2>
        <Dialog open={isAddingProvider} onOpenChange={setIsAddingProvider}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New AI Provider</DialogTitle>
              <DialogDescription>Configure a new AI provider for the MCP system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="provider-name">Provider Name</Label>
                <Input
                  id="provider-name"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Provider"
                />
              </div>
              <div>
                <Label htmlFor="provider-type">Provider Type</Label>
                <Select
                  value={newProvider.type}
                  onValueChange={(value: any) => setNewProvider((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                    <SelectItem value="together">Together AI</SelectItem>
                    <SelectItem value="huggingface">HuggingFace</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={newProvider.apiKey}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="sk-..."
                />
              </div>
              <div>
                <Label htmlFor="base-url">Base URL (Optional)</Label>
                <Input
                  id="base-url"
                  value={newProvider.baseUrl}
                  onChange={(e) => setNewProvider((prev) => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <Button onClick={handleAddProvider} className="w-full">
                Add Provider
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    {getStatusBadge(provider.status)}
                    {getStatusIcon(provider.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={provider.status === "active"}
                      onCheckedChange={() => handleToggleProvider(provider.id)}
                    />
                    <Button variant="outline" size="sm" onClick={() => handleTestProvider(provider.id)}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteProvider(provider.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Type: {provider.type} • Models: {provider.models.length}
                  {provider.lastChecked && <> • Last checked: {provider.lastChecked.toLocaleTimeString()}</>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {provider.models.map((model) => (
                    <Badge key={model} variant="outline">
                      {model}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Models</CardTitle>
              <CardDescription>All models available across your configured providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers
                  .filter((p) => p.status === "active")
                  .flatMap((p) => p.models.map((m) => ({ model: m, provider: p.name })))
                  .map(({ model, provider }, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{model}</div>
                        <div className="text-sm text-muted-foreground">{provider}</div>
                      </div>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MCP Configuration</CardTitle>
              <CardDescription>Configure MCP Manager settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-refresh">Auto-refresh providers</Label>
                  <p className="text-sm text-muted-foreground">Automatically check provider status every 5 minutes</p>
                </div>
                <Switch id="auto-refresh" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="load-balancing">Enable load balancing</Label>
                  <p className="text-sm text-muted-foreground">Distribute requests across multiple providers</p>
                </div>
                <Switch id="load-balancing" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="fallback">Enable fallback providers</Label>
                  <p className="text-sm text-muted-foreground">Use backup providers when primary fails</p>
                </div>
                <Switch id="fallback" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
