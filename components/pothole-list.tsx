"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Eye, MapPin, Search, SlidersHorizontal, Trash2 } from "lucide-react"
import type { Pothole } from "@/components/types/pothole"
import { cn } from "@/lib/utils"
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
      return "border-emerald-500/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
    case "In Progress":
      return "border-blue-500/20 bg-blue-500/12 text-blue-700 dark:text-blue-300"
    case "Pending":
    default:
      return "border-amber-500/20 bg-amber-500/12 text-amber-700 dark:text-amber-300"
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
  }, [filterStatus, filterSeverity, filterDistrict, filterDateFrom, filterDateTo, onFiltersChange])

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
      {/* UI-only redesign: filters and table rows now read like premium cards while admin actions stay unchanged. */}
      <Card className="surface-panel">
        <CardContent className="p-5 md:p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Filters and search</p>
              <h3 className="mt-2 text-2xl font-semibold">Refine the report list.</h3>
            </div>
            <div className="info-chip self-start md:self-auto">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
              Showing {sortedPotholes.length} of {potholes.length}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Road, district, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-field">
                <option value="all">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Severity</label>
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="select-field">
                <option value="all">All</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">District</label>
              <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="select-field">
                <option value="all">All</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                From
              </label>
              <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                To
              </label>
              <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface-panel overflow-hidden p-0">
        <CardContent className="p-4 md:p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-separate [border-spacing:0_12px]">
              <thead>
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="px-4 py-2 font-semibold">Road</th>
                  <th className="px-4 py-2 font-semibold">District</th>
                  <th className="px-4 py-2 font-semibold">Severity</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">Date</th>
                  <th className="px-4 py-2 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedPotholes.map((p) => {
                  const cellClass =
                    "border-y border-border/60 bg-white/72 px-4 py-4 text-sm shadow-[0_18px_44px_-36px_rgba(92,111,189,0.24)] backdrop-blur-md dark:bg-white/6"

                  return (
                    <tr key={p.id} className="group">
                      <td className={cn(cellClass, "rounded-l-[22px] border-l")}>
                        <button
                          className="font-primary text-left font-semibold text-foreground transition-colors hover:text-primary"
                          onClick={() => onSelectPothole?.(p.id)}
                        >
                          {p.roadName ?? "-"}
                        </button>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {p.description?.slice(0, 72) || "No description available."}
                        </p>
                      </td>
                      <td className={cellClass}>{p.district ?? "-"}</td>
                      <td className={cellClass}>
                        <Badge variant="outline">{p.severity ?? "Unknown"}</Badge>
                      </td>
                      <td className={cellClass}>
                        <select
                          value={p.status ?? "Pending"}
                          onChange={(e) => onUpdateStatus?.(p.id, e.target.value)}
                          className={cn(
                            "h-10 min-w-[8.5rem] rounded-full border px-4 text-xs font-semibold shadow-none outline-none",
                            getStatusClasses(p.status),
                          )}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={cn(cellClass, "text-muted-foreground")}>{formatDate(p.reportedAt || p.createdAt)}</td>
                      <td className={cn(cellClass, "rounded-r-[22px] border-r")}>
                        <div className="flex flex-wrap justify-center gap-2">
                          <Button asChild size="sm" variant="outline" className="rounded-2xl">
                            <Link href={`/admin/dashboard/potholes/${p.id}`}>
                              <Eye className="h-4 w-4" />
                              <span>Details</span>
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://www.google.com/maps/search/${p.latitude},${p.longitude}`, "_blank")}
                            className="rounded-2xl"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeletePothole?.(p.id)}
                            className="rounded-2xl text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
