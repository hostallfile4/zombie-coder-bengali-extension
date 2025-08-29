"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Play, Pause, RefreshCw, Code, FileCode, Database } from "lucide-react"
import type { IndexedFile } from "@/lib/types"

interface IndexingProgress {
  current: number
  total: number
  currentFile: string
  status: "idle" | "scanning" | "analyzing" | "completed" | "error"
}

export function FileIndexer() {
  const [files, setFiles] = useState<IndexedFile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExtension, setSelectedExtension] = useState("all")
  const [progress, setProgress] = useState<IndexingProgress>({
    current: 0,
    total: 0,
    currentFile: "",
    status: "idle",
  })

  const [isIndexing, setIsIndexing] = useState(false)

  // Mock file data for demonstration
  useEffect(() => {
    const mockFiles: IndexedFile[] = [
      {
        id: "1",
        path: "app/page.tsx",
        name: "page.tsx",
        extension: "tsx",
        size: 2048,
        lastModified: new Date(),
        summary: "Main homepage component with dashboard layout",
        functions: ["HomePage"],
        imports: ["Card", "Button", "Badge"],
        exports: ["default"],
      },
      {
        id: "2",
        path: "components/mcp-manager.tsx",
        name: "mcp-manager.tsx",
        extension: "tsx",
        size: 8192,
        lastModified: new Date(),
        summary: "MCP Manager component for AI provider management",
        functions: ["MCPManager", "handleTestProvider", "handleAddProvider"],
        imports: ["useState", "Card", "Button", "Dialog"],
        exports: ["MCPManager"],
      },
      {
        id: "3",
        path: "lib/types.ts",
        name: "types.ts",
        extension: "ts",
        size: 1024,
        lastModified: new Date(),
        summary: "TypeScript type definitions for the application",
        functions: [],
        imports: [],
        exports: ["AIProvider", "IndexedFile", "Agent"],
      },
    ]
    setFiles(mockFiles)
  }, [])

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.summary && file.summary.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesExtension = selectedExtension === "all" || file.extension === selectedExtension

    return matchesSearch && matchesExtension
  })

  const extensions = Array.from(new Set(files.map((f) => f.extension)))

  const handleStartIndexing = async () => {
    setIsIndexing(true)
    setProgress({ current: 0, total: 100, currentFile: "", status: "scanning" })

    // Simulate indexing process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setProgress({
        current: i,
        total: 100,
        currentFile: `Processing file ${Math.floor(i / 10) + 1}...`,
        status: i < 100 ? "analyzing" : "completed",
      })
    }

    setIsIndexing(false)
    console.log("[v0] Indexing completed")
  }

  const handleStopIndexing = () => {
    setIsIndexing(false)
    setProgress((prev) => ({ ...prev, status: "idle" }))
  }

  const getFileIcon = (extension: string) => {
    switch (extension) {
      case "tsx":
      case "jsx":
        return <Code className="h-4 w-4 text-blue-500" />
      case "ts":
      case "js":
        return <FileCode className="h-4 w-4 text-yellow-500" />
      case "json":
        return <Database className="h-4 w-4 text-green-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Indexing Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Indexing
          </CardTitle>
          <CardDescription>Scan and analyze your project files for AI-powered assistance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleStartIndexing} disabled={isIndexing} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              {isIndexing ? "Indexing..." : "Start Indexing"}
            </Button>
            {isIndexing && (
              <Button variant="outline" onClick={handleStopIndexing}>
                <Pause className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {progress.status !== "idle" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress.currentFile}</span>
                <span>{progress.current}%</span>
              </div>
              <Progress value={progress.current} className="w-full" />
              <p className="text-sm text-muted-foreground">Status: {progress.status}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search files, functions, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedExtension} onValueChange={setSelectedExtension}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                {extensions.map((ext) => (
                  <SelectItem key={ext} value={ext}>
                    .{ext}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="files">Files ({filteredFiles.length})</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getFileIcon(file.extension)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{file.name}</h4>
                            <Badge variant="outline">.{file.extension}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{file.path}</p>
                          {file.summary && <p className="text-sm text-muted-foreground mt-1">{file.summary}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>{file.lastModified.toLocaleDateString()}</span>
                            {file.functions && file.functions.length > 0 && (
                              <span>{file.functions.length} functions</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {file.functions && file.functions.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-1">
                          {file.functions.slice(0, 5).map((func) => (
                            <Badge key={func} variant="secondary" className="text-xs">
                              {func}()
                            </Badge>
                          ))}
                          {file.functions.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{file.functions.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {files
                .flatMap((file) =>
                  (file.functions || []).map((func) => ({
                    function: func,
                    file: file.name,
                    path: file.path,
                  })),
                )
                .map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{item.function}()</span>
                        <Badge variant="outline">{item.file}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.path}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {files
                .filter((file) => file.extension === "tsx" || file.extension === "jsx")
                .map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{file.name}</span>
                        <Badge variant="outline">Component</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{file.path}</p>
                      {file.summary && <p className="text-sm text-muted-foreground mt-1">{file.summary}</p>}
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
