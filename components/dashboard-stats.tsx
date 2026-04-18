"use client"

import { useEffect, useMemo, useState } from "react"
import type { ComponentType, CSSProperties } from "react"
import axios from "axios"
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE_URL } from "@/lib/api"

type PotholeItem = {
  status?: string
  severity?: string
  district?: string
}

type DashboardStatsResponse = {
  total?: number
  byStatus?: Array<{ status: string; count: number }>
  bySeverity?: Array<{ severity: string; count: number }>
  byDistrict?: Array<{ district: string; count: number }>
}

export default function DashboardStats({ potholes = [], apiClient }: { potholes: PotholeItem[]; apiClient?: any }) {
  const [statsFromApi, setStatsFromApi] = useState<DashboardStatsResponse | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const client =
          apiClient ||
          axios.create({
            baseURL: API_BASE_URL,
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          })

        const res = await client.get("/admin/dashboard/stats")
        setStatsFromApi(res.data)
      } catch (err) {
        console.error("Failed to load stats", err)
      }
    }

    fetchStats()
  }, [apiClient])

  const stats = useMemo(() => {
    const baseTotal = statsFromApi?.total ?? potholes.length

    const byStatus: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    const byDistrict: Record<string, number> = {}

    potholes.forEach((p) => {
      if (p.status) byStatus[p.status] = (byStatus[p.status] || 0) + 1
      if (p.severity) bySeverity[p.severity] = (bySeverity[p.severity] || 0) + 1
      if (p.district) byDistrict[p.district] = (byDistrict[p.district] || 0) + 1
    })

    return {
      total: baseTotal,
      pending: byStatus["Pending"] || 0,
      inProgress: byStatus["In Progress"] || 0,
      resolved: byStatus["Resolved"] || 0,
      severity: bySeverity,
      districts: byDistrict,
    }
  }, [statsFromApi, potholes])

  const widthPercent = (value: number) => {
    if (stats.total <= 0) return "0%"
    return `${(value / stats.total) * 100}%`
  }

  const StatCard = ({
    title,
    value,
    color,
    icon: Icon,
    sub,
  }: {
    title: string
    value: number
    color: string
    icon: ComponentType<{ className?: string; style?: CSSProperties }>
    sub?: string
  }) => (
    <Card className="metric-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl" style={{ backgroundColor: `${color}18` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="h-2 w-20 rounded-full" style={{ background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0))` }} />
        </div>
        <p className="stat-value mt-6 text-4xl" style={{ color }}>
          {value}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{title}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Reports" value={stats.total} color="#5169f6" icon={AlertTriangle} />
        <StatCard title="Pending" value={stats.pending} color="#f59e0b" icon={Clock} />
        <StatCard title="In Progress" value={stats.inProgress} color="#3b82f6" icon={TrendingUp} />
        <StatCard title="Resolved" value={stats.resolved} color="#10b981" icon={CheckCircle} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="surface-panel">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="section-kicker">Severity mix</p>
                <h4 className="mt-2 text-2xl font-semibold">Distribution by urgency</h4>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.severity).length === 0 && (
                <p className="text-sm text-muted-foreground">No severity data available.</p>
              )}
              {Object.entries(stats.severity).map(([k, v], index) => {
                const barColor = ["#5169f6", "#06b6d4", "#8b5cf6", "#f59e0b"][index % 4]

                return (
                  <div key={k} className="field-panel p-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-primary font-medium">{k}</span>
                      <span className="text-muted-foreground">{v}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: widthPercent(v), backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardContent className="p-6">
            <div className="mb-6">
              <p className="section-kicker">District mix</p>
              <h4 className="mt-2 text-2xl font-semibold">Where reports are concentrated</h4>
            </div>
            <div className="space-y-4">
              {Object.entries(stats.districts).length === 0 && (
                <p className="text-sm text-muted-foreground">No district data available.</p>
              )}
              {Object.entries(stats.districts).map(([district, value]) => (
                <div key={district} className="field-panel p-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-primary font-medium">{district}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
                    <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: widthPercent(value) }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-panel-dark p-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="section-kicker text-white/70">Key insights</p>
              <h4 className="mt-2 text-2xl font-semibold text-white">What the current status mix is telling you.</h4>
              <ul className="mt-4 space-y-2 text-sm text-white/74">
                <li>{stats.resolved} reports resolved</li>
                <li>{stats.pending} still pending review or action</li>
                <li>{stats.inProgress} actively under repair</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
