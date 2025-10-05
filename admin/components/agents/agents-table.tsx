"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import { Loader2, Play, Square, Settings } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AgentsTable() {
  const { data, isLoading } = useSWR("/api/agents", fetcher)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  const agents = data?.agents || []

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Port</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Endpoint</th>
              <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {agents.map((agent: any) => (
              <tr key={agent.id} className="hover:bg-muted/50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{agent.type}</Badge>
                </td>
                <td className="px-6 py-4 text-sm">{agent.port}</td>
                <td className="px-6 py-4">
                  <Badge variant={agent.status === "active" ? "default" : "secondary"}>{agent.status}</Badge>
                </td>
                <td className="px-6 py-4 text-sm font-mono">{agent.endpoint}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost">
                      {agent.status === "active" ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
