"use client"

import { useEffect, useMemo, useState } from "react"
import type { ComponentType, CSSProperties } from "react"
import axios from "axios"
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
            baseURL: "http://localhost:3005",
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
    <Card className="surface-panel">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ backgroundColor: `${color}1A` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-black" style={{ color }}>
              {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Reports" value={stats.total} color="#0b64d1" icon={AlertTriangle} />
        <StatCard title="Pending" value={stats.pending} color="#f59e0b" icon={Clock} />
        <StatCard title="In Progress" value={stats.inProgress} color="#0b64d1" icon={TrendingUp} />
        <StatCard title="Resolved" value={stats.resolved} color="#10b981" icon={CheckCircle} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="surface-panel">
          <CardContent className="p-5">
            <h4 className="mb-4 text-lg font-bold">Severity Distribution</h4>
            <div className="space-y-3">
              {Object.entries(stats.severity).length === 0 && (
                <p className="text-sm text-muted-foreground">No severity data available.</p>
              )}
              {Object.entries(stats.severity).map(([k, v]) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{k}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: widthPercent(v) }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="surface-panel">
          <CardContent className="p-5">
            <h4 className="mb-4 text-lg font-bold">District Distribution</h4>
            <div className="space-y-3">
              {Object.entries(stats.districts).length === 0 && (
                <p className="text-sm text-muted-foreground">No district data available.</p>
              )}
              {Object.entries(stats.districts).map(([d, v]) => (
                <div key={d}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{d}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: widthPercent(v) }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-panel">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <h4 className="mb-2 font-bold">Key Insights</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>{stats.resolved} reports resolved</li>
                <li>{stats.pending} still pending</li>
                <li>{stats.inProgress} under active repair</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
