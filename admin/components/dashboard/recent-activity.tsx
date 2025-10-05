"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function RecentActivity() {
  const { data, isLoading } = useSWR("/api/logs?limit=10", fetcher)

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <div className="mt-4 flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  const logs = data?.logs || []

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      <ScrollArea className="mt-4 h-[300px]">
        <div className="space-y-3">
          {logs.map((log: any) => (
            <div key={log.id} className="flex gap-3 rounded-lg border p-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{log.message}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{log.component}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                </div>
              </div>
              <div
                className={`rounded px-2 py-1 text-xs font-medium ${
                  log.log_level === "error"
                    ? "bg-red-500/10 text-red-500"
                    : log.log_level === "warn"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {log.log_level}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
