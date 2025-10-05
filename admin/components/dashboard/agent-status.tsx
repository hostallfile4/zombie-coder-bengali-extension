"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AgentStatus() {
  const { data, isLoading } = useSWR("/api/agents", fetcher)

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold">Agent Status</h3>
        <div className="mt-4 flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  const agents = data?.agents || []

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold">Agent Status</h3>
      <div className="mt-4 space-y-3">
        {agents.map((agent: any) => (
          <div key={agent.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {agent.status === "active" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">{agent.name}</p>
                <p className="text-sm text-muted-foreground">Port: {agent.port}</p>
              </div>
            </div>
            <Badge variant={agent.status === "active" ? "default" : "secondary"}>{agent.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
