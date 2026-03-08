"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { AlertCircle, Compass, MapPin } from "lucide-react"
import Navigation from "@/components/navigation"
import { Card } from "@/components/ui/card"

type LatLng = {
  lat: number
  lng: number
}

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-muted/30">
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
})

const ReportForm = dynamic(() => import("@/components/report-form"), {
  ssr: false,
})

export default function ReportPage() {
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null)

  const handleReportSubmit = (_newReport: unknown) => {
    setSelectedLocation(null)
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pb-14">
        <section className="relative overflow-hidden border-b border-border/70 py-12">
          <div className="road-grid absolute inset-0 opacity-45" />
          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">Report a Pothole</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Select the exact map location, then submit the report details. Your existing backend API and upload flow remain unchanged.
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <div className="surface-panel p-4">
                <p className="text-sm text-muted-foreground">Step 1</p>
                <p className="mt-1 font-semibold">Pin the location</p>
              </div>
              <div className="surface-panel p-4">
                <p className="text-sm text-muted-foreground">Step 2</p>
                <p className="mt-1 font-semibold">Add details and photos</p>
              </div>
              <div className="surface-panel p-4">
                <p className="text-sm text-muted-foreground">Step 3</p>
                <p className="mt-1 font-semibold">Submit to operations</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-10">
          {!selectedLocation && (
            <Card className="surface-panel mb-6 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Start by selecting a position on the map</p>
                  <p className="text-sm text-muted-foreground">Precise coordinates improve dispatch and repair speed.</p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card className="surface-panel p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <Compass className="h-5 w-5 text-primary" />
                  Select Location
                </h2>
                {selectedLocation ? (
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                    Location selected
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Waiting for pin</span>
                )}
              </div>

              <div className="h-[560px] overflow-hidden rounded-xl border border-border/70">
                <Map onSelect={setSelectedLocation} />
              </div>

              {selectedLocation && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-mono text-muted-foreground">
                    {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                  </span>
                </div>
              )}
            </Card>

            <Card className="surface-panel p-5 md:p-6">
              <ReportForm selectedLocation={selectedLocation} onSubmit={handleReportSubmit} />
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-card/70 py-8">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-3 text-center text-sm text-muted-foreground md:flex-row md:text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/90 text-primary-foreground font-bold">RS</div>
            <span className="font-semibold">RoadSafe Reporting</span>
          </div>
          <p>Location-first reporting that plugs directly into your existing backend services.</p>
        </div>
      </footer>
    </div>
  )
}
