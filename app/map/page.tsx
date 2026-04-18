"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import { Activity, CheckCircle, Clock, Compass, Filter, MapPinned, Sparkles, TrendingUp } from "lucide-react"
import Navigation from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getApiUrl } from "@/lib/api"

type PotholeSeverity = "Low" | "Medium" | "High" | "Critical"
type PotholeStatus = "Pending" | "In Progress" | "Resolved"

type Pothole = {
  id: number | string
  severity?: PotholeSeverity
  status?: PotholeStatus
}

type BackendPothole = {
  id: number | string
  severity?: string
  status?: string
}

const SEVERITY_OPTIONS: PotholeSeverity[] = ["Low", "Medium", "High", "Critical"]

const normalizeSeverity = (severity?: string): PotholeSeverity | undefined => {
  switch (severity?.trim().toUpperCase()) {
    case "LOW":
      return "Low"
    case "MEDIUM":
      return "Medium"
    case "HIGH":
      return "High"
    case "CRITICAL":
      return "Critical"
    default:
      return undefined
  }
}

const normalizeStatus = (status?: string): PotholeStatus | undefined => {
  const normalized = status?.trim().replace(/[_-]+/g, " ").toLowerCase()

  switch (normalized) {
    case "pending":
      return "Pending"
    case "in progress":
      return "In Progress"
    case "resolved":
      return "Resolved"
    default:
      return undefined
  }
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
        const res = await fetch(getApiUrl("/potholes"))
        if (!res.ok) return

        const data: BackendPothole[] = await res.json()
        if (isMounted) {
          setPotholes(
            Array.isArray(data)
              ? data.map((pothole) => ({
                  id: pothole.id,
                  severity: normalizeSeverity(pothole.severity),
                  status: normalizeStatus(pothole.status),
                }))
              : [],
          )
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
      : potholes.filter((p) => p.severity && severityFilter.includes(p.severity))

  const stats = useMemo(() => {
    return potholes.reduce(
      (acc, pothole) => {
        if (pothole.severity) {
          acc.bySeverity[pothole.severity] += 1
        }
        if (pothole.status === "Pending") acc.pending += 1
        if (pothole.status === "In Progress") acc.inProgress += 1
        if (pothole.status === "Resolved") acc.resolved += 1
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
        inProgress: 0,
        resolved: 0,
      },
    )
  }, [potholes])

  const statusCards = [
    {
      label: "Total reported",
      value: potholes.length,
      icon: Activity,
      tint: "bg-primary/12 text-primary dark:bg-white/10 dark:text-white",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      tint: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
    },
    {
      label: "In progress",
      value: stats.inProgress,
      icon: TrendingUp,
      tint: "bg-blue-500/12 text-blue-600 dark:text-blue-300",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      tint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    },
  ]

  const toggleSeverity = (value: string) => {
    setSeverityFilter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  return (
    <div className="page-shell">
      <Navigation />

      <main>
        <section className="relative overflow-hidden pb-10 pt-4 md:pb-14 md:pt-8">
          <div className="road-grid absolute inset-0 opacity-40" />
          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl screen-enter">
              <h1 className="heading-display mt-6 text-5xl md:text-6xl">Pothole intelligence map.</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Explore incoming road hazard activity with a lighter, more premium cartographic frame while keeping the
                existing refresh cycle and map logic intact.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statusCards.map((card) => (
                <Card key={card.label} className="metric-card screen-enter">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-muted-foreground">{card.label}</p>
                      <div className={`grid h-11 w-11 place-items-center rounded-2xl ${card.tint}`}>
                        <card.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="stat-value mt-4 text-4xl">{card.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-2 pb-14">
          {/* UI-only redesign: a card-based insight rail now frames the same map component and filter logic. */}
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <aside className="space-y-4">
              <Card className="surface-panel screen-enter">
                <CardContent className="p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-primary text-base font-semibold">Live status snapshot</p>
                      <p className="text-sm text-muted-foreground">Synced from your backend every 10 seconds.</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="field-panel flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-muted-foreground">Total reported</span>
                      <Badge variant="outline">{potholes.length}</Badge>
                    </div>
                    <div className="field-panel flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-muted-foreground">Pending</span>
                      <Badge className="border-amber-500/20 bg-amber-500/12 text-amber-600 dark:text-amber-300">
                        {stats.pending}
                      </Badge>
                    </div>
                    <div className="field-panel flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-muted-foreground">In progress</span>
                      <Badge className="border-blue-500/20 bg-blue-500/12 text-blue-600 dark:text-blue-300">
                        {stats.inProgress}
                      </Badge>
                    </div>
                    <div className="field-panel flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-muted-foreground">Resolved</span>
                      <Badge className="border-emerald-500/20 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
                        {stats.resolved}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="surface-panel screen-enter">
                <CardContent className="p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-white/10 dark:text-white">
                      <Filter className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-primary text-base font-semibold">Filter by severity</p>
                      <p className="text-sm text-muted-foreground">Focus the map on the hazards you care about.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {SEVERITY_OPTIONS.map((severity) => (
                      <div
                        key={severity}
                        className="field-panel flex items-center gap-3 px-4 py-3"
                      >
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
                    <Button variant="ghost" size="sm" onClick={() => setSeverityFilter([])} className="mt-4 rounded-2xl">
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="surface-panel-dark screen-enter p-0">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-primary text-base font-semibold text-white">Map focus</p>
                      <p className="mt-1 text-sm leading-6 text-white/72">
                        Showing {filteredPotholes.length} report{filteredPotholes.length === 1 ? "" : "s"}.
                 
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <Card className="surface-panel screen-enter overflow-hidden p-0">
              <CardContent className="p-0">
                <div className="border-b border-border/60 px-6 py-6 md:px-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="section-kicker">Interactive map</p>
                      <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                        <MapPinned className="h-5 w-5 text-primary" />
                        City-wide pothole monitoring
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="overflow-hidden rounded-[28px] border border-border/70 bg-white/55 shadow-[0_24px_60px_-38px_rgba(92,111,189,0.34)] backdrop-blur-xl dark:bg-white/6">
                    <div className="h-[680px] w-full">
                      <Map onSelect={() => {}} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
        <footer className="border-t border-border/60 bg-card/55 py-8 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col gap-3 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-primary font-semibold text-foreground">RoadSafe</p>
          </div>
          <p>Copyright {new Date().getFullYear()} RoadSafe</p>
        </div>
      </footer>

    </div>
  )
}
