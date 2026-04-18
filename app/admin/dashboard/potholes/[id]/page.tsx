"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import axios from "axios"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  ImageIcon,
  Mail,
  MapPinned,
  Phone,
  RefreshCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/protected-route"
import type { Pothole } from "@/components/types/pothole"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { API_BASE_URL } from "@/lib/api"
import { getPotholeImageUrls } from "@/lib/pothole-media"

type DetailState = {
  pothole: Pothole | null
  error: string | null
  loading: boolean
}

type BackendPotholeDetail = Pothole & {
  photos?: Array<{
    id?: string | number
    photoUrl?: string
    uploadedAt?: string
  }>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const normalizePothole = (payload: unknown, fallbackId: string): BackendPotholeDetail | null => {
  const candidate = isRecord(payload)
    ? (isRecord(payload.pothole) ? payload.pothole : isRecord(payload.data) ? payload.data : payload)
    : null

  if (!candidate) return null

  return {
    ...(candidate as BackendPotholeDetail),
    id: String(candidate.id ?? fallbackId),
  }
}

const formatDate = (value?: string) => {
  if (!value) return "-"

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
}

function PotholeDetailContent() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const potholeId = typeof params?.id === "string" ? params.id : ""

  const [authToken, setAuthToken] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [{ pothole, error, loading }, setDetailState] = useState<DetailState>({
    pothole: null,
    error: null,
    loading: true,
  })

  const imageUrls = useMemo(() => getPotholeImageUrls(pothole), [pothole])
  const activeImage = imageUrls[activeImageIndex] ?? imageUrls[0] ?? null

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

  useEffect(() => {
    if (activeImageIndex <= imageUrls.length - 1) return
    setActiveImageIndex(0)
  }, [activeImageIndex, imageUrls.length])

  const fetchPotholeDetails = useCallback(async () => {
    if (!authToken || !potholeId) return

    setDetailState((prev) => ({ ...prev, loading: true, error: null }))

    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    })

    try {
      // Match the backend contract: admin detail page loads from GET /admin/dashboard/potholes/:id.
      const response = await apiClient.get<BackendPotholeDetail>(`/admin/dashboard/potholes/${potholeId}`)

      const nextPothole = normalizePothole(response.data, potholeId)

      if (!nextPothole) {
        throw new Error("Pothole details were returned in an unexpected format.")
      }

      setDetailState({
        pothole: nextPothole,
        error: null,
        loading: false,
      })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
          ? err.message
          : "Failed to fetch pothole details"

      setDetailState({
        pothole: null,
        error: message,
        loading: false,
      })
    }
  }, [authToken, potholeId])

  useEffect(() => {
    void fetchPotholeDetails()
  }, [fetchPotholeDetails])

  return (
    <div className="page-shell">
      <Navigation />

      <main className="container mx-auto px-4 py-8 md:py-10">
        <Card className="surface-panel-dark hero-shine overflow-hidden p-0 screen-enter">
          <div className="ambient-strip h-1.5 w-full" />
          <CardContent className="grid gap-6 p-6 md:p-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-end">
            <div>
              <h1 className="heading-display mt-6 text-4xl text-white md:text-5xl">
                {pothole?.roadName || "Pothole report details"}
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/72 md:text-lg">
                Review the reporter, description, coordinates, and evidence image.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button asChild variant="outline" className="border-white/14 bg-white/10 text-white hover:bg-white/14">
                  <Link href="/admin/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                  </Link>
                </Button>
                <Button onClick={() => void fetchPotholeDetails()} disabled={loading} variant="outline">
                  <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh details
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-5">
                <p className="text-sm text-white/72">Reporter</p>
                <p className="mt-2 text-xl font-semibold text-blue-500">{pothole?.reporterName || "Not provided"}</p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-5">
                <p className="text-sm text-white/72">Status</p>
                <p className="mt-2 text-xl font-semibold text-white">{pothole?.status || "Pending"}</p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-5">
                <p className="text-sm text-white/72">Severity</p>
                <p className="mt-2 text-xl font-semibold text-white">{pothole?.severity || "Unknown"}</p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/8 p-5">
                <p className="text-sm text-white/72">Admin session</p>
                <p className="mt-2 truncate text-sm font-semibold text-white">{adminEmail || "Authenticated"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mt-6 rounded-[22px] border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <Card className="surface-panel overflow-hidden p-0">
            <CardContent className="space-y-5 p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker">Evidence image</p>
                  <h2 className="mt-2 text-2xl font-semibold">Reporter-submitted photo</h2>
                </div>
                {imageUrls.length > 0 && (
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    {imageUrls.length} image{imageUrls.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-[360px] rounded-[28px]" />
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-24 rounded-[20px]" />
                    <Skeleton className="h-24 rounded-[20px]" />
                    <Skeleton className="h-24 rounded-[20px]" />
                  </div>
                </div>
              ) : activeImage ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-[30px] border border-border/70 bg-slate-950/94">
                    <img
                      src={activeImage}
                      alt={pothole?.roadName ? `Pothole evidence for ${pothole.roadName}` : "Pothole evidence image"}
                      className="h-[360px] w-full object-cover md:h-[420px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-4">
                      {pothole?.roadName && <span className="status-pill border-white/18 text-white/90">{pothole.roadName}</span>}
                    </div>
                  </div>

                  {imageUrls.length > 1 && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {imageUrls.map((url, index) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`image-card overflow-hidden p-2 text-left transition-transform ${
                            index === activeImageIndex ? "ring-2 ring-primary/45" : ""
                          }`}
                        >
                          <div className="relative overflow-hidden rounded-[18px]">
                            <img
                              src={url}
                              alt={`Pothole evidence thumbnail ${index + 1}`}
                              className="h-24 w-full object-cover"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="field-panel grid min-h-[300px] place-items-center p-8 text-center">
                  <div>
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">No image returned yet</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      This report detail loaded, but the backend did not return a usable `photos[].photoUrl` for this
                      pothole.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="surface-panel">
              <CardContent className="space-y-5 p-5 md:p-6">
                <div>
                  <p className="section-kicker">Reporter details</p>
                  <h2 className="mt-2 text-2xl font-semibold">Context for this selected road</h2>
                </div>

                <div className="grid gap-3">
                  <div className="field-panel flex items-start gap-3 p-4">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                      <UserRound className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Reporter name</p>
                      <p className="mt-1 text-sm leading-6  text-blue-500">{pothole?.reporterName || "Not provided"}</p>
                    </div>
                  </div>

                  {pothole?.reporterEmail && (
                    <div className="field-panel flex items-start gap-3 p-4">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-white/10 dark:text-white">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Email</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{pothole.reporterEmail}</p>
                      </div>
                    </div>
                  )}

                  {pothole?.reporterPhone && (
                    <div className="field-panel flex items-start gap-3 p-4">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-white/10 dark:text-white">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Phone</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{pothole.reporterPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="surface-panel">
              <CardContent className="space-y-5 p-5 md:p-6">
                <div>
                  <p className="section-kicker">Report summary</p>
                  <h2 className="mt-2 text-2xl font-semibold">Description and location</h2>
                </div>

                <div className="field-panel p-4">
                  <p className="text-sm font-semibold">Description</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {pothole?.description || "No description was returned for this report."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="field-panel flex items-start gap-3 p-4">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-white/10 dark:text-white">
                      <MapPinned className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Coordinates</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {typeof pothole?.latitude === "number" && typeof pothole?.longitude === "number"
                          ? `${pothole.latitude.toFixed(5)}, ${pothole.longitude.toFixed(5)}`
                          : "Coordinates unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="field-panel flex items-start gap-3 p-4">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-white/10 dark:text-white">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Reported</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {formatDate(pothole?.reportedAt || pothole?.createdAt || pothole?.dateReported)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {typeof pothole?.latitude === "number" && typeof pothole?.longitude === "number" && (
                    <Button asChild className="min-w-[12rem]">
                      <a
                        href={`https://www.google.com/maps/search/${pothole.latitude},${pothole.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in Google Maps
                      </a>
                    </Button>
                  )}
                  <Button asChild variant="outline">
                    <Link href="/admin/dashboard">Return to list</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 bg-card/55 py-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
        Copyright {new Date().getFullYear()} RoadSafe Admin
      </footer>
    </div>
  )
}

export default function AdminPotholeDetailPage() {
  return (
    <ProtectedRoute>
      <PotholeDetailContent />
    </ProtectedRoute>
  )
}
