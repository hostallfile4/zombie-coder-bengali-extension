"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Activity, Brain, FileText, Mic } from "lucide-react"

interface SystemStats {
  systemStatus: "online" | "offline" | "degraded"
  aiProviders: { active: number; total: number }
  filesIndexed: { count: number; recent: number }
  voiceCommands: { count: number; accuracy: number }
  agentExecutions: { running: number; completed: number }
  performance: {
    responseTime: number
    successRate: number
    memoryUsage: number
    uptime: number
  }
}

export function DashboardStats() {
  const [stats, setStats] = useState<SystemStats>({
    systemStatus: "online",
    aiProviders: { active: 4, total: 5 },
    filesIndexed: { count: 247, recent: 12 },
    voiceCommands: { count: 23, accuracy: 87 },
    agentExecutions: { running: 2, completed: 15 },
    performance: {
      responseTime: 245,
      successRate: 94.2,
      memoryUsage: 245,
      uptime: 99.8,
    },
  })

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        voiceCommands: {
          ...prev.voiceCommands,
          count: prev.voiceCommands.count + Math.floor(Math.random() * 2),
        },
        performance: {
          ...prev.performance,
          responseTime: 200 + Math.floor(Math.random() * 100),
          memoryUsage: 200 + Math.floor(Math.random() * 100),
        },
      }))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600"
      case "degraded":
        return "text-yellow-600"
      case "offline":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-green-500"
    if (value >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStatusColor(stats.systemStatus)}`}>
            {stats.systemStatus.charAt(0).toUpperCase() + stats.systemStatus.slice(1)}
          </div>
          <p className="text-xs text-muted-foreground">All systems operational</p>
          <Progress value={stats.systemStatus === "online" ? 100 : 75} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Providers</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.aiProviders.active}/{stats.aiProviders.total}
          </div>
          <p className="text-xs text-muted-foreground">Providers active</p>
          <Progress value={(stats.aiProviders.active / stats.aiProviders.total) * 100} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Files Indexed</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.filesIndexed.count}</div>
          <p className="text-xs text-muted-foreground">+{stats.filesIndexed.recent} since last scan</p>
          <Progress value={65} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Voice Commands</CardTitle>
          <Mic className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.voiceCommands.count}</div>
          <p className="text-xs text-muted-foreground">{stats.voiceCommands.accuracy}% accuracy rate</p>
          <Progress value={stats.voiceCommands.accuracy} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  )
}
