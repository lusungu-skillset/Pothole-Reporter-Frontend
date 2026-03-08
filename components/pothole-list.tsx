"use client"

import { useEffect, useMemo, useState } from "react"
import { MapPin, Trash2 } from "lucide-react"
import type { Pothole } from "@/components/types/pothole"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface PotholeListProps {
  potholes: Pothole[]
  onUpdateStatus?: (id: string, status: string) => Promise<void> | void
  onDeletePothole?: (id: string) => void
  onSelectPothole?: (id: string) => void
  onFiltersChange?: (filters: {
    status?: string
    severity?: string
    district?: string
    dateFrom?: string
    dateTo?: string
  }) => void
}

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"] as const

const getStatusClasses = (status?: string) => {
  switch (status) {
    case "Resolved":
      return "bg-emerald-500 text-white"
    case "In Progress":
      return "bg-blue-500 text-white"
    case "Pending":
    default:
      return "bg-amber-400 text-black"
  }
}

export default function PotholeList({
  potholes,
  onUpdateStatus,
  onDeletePothole,
  onSelectPothole,
  onFiltersChange,
}: PotholeListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterDistrict, setFilterDistrict] = useState("all")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")

  useEffect(() => {
    onFiltersChange?.({
      status: filterStatus,
      severity: filterSeverity,
      district: filterDistrict,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
    })
  }, [filterStatus, filterSeverity, filterDistrict, filterDateFrom, filterDateTo])

  const formatDate = (value?: string) => {
    if (!value) return "-"
    const date = new Date(value)
    return isNaN(date.getTime())
      ? "-"
      : date.toLocaleString("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
  }

  const districts = useMemo(() => {
    return Array.from(new Set(potholes.map((p) => p.district).filter(Boolean))).sort()
  }, [potholes])

  const filteredPotholes = useMemo(() => {
    return potholes.filter((p) => {
      const matchesSearch =
        p.roadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.district?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || p.status === filterStatus
      const matchesSeverity = filterSeverity === "all" || p.severity === filterSeverity
      const matchesDistrict = filterDistrict === "all" || p.district === filterDistrict

      let matchesDate = true
      if (filterDateFrom || filterDateTo) {
        const date = new Date(p.reportedAt || p.createdAt || "")
        if (filterDateFrom && new Date(filterDateFrom) > date) matchesDate = false
        if (filterDateTo && new Date(filterDateTo) < date) matchesDate = false
      }

      return Boolean(matchesSearch) && matchesStatus && matchesSeverity && matchesDistrict && matchesDate
    })
  }, [
    potholes,
    searchTerm,
    filterStatus,
    filterSeverity,
    filterDistrict,
    filterDateFrom,
    filterDateTo,
  ])

  const sortedPotholes = useMemo(() => {
    return [...filteredPotholes].sort(
      (a, b) =>
        new Date(b.reportedAt || b.createdAt || "").getTime() -
        new Date(a.reportedAt || a.createdAt || "").getTime(),
    )
  }, [filteredPotholes])

  return (
    <div className="space-y-6">
      <Card className="surface-panel">
        <CardContent className="p-5 md:p-6">
          <h3 className="mb-4 text-lg font-bold">Filters and Search</h3>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-semibold">Search</label>
              <Input
                placeholder="Road, district, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 rounded-xl border-border/80 bg-background/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 w-full rounded-xl border border-border/80 bg-background/70 px-3 text-sm"
              >
                <option value="all">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="h-10 w-full rounded-xl border border-border/80 bg-background/70 px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">District</label>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="h-10 w-full rounded-xl border border-border/80 bg-background/70 px-3 text-sm"
              >
                <option value="all">All</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">From</label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="h-10 rounded-xl border-border/80 bg-background/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">To</label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="h-10 rounded-xl border-border/80 bg-background/70"
              />
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Showing <strong>{sortedPotholes.length}</strong> of <strong>{potholes.length}</strong> potholes
          </p>
        </CardContent>
      </Card>

      <Card className="surface-panel overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px]">
            <thead className="bg-muted/45 text-sm">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Road</th>
                <th className="px-4 py-3 text-left font-semibold">District</th>
                <th className="px-4 py-3 text-left font-semibold">Severity</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPotholes.map((p) => (
                <tr key={p.id} className="border-t border-border/70 text-sm hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <button
                      className="font-medium text-foreground hover:text-primary"
                      onClick={() => onSelectPothole?.(p.id)}
                    >
                      {p.roadName ?? "-"}
                    </button>
                  </td>
                  <td className="px-4 py-3">{p.district ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{p.severity ?? "Unknown"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status ?? "Pending"}
                      onChange={(e) => onUpdateStatus?.(p.id, e.target.value)}
                      className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold ${getStatusClasses(p.status)}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.reportedAt || p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`https://www.google.com/maps/search/${p.latitude},${p.longitude}`, "_blank")}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeletePothole?.(p.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
