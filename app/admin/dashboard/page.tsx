"use client"

import { useEffect, useState } from "react"
import type { ComponentType } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Activity, BarChart3, LineChart, List, LogOut, RefreshCcw, ShieldCheck } from "lucide-react"
import Analytics from "@/components/analytics"
import DashboardStats from "@/components/dashboard-stats"
import Navigation from "@/components/navigation"
import PotholeList from "@/components/pothole-list"
import ProtectedRoute from "@/components/protected-route"
import type { Pothole } from "@/components/types/pothole"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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

  const getApiClient = () => {
    return axios.create({
      baseURL: "http://localhost:3005",
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : "",
        "Content-Type": "application/json",
      },
    })
  }

  const fetchPotholes = async (filters: PotholeFilters = {}) => {
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
  }

  useEffect(() => {
    if (!authToken) return
    fetchPotholes()
    const interval = setInterval(fetchPotholes, 5000)
    return () => clearInterval(interval)
  }, [authToken])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const apiClient = getApiClient()
      await apiClient.put(`/admin/dashboard/potholes/${id}`, { status: newStatus })
      setPotholes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus as Pothole["status"] } : p)),
      )
    } catch (err: any) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDeletePothole = async (id: string) => {
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
  }

  const handleFiltersChange = (filters: PotholeFilters) => {
    fetchPotholes(filters)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("adminEmail")
    router.push("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen">
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
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <Card className="surface-panel mb-6 overflow-hidden">
          <div className="ambient-strip h-1.5 w-full" />
          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-7">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Authenticated Session
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Admin Operations Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Logged in as <span className="font-semibold text-foreground">{adminEmail}</span>
              </p>
              {selectedPotholeId && (
                <p className="mt-3 inline-flex rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  Selected report ID: {selectedPotholeId}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/70 p-4 sm:col-span-2">
                <p className="text-sm text-muted-foreground">Total reports loaded</p>
                <p className="mt-1 text-3xl font-black text-blue-500">{potholes.length}</p>
              </div>
              <Button onClick={() => fetchPotholes()} disabled={refreshing} variant="outline" className="h-11 rounded-xl">
                <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="h-11 rounded-xl">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </Card>

        <div className="mb-6 grid gap-2 rounded-2xl border border-border/70 bg-card/70 p-2 md:inline-grid md:grid-cols-3">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              variant={activeTab === tab.key ? "default" : "ghost"}
              className="h-10 rounded-xl justify-start md:justify-center"
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
        )}

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

        <div className="mt-10 rounded-xl border border-border/70 bg-card/60 p-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Dashboard uses your existing admin API routes for read, update, and delete operations.
          </div>
        </div>
      </main>

      <footer className="border-t border-border/70 bg-card/70 py-8 text-center text-sm text-muted-foreground">
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
