"use client"

import type React from "react"

import { ModeToggle } from "./mode-toggle"

interface HeaderProps {
  title: string
  children?: React.ReactNode
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        {children}
        <ModeToggle />
      </div>
    </header>
  )
}
