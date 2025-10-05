"use client"

import { Card } from "@/components/ui/card"
import { Activity, Bot, Cloud, Zap } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function DashboardStats() {
  const { data: agentsData } = useSWR("/api/agents", fetcher)
  const { data: providersData } = useSWR("/api/providers", fetcher)

  const activeAgents = agentsData?.agents?.filter((a: any) => a.status === "active").length || 0
  const totalAgents = agentsData?.agents?.length || 0
  const activeProviders = providersData?.providers?.filter((p: any) => p.status === "active").length || 0
  const totalProviders = providersData?.providers?.length || 0

  const stats = [
    {
      name: "Active Agents",
      value: `${activeAgents}/${totalAgents}`,
      icon: Bot,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      name: "AI Providers",
      value: `${activeProviders}/${totalProviders}`,
      icon: Cloud,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      name: "System Status",
      value: "Healthy",
      icon: Activity,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      name: "Uptime",
      value: "99.9%",
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
            <div className={`rounded-lg p-3 ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
