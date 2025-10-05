"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useSWR from "swr"
import { Loader2, Save } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ConfigForm() {
  const { data, isLoading } = useSWR("/api/config", fetcher)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  const config = data?.config || []

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="gateway">Gateway</TabsTrigger>
        <TabsTrigger value="ai">AI Settings</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin_port">Admin Panel Port</Label>
              <Input id="admin_port" type="number" defaultValue="3000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway_host">Gateway Host</Label>
              <Input id="gateway_host" defaultValue="localhost" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="gateway">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gateway_port">Gateway Port</Label>
              <Input id="gateway_port" type="number" defaultValue="8001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gateway_token">Gateway Token</Label>
              <Input id="gateway_token" type="password" defaultValue="zombiecoder-gateway-token" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="ai">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ollama_host">Ollama Host</Label>
              <Input id="ollama_host" defaultValue="http://localhost:11434" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_tokens">Max Tokens</Label>
              <Input id="max_tokens" type="number" defaultValue="2048" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input id="temperature" type="number" step="0.1" defaultValue="0.7" />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="features">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Voice Commands</Label>
                <p className="text-sm text-muted-foreground">Enable Bengali voice commands</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Streaming</Label>
                <p className="text-sm text-muted-foreground">Enable streaming responses</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bengali Support</Label>
                <p className="text-sm text-muted-foreground">Enable Bengali language support</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
