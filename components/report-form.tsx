"use client"

import { useEffect, useMemo, useState } from "react"
import axios, { AxiosError } from "axios"
import { CheckCircle2, FileImage, MapPin, Upload, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { API_BASE_URL } from "@/lib/api"

type Severity = "LOW" | "MEDIUM" | "HIGH"

type ReportFormData = {
  reporterName: string
  description: string
  severity: Severity
}

type LatLng = {
  lat: number
  lng: number
}

type ReportFormProps = {
  selectedLocation: LatLng | null
  onSubmit?: (newReport: unknown) => void
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

export default function ReportForm({ selectedLocation, onSubmit }: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    reporterName: "",
    description: "",
    severity: "MEDIUM",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const severityColors: Record<Severity, string> = useMemo(
    () => ({
      LOW: "border-emerald-500/20 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
      MEDIUM: "border-amber-500/20 bg-amber-500/12 text-amber-600 dark:text-amber-300",
      HIGH: "border-rose-500/20 bg-rose-500/12 text-rose-600 dark:text-rose-300",
    }),
    [],
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!selectedLocation) {
      setError("Please select a location on the map first")
      return
    }

    if (!formData.reporterName.trim()) {
      setError("Please enter your name")
      return
    }

    if (!formData.description.trim()) {
      setError("Please enter a description")
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("reporterName", formData.reporterName)
      fd.append("description", formData.description)
      fd.append("severity", formData.severity)
      fd.append("latitude", String(selectedLocation.lat))
      fd.append("longitude", String(selectedLocation.lng))

      photos.forEach((file) => fd.append("photos", file))

      // Let the browser set the multipart boundary for file uploads.
      const response = await apiClient.post("/potholes", fd)

      setSuccess(true)
      onSubmit?.(response.data)

      setFormData({ reporterName: "", description: "", severity: "MEDIUM" })
      setPhotos([])
      setPreviews([])

      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error("Full error object:", err)

      let errorMessage = "Failed to submit report"
      const backendUrl = apiClient.defaults.baseURL || "(unknown backend URL)"
      const axiosErr = err as AxiosError<{ message?: string }> & { code?: string; message?: string }

      if (axiosErr?.code === "ERR_NETWORK") {
        errorMessage = `Network error: Cannot connect to server at ${backendUrl}`
      } else if (axiosErr.response?.status === 0) {
        errorMessage = "Connection failed: Backend server is not accessible"
      } else if (axiosErr.response?.status === 404) {
        errorMessage = "API endpoint not found (404)"
      } else if (axiosErr.response?.status === 400) {
        errorMessage = axiosErr.response?.data?.message || "Invalid data submitted"
      } else if (axiosErr.response?.status === 500) {
        errorMessage = "Server error: " + (axiosErr.response?.data?.message || "Internal server error")
      } else if (axiosErr.message === "Network Error") {
        errorMessage = "Network error: Check if backend is running"
      } else {
        errorMessage = axiosErr.response?.data?.message || axiosErr.message || errorMessage
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file))
    setPreviews(urls)

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [photos])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3)
    setPhotos(files)
  }

  return (
    <div className="space-y-6">
      {/* UI-only redesign: the form keeps its exact submission logic while gaining a clearer editorial hierarchy. */}
      <div className="glass-subtle p-5">
        <p className="section-kicker">Report details</p>
        <h2 className="mt-2 text-2xl font-semibold">Capture the incident clearly.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Complete the form below and submit through the existing multipart reporting endpoint.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-[22px] border-red-500/25 bg-red-500/10">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="rounded-[22px] border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Report submitted successfully!</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Your Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={formData.reporterName}
              onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe pothole size, lane risk, and nearby landmarks..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[140px] resize-none"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-2">
              <Label htmlFor="severity" className="text-sm font-semibold">
                Severity Level
              </Label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as Severity })}
                className="select-field"
              >
                <option value="LOW">Low - Minor issue</option>
                <option value="MEDIUM">Medium - Noticeable damage</option>
                <option value="HIGH">High - Severe hazard</option>
              </select>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${severityColors[formData.severity]}`}>
                {formData.severity}
              </span>
            </div>

            <Card
              className={`rounded-[24px] border p-4 ${
                selectedLocation
                  ? "border-primary/25 bg-primary/8 dark:bg-white/7"
                  : "border-border/70 bg-white/60 dark:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-2xl ${
                    selectedLocation ? "bg-primary/12 text-primary dark:bg-white/10 dark:text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-primary text-sm font-semibold">Selected Location</p>
                  {selectedLocation ? (
                    <p className="mt-1 text-xs font-mono leading-6 text-muted-foreground">
                      Lat: {selectedLocation.lat.toFixed(5)}, Lng: {selectedLocation.lng.toFixed(5)}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">
                      Click the map to select the exact pothole position.
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <FileImage className="h-4 w-4" />
            Photos (Optional)
          </Label>
          <div className="rounded-[24px] border-2 border-dashed border-border/75 bg-white/58 p-6 backdrop-blur-md transition-colors hover:border-primary/35 hover:bg-white/72 dark:bg-white/6">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="flex cursor-pointer flex-col items-center gap-3 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="font-primary text-sm font-semibold">Click to upload photos</p>
                <p className="mt-1 text-xs text-muted-foreground">Up to 3 images (JPG, PNG)</p>
              </div>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              {previews.map((url, idx) => (
                <div key={idx} className="image-card p-2">
                  <div className="relative aspect-square overflow-hidden rounded-[18px]">
                    <img src={url || "/placeholder.svg"} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        <Button type="submit" disabled={loading || !selectedLocation} className="w-full">
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-b-transparent" />
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </form>
    </div>
  )
}
