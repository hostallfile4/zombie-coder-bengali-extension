"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function SystemHealth() {
  const metrics = [
    { name: "CPU Usage", value: 45, color: "bg-blue-500" },
    { name: "Memory Usage", value: 62, color: "bg-green-500" },
    { name: "Disk Usage", value: 38, color: "bg-amber-500" },
    { name: "Network", value: 28, color: "bg-purple-500" },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold">System Health</h3>
      <div className="mt-4 space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{metric.name}</span>
              <span className="text-muted-foreground">{metric.value}%</span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  )
}
