"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { AlertCircle, Compass, MapPin, Radar, Sparkles } from "lucide-react"
import Navigation from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"

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
    <div className="page-shell">
      <Navigation />

      <main className="pb-14">
        <section className="relative overflow-hidden pb-10 pt-4 md:pb-14 md:pt-8">
          <div className="road-grid absolute inset-0 opacity-40" />
          <div className="container relative mx-auto px-4">
            {/* UI-only redesign: location selection and form now sit in a more premium split workspace. */}
            <div className="max-w-3xl screen-enter">
              
              <h1 className="heading-display mt-6 text-5xl md:text-6xl">Report a pothole with precision.</h1>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Step 1", "Pin the location", "Choose the exact place on the map where the road is damaged."],
                ["Step 2", "Add context", "Describe the pothole and attach optional photo evidence."],
                ["Step 3", "Submit to ops", "Your report is sent to the city for review and repair dispatch."],
              ].map(([label, title, body]) => (
                <div key={title} className="glass-subtle lift-hover screen-enter p-5">
                  <p className="section-kicker">{label}</p>
                  <p className="mt-2 font-primary text-lg font-semibold text-foreground">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-2 md:py-4">
          {!selectedLocation && (
            <Card className="surface-panel mb-6">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-primary text-base font-semibold">Start by placing a pin on the map.</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Accurate coordinates help authorities review and route repair teams faster.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <Card className="surface-panel screen-enter overflow-hidden p-0">
              <CardContent className="p-0">
                <div className="border-b border-border/60 px-6 py-6 md:px-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="section-kicker">Map selection</p>
                      <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                        <Compass className="h-5 w-5 text-primary" />
                        Select the pothole location
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Tap the map to capture the exact coordinates before you complete the form.
                      </p>
                    </div>
                    <span className={selectedLocation ? "info-chip" : "rounded-full bg-muted px-3.5 py-2 text-xs font-semibold text-muted-foreground"}>
                      {selectedLocation ? "Location selected" : "Waiting for pin"}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    <div className="field-panel flex items-start gap-3 p-4">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                        <Radar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-primary text-sm font-semibold">Map guidance</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Zoom in and click the road damage point for the cleanest dispatch handoff.
                        </p>
                      </div>
                    </div>
                    <div className="field-panel flex items-start gap-3 p-4">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-white/10 dark:text-white">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-primary text-sm font-semibold">Selected coordinates</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {selectedLocation
                            ? `${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}`
                            : "No point selected yet. Click the map to capture the exact spot."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-border/70 bg-white/55 shadow-[0_24px_60px_-38px_rgba(92,111,189,0.34)] backdrop-blur-xl dark:bg-white/6">
                    <div className="h-[560px]">
                      <Map onSelect={setSelectedLocation} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="xl:sticky xl:top-28 xl:self-start">
              <Card className="surface-panel screen-enter p-5 md:p-6">
                <ReportForm selectedLocation={selectedLocation} onSubmit={handleReportSubmit} />
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-card/55 py-8 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col gap-3 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-primary font-semibold text-foreground">RoadSafe</p>
          </div>
          <p>Copyright {new Date().getFullYear()} RoadSafe</p>
        </div>
      </footer>
    </div>
  )
}
