"use client"

import { useMemo } from "react"
import type { ComponentType, CSSProperties } from "react"
import { CheckCircle, Clock, Flame, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type AnalyticsPothole = {
  roadName?: string
  severity?: string
  status?: string
  dateReported?: string
  createdAt?: string
  updatedAt?: string
  id?: string
  latitude?: number
  longitude?: number
}

export default function Analytics({ potholes = [] }: { potholes: AnalyticsPothole[] }) {
  const analytics = useMemo(() => {
    const roadStats: Record<
      string,
      { count: number; critical: number; high: number; medium: number; low: number; resolved: number }
    > = {}

    potholes.forEach((p) => {
      const road = p.roadName || "Unknown"
      if (!roadStats[road]) {
        roadStats[road] = { count: 0, critical: 0, high: 0, medium: 0, low: 0, resolved: 0 }
      }

      roadStats[road].count++
      if (p.severity === "Critical") roadStats[road].critical++
      if (p.severity === "High") roadStats[road].high++
      if (p.severity === "Medium") roadStats[road].medium++
      if (p.severity === "Low") roadStats[road].low++
      if (p.status === "Resolved") roadStats[road].resolved++
    })

    const mostProblematicRoads = Object.entries(roadStats)
      .sort((a, b) => {
        const aScore = a[1].critical * 3 + a[1].high * 2 + a[1].medium
        const bScore = b[1].critical * 3 + b[1].high * 2 + b[1].medium
        return bScore - aScore
      })
      .slice(0, 5)

    const responseTimes = potholes
      .filter((p) => p.createdAt && p.dateReported)
      .map((p) => {
        const created = new Date(p.dateReported as string)
        const updated = new Date(p.updatedAt || (p.createdAt as string))
        const diffHours = (updated.getTime() - created.getTime()) / (1000 * 60 * 60)
        return { id: p.id, status: p.status, hours: diffHours }
      })

    const avgResponseTime =
      responseTimes.length > 0
        ? (responseTimes.reduce((sum, rt) => sum + rt.hours, 0) / responseTimes.length).toFixed(1)
        : "0"

    const resolvedOnly = responseTimes.filter((rt) => rt.status === "Resolved")
    const resolvedResponseTime =
      resolvedOnly.length > 0
        ? (resolvedOnly.reduce((sum, rt) => sum + rt.hours, 0) / resolvedOnly.length).toFixed(1)
        : "0"

    const locationDensity: Record<string, number> = {}
    potholes
      .filter((p) => p.latitude !== undefined && p.longitude !== undefined)
      .forEach((p) => {
        const latCell = Math.floor((p.latitude as number) * 100) / 100
        const lngCell = Math.floor((p.longitude as number) * 100) / 100
        const key = `${latCell},${lngCell}`
        locationDensity[key] = (locationDensity[key] || 0) + 1
      })

    const hotspots = Object.entries(locationDensity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([coords, count]) => {
        const [lat, lng] = coords.split(",")
        return { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng), count }
      })

    const trendData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = date.toISOString().split("T")[0]
      const count = potholes.filter((p) => {
        const dateStr = p.dateReported || p.createdAt
        if (!dateStr) return false
        const pDate = dateStr.split("T")[0]
        return pDate === dayStr
      }).length

      trendData.push({ date: dayStr, count })
    }

    return {
      mostProblematicRoads,
      avgResponseTime,
      resolvedResponseTime,
      hotspots,
      trendData,
      responseTimes,
    }
  }, [potholes])

  const MetricCard = ({
    title,
    value,
    unit,
    color,
    icon: Icon,
  }: {
    title: string
    value: string | number
    unit?: string
    color: string
    icon?: ComponentType<{ className?: string; style?: CSSProperties }>
  }) => (
    <Card className="metric-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="stat-value mt-3 text-4xl" style={{ color }}>
              {value}
            </p>
            {unit && <p className="mt-1 text-xs text-muted-foreground">{unit}</p>}
          </div>
          {Icon && (
            <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ backgroundColor: `${color}18` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* UI-only redesign: analytics now read like premium insight cards while calculations remain unchanged. */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Avg Response Time" value={analytics.avgResponseTime} unit="hours" color="#5169f6" icon={Clock} />
        <MetricCard title="Avg Resolution Time" value={analytics.resolvedResponseTime} unit="hours" color="#10b981" icon={CheckCircle} />
        <MetricCard title="Geographic Hotspots" value={analytics.hotspots.length} unit="high-density areas" color="#f59e0b" icon={Flame} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="surface-panel">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="section-kicker">Road ranking</p>
                <h4 className="mt-2 text-2xl font-semibold">Most problematic roads</h4>
              </div>
            </div>

            <div className="space-y-4">
              {analytics.mostProblematicRoads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data available.</p>
              ) : (
                analytics.mostProblematicRoads.map(([road, stats], idx) => {
                  const maxCount = Math.max(...analytics.mostProblematicRoads.map((r) => r[1].count), 1)
                  const percentage = (stats.count / maxCount) * 100
                  const unresolved = stats.count - stats.resolved

                  return (
                    <div key={road} className="field-panel p-4">
                      <div className="mb-3 flex items-center justify-between text-sm">
                        <div>
                          <span className="font-primary font-semibold">
                            #{idx + 1} {road}
                          </span>
                          <span className="ml-2 text-muted-foreground">{stats.count} reports</span>
                        </div>
                        <div className="text-muted-foreground">
                          {stats.critical > 0 && `${stats.critical} Critical`}
                          {stats.high > 0 && ` ${stats.high} High`}
                        </div>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: stats.critical > 0 ? "#ef4444" : stats.high > 0 ? "#f97316" : "#f59e0b",
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {stats.resolved} resolved, {unresolved} pending
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel-dark p-0">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <p className="section-kicker text-white/70">Hotspots</p>
                <h4 className="mt-2 text-2xl font-semibold text-white">High-density geographic clusters</h4>
              </div>
            </div>

            {analytics.hotspots.length === 0 ? (
              <p className="text-sm text-white/72">No data available.</p>
            ) : (
              <div className="grid gap-3">
                {analytics.hotspots.map((spot, idx) => (
                  <div key={idx} className="rounded-[24px] border border-white/10 bg-white/7 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-primary font-semibold text-white">Hotspot {idx + 1}</span>
                      <span className="status-pill border-white/14">{spot.count} reports</span>
                    </div>
                    <div className="space-y-1 text-sm text-white/72">
                      <div>Lat: {spot.lat.toFixed(4)}</div>
                      <div>Lng: {spot.lng.toFixed(4)}</div>
                    </div>
                    <Button
                      onClick={() => {
                        window.open(`https://www.google.com/maps/search/${spot.lat},${spot.lng}`, "_blank")
                      }}
                      className="mt-4 w-full"
                      size="sm"
                    >
                      View on Map
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="surface-panel">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="section-kicker">Recent activity</p>
              <h4 className="mt-2 text-2xl font-semibold">Reports trend over the last 7 days</h4>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {analytics.trendData.map((day, idx) => {
              const maxCount = Math.max(...analytics.trendData.map((d) => d.count), 1)
              const height = Math.max((day.count / maxCount) * 180, 8)

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex h-[190px] items-end">
                    <div className="flex w-10 items-end overflow-hidden rounded-2xl bg-muted/70 p-1" title={`${day.date}: ${day.count} reports`}>
                      <div
                        className="w-full rounded-[14px] bg-gradient-to-t from-primary via-blue-500 to-cyan-400"
                        style={{ height: `${height}px` }}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <p className="stat-value text-sm text-primary">{day.count}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-white/10 dark:text-white">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="section-kicker">Response time</p>
              <h4 className="mt-2 text-2xl font-semibold">Distribution breakdown</h4>
            </div>
          </div>

          {analytics.responseTimes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No response time data available.</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h5 className="text-sm font-semibold text-muted-foreground">Distribution by status</h5>
                <div className="mt-3 flex gap-2">
                  {["Pending", "In Progress", "Resolved"].map((status) => {
                    const count = analytics.responseTimes.filter((rt) => rt.status === status).length
                    const pct = (count / analytics.responseTimes.length) * 100

                    return (
                      <div
                        key={status}
                        className="flex h-10 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white"
                        style={{
                          flex: pct || 1,
                          backgroundColor:
                            status === "Pending" ? "#f59e0b" : status === "In Progress" ? "#5169f6" : "#10b981",
                        }}
                        title={`${status}: ${count}`}
                      >
                        {count > 0 ? `${status}: ${count}` : status}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-sm font-semibold text-muted-foreground">Response time ranges</h5>
                {[
                  { range: "< 1 hour", min: 0, max: 1 },
                  { range: "1-8 hours", min: 1, max: 8 },
                  { range: "1-3 days", min: 8, max: 72 },
                  { range: "> 3 days", min: 72, max: Number.POSITIVE_INFINITY },
                ].map((bucket) => {
                  const count = analytics.responseTimes.filter((rt) => rt.hours >= bucket.min && rt.hours < bucket.max).length
                  const pct = (count / analytics.responseTimes.length) * 100

                  return (
                    <div key={bucket.range} className="field-panel p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>{bucket.range}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
