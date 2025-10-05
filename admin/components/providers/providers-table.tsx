"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import { Loader2, Settings, Trash2 } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ProvidersTable() {
  const { data, isLoading } = useSWR("/api/providers", fetcher)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  const providers = data?.providers || []

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium">API URL</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {providers.map((provider: any) => (
              <tr key={provider.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 font-medium">{provider.name}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{provider.provider_type}</Badge>
                </td>
                <td className="px-6 py-4 text-sm font-mono">{provider.api_url}</td>
                <td className="px-6 py-4">
                  <Badge variant={provider.status === "active" ? "default" : "secondary"}>{provider.status}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
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
