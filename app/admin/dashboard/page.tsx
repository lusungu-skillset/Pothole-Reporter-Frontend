"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ComponentType } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Activity, BarChart3, LineChart, List, LogOut, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react"
import Analytics from "@/components/analytics"
import DashboardStats from "@/components/dashboard-stats"
import Navigation from "@/components/navigation"
import PotholeList from "@/components/pothole-list"
import ProtectedRoute from "@/components/protected-route"
import type { Pothole } from "@/components/types/pothole"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE_URL } from "@/lib/api"

type DashboardTab = "dashboard" | "list" | "analytics"

type PotholeFilters = {
  status?: string
  severity?: string
  district?: string
  dateFrom?: string
  dateTo?: string
}

function AdminDashboardContent() {
  const router = useRouter()

  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPotholeId, setSelectedPotholeId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard")
  const [adminEmail, setAdminEmail] = useState("")
  const [authToken, setAuthToken] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const email = localStorage.getItem("adminEmail")

    if (!token) {
      router.push("/admin")
      return
    }

    setAuthToken(token)
    setAdminEmail(email || "")
  }, [router])

  const getApiClient = useCallback(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : "",
        "Content-Type": "application/json",
      },
    })
  }, [authToken])

  const fetchPotholes = useCallback(async (filters: PotholeFilters = {}) => {
    try {
      setRefreshing(true)
      const apiClient = getApiClient()

      const params = new URLSearchParams()
      if (filters.status && filters.status !== "all") params.append("status", filters.status)
      if (filters.severity && filters.severity !== "all") params.append("severity", filters.severity.toUpperCase())
      if (filters.district && filters.district !== "all") params.append("district", filters.district)

      const url = `/admin/dashboard/potholes${params.toString() ? "?" + params.toString() : ""}`
      const response = await apiClient.get(url)

      const data = Array.isArray(response.data)
        ? response.data.map((p: any) => ({ ...p, id: String(p.id) }))
        : []

      setPotholes(data)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching potholes:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch potholes")
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [getApiClient])

  useEffect(() => {
    if (!authToken) return
    void fetchPotholes()
    const interval = setInterval(() => {
      void fetchPotholes()
    }, 5000)
    return () => clearInterval(interval)
  }, [authToken, fetchPotholes])

  const handleUpdateStatus = useCallback(async (id: string, newStatus: string) => {
    try {
      const apiClient = getApiClient()
      await apiClient.put(`/admin/dashboard/potholes/${id}`, { status: newStatus })
      setPotholes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus as Pothole["status"] } : p)),
      )
    } catch (err: any) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message))
    }
  }, [getApiClient])

  const handleDeletePothole = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return

    try {
      const apiClient = getApiClient()
      await apiClient.delete(`/admin/dashboard/potholes/${id}`)
      setPotholes((prev) => prev.filter((p) => p.id !== id))
      if (selectedPotholeId === id) {
        setSelectedPotholeId(null)
      }
    } catch (err: any) {
      alert("Failed to delete report: " + (err.response?.data?.message || err.message))
    }
  }, [getApiClient, selectedPotholeId])

  const handleFiltersChange = useCallback((filters: PotholeFilters) => {
    void fetchPotholes(filters)
  }, [fetchPotholes])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("adminEmail")
    router.push("/admin")
  }, [router])

  const statusSummary = useMemo(() => {
    return potholes.reduce(
      (acc, pothole) => {
        if (pothole.status === "Pending") acc.pending += 1
        if (pothole.status === "In Progress") acc.inProgress += 1
        if (pothole.status === "Resolved") acc.resolved += 1
        return acc
      },
      { pending: 0, inProgress: 0, resolved: 0 },
    )
  }, [potholes])

  if (loading) {
    return (
      <div className="page-shell">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  const tabs: Array<{ key: DashboardTab; label: string; icon: ComponentType<{ className?: string }> }> = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "list", label: "All Potholes", icon: List },
    { key: "analytics", label: "Analytics", icon: LineChart },
  ]

  return (
    <div className="page-shell">
     

      <main className="container mx-auto px-4 py-8 md:py-10">
        {/* UI-only redesign: the admin workspace now uses a premium hero summary and softer tab shell. */}
        <Card className="surface-panel-dark hero-shine screen-enter overflow-hidden p-0">
          <div className="ambient-strip h-1.5 w-full" />
          <CardContent className="grid gap-6 p-6 md:p-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-end">
            <div>

              <h1 className="heading-display mt-6 text-5xl text-white md:text-6xl">Admin operations dashboard.</h1>
              <p className="mt-4 max-w-2xl text-lg text-white/72">
                Logged in as <span className="font-semibold text-white">{adminEmail}</span>. Review reports, update
                repair statuses, and monitor reporting trends through the same connected admin API routes.
              </p>
              {selectedPotholeId && (
                <div className="mt-4 inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold text-white/78">
                  Selected report ID: {selectedPotholeId}
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-5 sm:col-span-2">
                <p className="section-kicker text-white/70">Reports loaded</p>
                <p className="stat-value mt-3 text-4xl text-white">{potholes.length}</p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-5">
                <p className="text-sm text-white/72">Pending</p>
                <p className="stat-value mt-2 text-3xl text-white">{statusSummary.pending}</p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-5">
                <p className="text-sm text-white/72">In progress</p>
                <p className="stat-value mt-2 text-3xl text-white">{statusSummary.inProgress}</p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-5">
                <p className="text-sm text-white/72">Resolved</p>
                <p className="stat-value mt-2 text-3xl text-white">{statusSummary.resolved}</p>
              </div>
              <div className="flex flex-col gap-3 sm:justify-end">
                <Button onClick={() => fetchPotholes()} disabled={refreshing} variant="outline" className="w-full">
                  <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Button>
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between screen-enter">
          <div className="glass-subtle inline-grid grid-cols-1 gap-2 rounded-[26px] p-2 md:grid-cols-3">
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                variant={activeTab === tab.key ? "default" : "ghost"}
                className="justify-start rounded-2xl md:justify-center"
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-[22px] border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-6">
          {activeTab === "dashboard" && <DashboardStats potholes={potholes} />}

          {activeTab === "list" && (
            <PotholeList
              potholes={potholes}
              onUpdateStatus={handleUpdateStatus}
              onDeletePothole={handleDeletePothole}
              onSelectPothole={(id: string) => setSelectedPotholeId(id)}
              onFiltersChange={handleFiltersChange}
            />
          )}

          {activeTab === "analytics" && <Analytics potholes={potholes} />}
        </div>
      </main>

      <footer className="border-t border-border/60 bg-card/55 py-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
        Copyright {new Date().getFullYear()} RoadSafe Admin
      </footer>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
