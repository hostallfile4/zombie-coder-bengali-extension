import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ConfigForm } from "@/components/config/config-form"

export default function ConfigPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="System Configuration" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            <ConfigForm />
          </div>
        </main>
      </div>
    </div>
  )
}
