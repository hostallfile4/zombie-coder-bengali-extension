"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LogsTable() {
  const { data, isLoading } = useSWR("/api/logs?limit=50", fetcher)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  const logs = data?.logs || []

  return (
    <Card>
      <ScrollArea className="h-[600px]">
        <table className="w-full">
          <thead className="sticky top-0 border-b bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Level</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Component</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Message</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-muted/50">
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      log.log_level === "error" ? "destructive" : log.log_level === "warn" ? "default" : "secondary"
                    }
                  >
                    {log.log_level}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{log.component}</td>
                <td className="px-6 py-4 text-sm">{log.message}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </Card>
  )
}
