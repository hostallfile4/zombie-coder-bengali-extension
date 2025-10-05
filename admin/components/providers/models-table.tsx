"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, Trash2 } from "lucide-react"

export function ModelsTable() {
  const models = [
    { id: 1, name: "CodeLlama 7B", provider: "Ollama", contextLength: 4096, isLocal: true },
    { id: 2, name: "GPT-4", provider: "OpenRouter", contextLength: 32768, isLocal: false },
    { id: 3, name: "Mistral 7B", provider: "Ollama", contextLength: 8192, isLocal: true },
  ]

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Model Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Provider</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Context Length</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
              <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {models.map((model) => (
              <tr key={model.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 font-medium">{model.name}</td>
                <td className="px-6 py-4">{model.provider}</td>
                <td className="px-6 py-4 text-sm">{model.contextLength.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <Badge variant={model.isLocal ? "default" : "secondary"}>{model.isLocal ? "Local" : "Cloud"}</Badge>
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
