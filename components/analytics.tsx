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
    <Card className="surface-panel">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-black" style={{ color }}>
              {value}
            </p>
            {unit && <p className="mt-1 text-xs text-muted-foreground">{unit}</p>}
          </div>
          {Icon && (
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: `${color}1A` }}>
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Avg Response Time" value={analytics.avgResponseTime} unit="hours" color="#0b64d1" icon={Clock} />
        <MetricCard title="Avg Resolution Time" value={analytics.resolvedResponseTime} unit="hours" color="#10b981" icon={CheckCircle} />
        <MetricCard title="Geographic Hotspots" value={analytics.hotspots.length} unit="high-density areas" color="#f59e0b" icon={Flame} />
      </div>

      <Card className="surface-panel">
        <CardContent className="p-5">
          <h4 className="mb-5 flex items-center gap-2 text-lg font-bold">
            <TrendingUp className="h-5 w-5 text-primary" />
            Most Problematic Roads
          </h4>
          <div className="space-y-5">
            {analytics.mostProblematicRoads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available</p>
            ) : (
              analytics.mostProblematicRoads.map(([road, stats], idx) => {
                const maxCount = Math.max(...analytics.mostProblematicRoads.map((r) => r[1].count), 1)
                const percentage = (stats.count / maxCount) * 100
                const unresolved = stats.count - stats.resolved

                return (
                  <div key={road}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold">#{idx + 1} {road}</span>
                        <span className="ml-2 text-muted-foreground">{stats.count} reports</span>
                      </div>
                      <div className="text-muted-foreground">
                        {stats.critical > 0 && `${stats.critical} Critical`}
                        {stats.high > 0 && ` ${stats.high} High`}
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: stats.critical > 0 ? "#dc2626" : stats.high > 0 ? "#ea580c" : "#f59e0b",
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stats.resolved} resolved, {unresolved} pending
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardContent className="p-5">
          <h4 className="mb-5 flex items-center gap-2 text-lg font-bold">
            <Flame className="h-5 w-5 text-primary" />
            Geographic Hotspots
          </h4>
          {analytics.hotspots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {analytics.hotspots.map((spot, idx) => (
                <Card key={idx} className="rounded-xl border border-border/70 bg-background/70">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Flame className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Hotspot {idx + 1}</span>
                    </div>
                    <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                      <div>Lat: {spot.lat.toFixed(4)}</div>
                      <div>Lng: {spot.lng.toFixed(4)}</div>
                      <div className="pt-1 font-semibold text-primary">{spot.count} reports</div>
                    </div>
                    <Button
                      onClick={() => {
                        window.open(`https://www.google.com/maps/search/${spot.lat},${spot.lng}`, "_blank")
                      }}
                      className="w-full"
                      size="sm"
                    >
                      View on Map
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardContent className="p-5">
          <h4 className="mb-5 flex items-center gap-2 text-lg font-bold">
            <Clock className="h-5 w-5 text-primary" />
            Reports Trend (Last 7 Days)
          </h4>
          <div className="grid grid-cols-7 gap-3">
            {analytics.trendData.map((day, idx) => {
              const maxCount = Math.max(...analytics.trendData.map((d) => d.count), 1)
              const height = Math.max((day.count / maxCount) * 160, 2)

              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex h-[170px] items-end">
                    <div className="w-8 overflow-hidden rounded-md bg-muted" title={`${day.date}: ${day.count} reports`}>
                      <div className="w-full rounded-md bg-primary" style={{ height: `${height}px` }} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-sm font-bold text-primary">{day.count}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel">
        <CardContent className="p-5">
          <h4 className="mb-5 flex items-center gap-2 text-lg font-bold">
            <Clock className="h-5 w-5 text-primary" />
            Response Time Distribution
          </h4>
          {analytics.responseTimes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No response time data available</p>
          ) : (
            <div className="space-y-5">
              <div>
                <h5 className="text-sm font-semibold text-muted-foreground">Distribution by Status</h5>
                <div className="mt-2 flex gap-2">
                  {["Pending", "In Progress", "Resolved"].map((status) => {
                    const count = analytics.responseTimes.filter((rt) => rt.status === status).length
                    const pct = (count / analytics.responseTimes.length) * 100

                    return (
                      <div
                        key={status}
                        className="flex h-8 items-center justify-center rounded-md text-xs font-semibold text-white"
                        style={{
                          flex: pct || 1,
                          backgroundColor:
                            status === "Pending" ? "#f59e0b" : status === "In Progress" ? "#0b64d1" : "#10b981",
                        }}
                        title={`${status}: ${count}`}
                      >
                        {count > 0 ? count : ""}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-muted-foreground">Response Time Ranges</h5>
                <div className="mt-2 space-y-3">
                  {[
                    { range: "< 1 hour", min: 0, max: 1 },
                    { range: "1-8 hours", min: 1, max: 8 },
                    { range: "1-3 days", min: 8, max: 72 },
                    { range: "> 3 days", min: 72, max: Number.POSITIVE_INFINITY },
                  ].map((bucket) => {
                    const count = analytics.responseTimes.filter((rt) => rt.hours >= bucket.min && rt.hours < bucket.max).length
                    const pct = (count / analytics.responseTimes.length) * 100

                    return (
                      <div key={bucket.range}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>{bucket.range}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
