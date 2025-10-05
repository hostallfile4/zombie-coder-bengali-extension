import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AgentsTable } from "@/components/agents/agents-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function AgentsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Agents Management">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Agent
          </Button>
        </Header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <AgentsTable />
          </div>
        </main>
      </div>
    </div>
  )
}
