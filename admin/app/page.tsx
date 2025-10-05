import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DashboardStats } from "@/components/dashboard/stats"
import { AgentStatus } from "@/components/dashboard/agent-status"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SystemHealth } from "@/components/dashboard/system-health"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <DashboardStats />
            <div className="grid gap-6 lg:grid-cols-2">
              <AgentStatus />
              <SystemHealth />
            </div>
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  )
}
