"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import { Activity, Filter } from "lucide-react"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type Pothole = {
  id: number
  severity: "Low" | "Medium" | "High" | "Critical"
  status: "PENDING" | "RESOLVED" | "IN_PROGRESS"
}

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted/30">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
})

export default function MapPage() {
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [severityFilter, setSeverityFilter] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    async function fetchPotholes() {
      try {
        const res = await fetch("http://localhost:3005/api/potholes")
        if (!res.ok) return

        const data: Pothole[] = await res.json()
        if (isMounted) {
          setPotholes(data)
        }
      } catch (err) {
        console.error("Error fetching potholes:", err)
      }
    }

    void fetchPotholes()
    const interval = setInterval(() => {
      if (!document.hidden) {
        void fetchPotholes()
      }
    }, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const filteredPotholes =
    severityFilter.length === 0
      ? potholes
      : potholes.filter((p) => severityFilter.includes(p.severity))

  const stats = useMemo(() => {
    return potholes.reduce(
      (acc, pothole) => {
        acc.bySeverity[pothole.severity] += 1
        if (pothole.status === "PENDING") acc.pending += 1
        if (pothole.status === "RESOLVED") acc.resolved += 1
        return acc
      },
      {
        bySeverity: {
          Low: 0,
          Medium: 0,
          High: 0,
          Critical: 0,
        },
        pending: 0,
        resolved: 0,
      },
    )
  }, [potholes])

  const toggleSeverity = (value: string) => {
    setSeverityFilter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        <section className="relative overflow-hidden border-b border-border/70 py-12">
          <div className="road-grid absolute inset-0 opacity-45" />
          <div className="container relative px-4">
            <div className="max-w-3xl">
              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Pothole Intelligence Map</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Explore reported potholes across the city. Data refreshes from your backend every 10 seconds.
              </p>
            </div>
          </div>
        </section>

        <section className="container px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-4">
              <Card className="surface-panel p-5">
                <h3 className="mb-4 text-base font-bold">Live Statistics</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total reports</span>
                    <Badge variant="secondary">{potholes.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-300">{stats.pending}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Resolved</span>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">{stats.resolved}</Badge>
                  </div>
                </div>
              </Card>

              <Card className="surface-panel p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-bold">Filter by Severity</h3>
                </div>

                <div className="space-y-3">
                  {(["Low", "Medium", "High", "Critical"] as const).map((severity) => (
                    <div key={severity} className="flex items-center space-x-2 rounded-lg border border-border/60 px-3 py-2">
                      <Checkbox
                        id={severity}
                        checked={severityFilter.includes(severity)}
                        onCheckedChange={() => toggleSeverity(severity)}
                      />
                      <Label htmlFor={severity} className="flex flex-1 items-center justify-between text-sm">
                        <span>{severity}</span>
                        <Badge variant="outline">{stats.bySeverity[severity]}</Badge>
                      </Label>
                    </div>
                  ))}
                </div>

                {severityFilter.length > 0 && (
                  <button onClick={() => setSeverityFilter([])} className="mt-4 text-sm font-medium text-primary hover:underline">
                    Clear filters
                  </button>
                )}
              </Card>

              <Card className="surface-panel p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4 text-primary" />
                  Showing {filteredPotholes.length} filtered reports
                </div>
              </Card>
            </aside>

            <Card className="surface-panel overflow-hidden p-0">
              <div className="h-[680px] w-full">
                <Map onSelect={() => {}} />
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-card/70 py-8">
        <div className="container text-center text-sm text-muted-foreground">Copyright {new Date().getFullYear()} RoadSafe</div>
      </footer>
    </div>
  )
}
