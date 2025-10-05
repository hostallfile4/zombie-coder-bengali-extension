import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { LogsTable } from "@/components/logs/logs-table"
import { LogsFilter } from "@/components/logs/logs-filter"

export default function LogsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="System Logs" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <LogsFilter />
            <LogsTable />
          </div>
        </main>
      </div>
    </div>
  )
}
