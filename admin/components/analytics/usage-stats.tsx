"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

export function UsageStats() {
  const stats = [
    { name: "Total Requests", value: "12,543", change: "+12.5%", trend: "up" },
    { name: "Active Users", value: "234", change: "+8.2%", trend: "up" },
    { name: "Avg Response Time", value: "245ms", change: "-5.3%", trend: "down" },
    { name: "Error Rate", value: "0.8%", change: "-2.1%", trend: "down" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-6">
          <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-bold">{stat.value}</p>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {stat.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {stat.change}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
