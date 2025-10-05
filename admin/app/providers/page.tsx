import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ProvidersTable } from "@/components/providers/providers-table"
import { ModelsTable } from "@/components/providers/models-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function ProvidersPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title="AI Providers & Models">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </Header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Tabs defaultValue="providers" className="space-y-6">
              <TabsList>
                <TabsTrigger value="providers">Providers</TabsTrigger>
                <TabsTrigger value="models">Models</TabsTrigger>
              </TabsList>
              <TabsContent value="providers">
                <ProvidersTable />
              </TabsContent>
              <TabsContent value="models">
                <ModelsTable />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
