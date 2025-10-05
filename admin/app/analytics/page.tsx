import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"
import { UsageStats } from "@/components/analytics/usage-stats"

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="Analytics" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <UsageStats />
            <AnalyticsCharts />
          </div>
        </main>
      </div>
    </div>
  )
}
