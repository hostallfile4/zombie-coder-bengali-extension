"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Play, Square, Code, Search, FileCheck, Languages, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"
import type { Agent, Task } from "@/lib/types"

interface ExecutionLog {
  id: string
  agentId: string
  timestamp: Date
  level: "info" | "warning" | "error" | "success"
  message: string
}

export function AgentExecutor() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "Code Analyzer",
      description: "Analyzes code quality and suggests improvements",
      type: "analyzer",
      status: "idle",
      config: { language: "typescript", rules: ["eslint", "prettier"] },
      lastRun: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      name: "Auto Coder",
      description: "Generates code based on specifications",
      type: "coder",
      status: "running",
      config: { framework: "react", style: "functional" },
      lastRun: new Date(),
    },
    {
      id: "3",
      name: "Code Reviewer",
      description: "Reviews code changes and provides feedback",
      type: "reviewer",
      status: "idle",
      config: { checkSecurity: true, checkPerformance: true },
    },
    {
      id: "4",
      name: "Bengali Translator",
      description: "Translates comments and documentation to Bengali",
      type: "translator",
      status: "idle",
      config: { sourceLanguage: "en", targetLanguage: "bn" },
    },
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Analyze homepage component",
      description: "Review the main page component for optimization opportunities",
      status: "in-progress",
      priority: "medium",
      assignedAgent: "1",
      createdAt: new Date(Date.now() - 1800000),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "Generate API endpoints",
      description: "Create REST API endpoints for user management",
      status: "pending",
      priority: "high",
      createdAt: new Date(Date.now() - 900000),
      updatedAt: new Date(Date.now() - 900000),
    },
    {
      id: "3",
      title: "Translate documentation",
      description: "Convert English comments to Bengali",
      status: "completed",
      priority: "low",
      assignedAgent: "4",
      createdAt: new Date(Date.now() - 7200000),
      updatedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3600000),
    },
  ])

  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([
    {
      id: "1",
      agentId: "2",
      timestamp: new Date(),
      level: "info",
      message: "Starting code generation for user management API",
    },
    {
      id: "2",
      agentId: "1",
      timestamp: new Date(Date.now() - 300000),
      level: "success",
      message: "Code analysis completed. Found 3 optimization opportunities",
    },
    {
      id: "3",
      agentId: "4",
      timestamp: new Date(Date.now() - 600000),
      level: "info",
      message: "Translation task completed successfully",
    },
  ])

  const [isCreatingAgent, setIsCreatingAgent] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    type: "coder" as Agent["type"],
    config: {},
  })
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    assignedAgent: "",
  })

  const getAgentIcon = (type: Agent["type"]) => {
    switch (type) {
      case "coder":
        return <Code className="h-4 w-4 text-blue-500" />
      case "analyzer":
        return <Search className="h-4 w-4 text-green-500" />
      case "reviewer":
        return <FileCheck className="h-4 w-4 text-purple-500" />
      case "translator":
        return <Languages className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusIcon = (status: Agent["status"] | Task["status"]) => {
    switch (status) {
      case "running":
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />
      case "idle":
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: Agent["status"] | Task["status"]) => {
    const variants = {
      running: "default",
      "in-progress": "default",
      idle: "secondary",
      pending: "secondary",
      completed: "outline",
      error: "destructive",
      cancelled: "destructive",
    } as const

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  const getPriorityBadge = (priority: Task["priority"]) => {
    const variants = {
      low: "outline",
      medium: "secondary",
      high: "destructive",
    } as const

    return <Badge variant={variants[priority]}>{priority.toUpperCase()}</Badge>
  }

  const handleStartAgent = async (agentId: string) => {
    console.log("[v0] Starting agent:", agentId)
    setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, status: "running", lastRun: new Date() } : a)))

    // Add execution log
    const newLog: ExecutionLog = {
      id: Date.now().toString(),
      agentId,
      timestamp: new Date(),
      level: "info",
      message: `Agent ${agents.find((a) => a.id === agentId)?.name} started execution`,
    }
    setExecutionLogs((prev) => [newLog, ...prev])
  }

  const handleStopAgent = async (agentId: string) => {
    console.log("[v0] Stopping agent:", agentId)
    setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, status: "idle" } : a)))

    const newLog: ExecutionLog = {
      id: Date.now().toString(),
      agentId,
      timestamp: new Date(),
      level: "info",
      message: `Agent ${agents.find((a) => a.id === agentId)?.name} stopped`,
    }
    setExecutionLogs((prev) => [newLog, ...prev])
  }

  const handleCreateAgent = () => {
    const agent: Agent = {
      id: Date.now().toString(),
      name: newAgent.name,
      description: newAgent.description,
      type: newAgent.type,
      status: "idle",
      config: newAgent.config,
    }

    setAgents((prev) => [...prev, agent])
    setNewAgent({ name: "", description: "", type: "coder", config: {} })
    setIsCreatingAgent(false)
  }

  const handleCreateTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: "pending",
      priority: newTask.priority,
      assignedAgent: newTask.assignedAgent || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setTasks((prev) => [...prev, task])
    setNewTask({ title: "", description: "", priority: "medium", assignedAgent: "" })
    setIsCreatingTask(false)
  }

  const getLogLevelColor = (level: ExecutionLog["level"]) => {
    switch (level) {
      case "info":
        return "text-blue-600"
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Agent Management</h2>
        <div className="flex gap-2">
          <Dialog open={isCreatingAgent} onOpenChange={setIsCreatingAgent}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>Configure a new AI agent for automated tasks</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Agent"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-description">Description</Label>
                  <Textarea
                    id="agent-description"
                    value={newAgent.description}
                    onChange={(e) => setNewAgent((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="What does this agent do?"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-type">Agent Type</Label>
                  <Select
                    value={newAgent.type}
                    onValueChange={(value: Agent["type"]) => setNewAgent((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coder">Coder</SelectItem>
                      <SelectItem value="analyzer">Analyzer</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="translator">Translator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateAgent} className="w-full">
                  Create Agent
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Create a task for an AI agent to execute</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Analyze code quality"
                  />
                </div>
                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed task description..."
                  />
                </div>
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: Task["priority"]) => setNewTask((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task-agent">Assign to Agent (Optional)</Label>
                  <Select
                    value={newTask.assignedAgent}
                    onValueChange={(value) => setNewTask((prev) => ({ ...prev, assignedAgent: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList>
          <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAgentIcon(agent.type)}
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription>{agent.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(agent.status)}
                      {getStatusIcon(agent.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Type: {agent.type}
                      {agent.lastRun && <> • Last run: {agent.lastRun.toLocaleTimeString()}</>}
                    </div>
                    <div className="flex gap-2">
                      {agent.status === "idle" ? (
                        <Button size="sm" onClick={() => handleStartAgent(agent.id)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleStopAgent(agent.id)}>
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                          {getStatusIcon(task.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {task.createdAt.toLocaleDateString()}</span>
                          {task.assignedAgent && (
                            <span>Agent: {agents.find((a) => a.id === task.assignedAgent)?.name || "Unknown"}</span>
                          )}
                          {task.completedAt && <span>Completed: {task.completedAt.toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {executionLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {agents.find((a) => a.id === log.agentId)?.name || "Unknown Agent"}
                          </span>
                          <Badge variant="outline" className={getLogLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
