"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const requestData = [
  { name: "Mon", requests: 400 },
  { name: "Tue", requests: 300 },
  { name: "Wed", requests: 600 },
  { name: "Thu", requests: 800 },
  { name: "Fri", requests: 500 },
  { name: "Sat", requests: 200 },
  { name: "Sun", requests: 300 },
]

const agentData = [
  { name: "Code Gen", usage: 450 },
  { name: "Bengali NLP", usage: 380 },
  { name: "Code Review", usage: 320 },
  { name: "Documentation", usage: 280 },
  { name: "Testing", usage: 210 },
]

export function AnalyticsCharts() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Request Volume</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={requestData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Line type="monotone" dataKey="requests" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Agent Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={agentData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="usage" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
