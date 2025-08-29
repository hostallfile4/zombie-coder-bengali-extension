"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Settings, FileText, Zap, Mic, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    description: "System overview and quick actions",
  },
  {
    title: "MCP Manager",
    href: "/mcp",
    icon: Settings,
    description: "AI provider management",
    badge: "4 Active",
  },
  {
    title: "File Indexer",
    href: "/indexer",
    icon: FileText,
    description: "Code analysis and indexing",
    badge: "247 Files",
  },
  {
    title: "Agent Executor",
    href: "/agents",
    icon: Zap,
    description: "AI agent automation",
    badge: "2 Running",
  },
  {
    title: "Bengali Voice",
    href: "/voice",
    icon: Mic,
    description: "Voice commands in Bengali",
    badge: "Listening",
  },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={cn("flex items-center gap-2", isActive && "bg-primary text-primary-foreground")}
              >
                <Icon className="h-4 w-4" />
                {item.title}
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Mobile Navigation */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="h-6 w-6" />
            <div>
              <h2 className="font-bold">ZombieCoder</h2>
              <p className="text-sm text-muted-foreground">Bengali Extension</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    {item.badge && (
                      <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
