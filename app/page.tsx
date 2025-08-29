import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  Brain,
  FileText,
  Mic,
  Settings,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { SystemStatus } from "@/components/system-status"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">ZombieCoder</h1>
              <Badge variant="secondary">Bengali Extension</Badge>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/mcp">
                <Button variant="ghost" size="sm">
                  MCP Manager
                </Button>
              </Link>
              <Link href="/indexer">
                <Button variant="ghost" size="sm">
                  File Indexer
                </Button>
              </Link>
              <Link href="/agents">
                <Button variant="ghost" size="sm">
                  Agents
                </Button>
              </Link>
              <Link href="/voice">
                <Button variant="ghost" size="sm">
                  Voice System
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">ZombieCoder Bengali Extension</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered coding assistant with Bengali language support and advanced automation
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="secondary">AI-Powered</Badge>
            <Badge variant="secondary">Bengali Support</Badge>
            <Badge variant="secondary">Voice Commands</Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                  <Progress value={100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Providers</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4/5</div>
                  <p className="text-xs text-muted-foreground">Providers active</p>
                  <Progress value={80} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Files Indexed</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">+12 since last scan</p>
                  <Progress value={65} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Voice Commands</CardTitle>
                  <Mic className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">87% accuracy rate</p>
                  <Progress value={87} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* System Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/mcp">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      MCP Manager
                    </CardTitle>
                    <CardDescription>Manage AI providers and model configurations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">4 providers active</div>
                      <Badge variant="default">Running</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/indexer">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      File Indexer
                    </CardTitle>
                    <CardDescription>Index and analyze your codebase for AI assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">247 files indexed</div>
                      <Badge variant="secondary">Ready</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/agents">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Agent Executor
                    </CardTitle>
                    <CardDescription>Execute AI agents for automated coding tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">2 agents running</div>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/voice">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      Bengali Voice
                    </CardTitle>
                    <CardDescription>Voice commands and responses in Bengali</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">23 commands today</div>
                      <Badge variant="default">Listening</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Model Detector
                  </CardTitle>
                  <CardDescription>Detect and manage available AI models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">15 models detected</div>
                    <Badge variant="secondary">Scanning</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Task Manager
                  </CardTitle>
                  <CardDescription>Manage coding tasks and project todos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">5 tasks pending</div>
                    <Badge variant="outline">Queue</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system events and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Code analysis completed</div>
                        <div className="text-xs text-muted-foreground">Agent Executor • 2 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Voice command recognized: "কোড লিখো"</div>
                        <div className="text-xs text-muted-foreground">Bengali Voice System • 5 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">12 new files indexed</div>
                        <div className="text-xs text-muted-foreground">File Indexer • 8 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Settings className="h-4 w-4 text-orange-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">OpenRouter provider connected</div>
                        <div className="text-xs text-muted-foreground">MCP Manager • 15 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">HuggingFace API rate limit warning</div>
                        <div className="text-xs text-muted-foreground">MCP Manager • 22 minutes ago</div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Provider Requests</span>
                      <span>1,247</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Voice Commands</span>
                      <span>156</span>
                    </div>
                    <Progress value={62} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Files Processed</span>
                      <span>2,891</span>
                    </div>
                    <Progress value={94} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Agent Executions</span>
                      <span>89</span>
                    </div>
                    <Progress value={45} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Response Time</span>
                    <Badge variant="outline">245ms</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate</span>
                    <Badge variant="default">94.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <Badge variant="secondary">245 MB</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Uptime</span>
                    <Badge variant="outline">99.8%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quick-actions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <FileText className="h-6 w-6" />
                <span>Scan Project Files</span>
              </Button>
              <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Brain className="h-6 w-6" />
                <span>Test AI Providers</span>
              </Button>
              <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Mic className="h-6 w-6" />
                <span>Start Voice Recognition</span>
              </Button>
              <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Zap className="h-6 w-6" />
                <span>Run Code Analysis</span>
              </Button>
              <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Settings className="h-6 w-6" />
                <span>System Configuration</span>
              </Button>
              <Button className="h-20 flex-col gap-2 bg-transparent" variant="outline">
                <Activity className="h-6 w-6" />
                <span>View System Logs</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <SystemStatus />
        </div>
      </div>
    </div>
  )
}
