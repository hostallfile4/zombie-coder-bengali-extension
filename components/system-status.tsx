"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertCircle, CheckCircle } from "lucide-react"

interface SystemStatus {
  overall: "online" | "offline" | "degraded"
  services: {
    mcp: boolean
    smartRouter: boolean
    mainServer: boolean
    voiceSystem: boolean
  }
  providers: {
    total: number
    active: number
  }
}

export function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    overall: "online",
    services: {
      mcp: true,
      smartRouter: true,
      mainServer: true,
      voiceSystem: true,
    },
    providers: {
      total: 5,
      active: 4,
    },
  })

  useEffect(() => {
    // Simulate system status checks
    const checkStatus = () => {
      // In a real implementation, this would make API calls to check each service
      console.log("[v0] Checking system status...")
    }

    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (isOnline: boolean) => {
    return isOnline ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      online: "default",
      offline: "destructive",
      degraded: "secondary",
    } as const

    return <Badge variant={variants[status as keyof typeof variants]}>{status.toUpperCase()}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Status
          {getStatusBadge(status.overall)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">MCP Manager</span>
            {getStatusIcon(status.services.mcp)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Smart Router</span>
            {getStatusIcon(status.services.smartRouter)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Main Server</span>
            {getStatusIcon(status.services.mainServer)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Voice System</span>
            {getStatusIcon(status.services.voiceSystem)}
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">AI Providers</span>
            <span className="text-sm text-muted-foreground">
              {status.providers.active}/{status.providers.total} Active
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
