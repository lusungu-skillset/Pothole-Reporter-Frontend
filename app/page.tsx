"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle, Clock, MapPin, Route, ShieldCheck, TimerReset } from "lucide-react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const [stats, setStats] = useState({ reported: "-", repaired: "-", pending: "-" })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const res = await fetch("http://localhost:3005/potholes", {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        const data = await res.json()
        const potholes = Array.isArray(data) ? data : []

        const reported = potholes.length
        const repaired = potholes.filter((p) => p.status?.toLowerCase() === "resolved").length
        const pending = potholes.filter((p) => p.status?.toLowerCase() === "pending").length

        setStats({
          reported: reported.toString(),
          repaired: repaired.toString(),
          pending: pending.toString(),
        })
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.log("[home] API not available - using placeholder stats")
        }
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const quickStats = [
    {
      title: "Potholes Reported",
      value: stats.reported,
      icon: AlertTriangle,
      badgeClass: "bg-blue-500/15 text-blue-500",
    },
    {
      title: "Under Review",
      value: stats.pending,
      icon: Clock,
      badgeClass: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
    },
    {
      title: "Roads Fixed",
      value: stats.repaired,
      icon: CheckCircle,
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        <section className="relative overflow-hidden border-b border-border/70 py-16 md:py-24">
          <div className="road-grid absolute inset-0 opacity-45" />
          <div className="container relative mx-auto px-4">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
              <div className="space-y-7">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                  Report Road Hazards. Improve Road Safety.
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  Help make roads safer by reporting potholes in seconds. Your report helps road authorities locate
                  hazards quickly and repair damaged roads for everyone.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full px-7">
                    <Link href="/report">
                      <MapPin className="mr-2 h-5 w-5" />
                      Report Pothole
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                    <Link href="/map">
                      <Route className="mr-2 h-5 w-5" />
                      View Map
                    </Link>
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="surface-panel p-4">
                    <p className="text-sm text-muted-foreground">Potholes Reported</p>
                    <p className="mt-1 text-2xl font-bold text-blue-500">{stats.reported}</p>
                  </div>
                  <div className="surface-panel p-4">
                    <p className="text-sm text-muted-foreground">Reports In Progress</p>
                    <p className="mt-1 text-2xl font-bold text-primary">{stats.pending}</p>
                  </div>
                  <div className="surface-panel p-4">
                    <p className="text-sm text-muted-foreground">Roads Fixed</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-500">{stats.repaired}</p>
                  </div>
                </div>
              </div>

              <Card className="hero-shine surface-panel overflow-hidden p-0">
                <div className="ambient-strip h-1.5 w-full" />
                <CardContent className="space-y-5 p-6 md:p-8">
                  <div className="rounded-xl border border-border/70 bg-background/75 p-3">
                    <img
                      src="/damaged-road-with-pothole-requiring-repair.jpg"
                      alt="Damaged road with a pothole requiring repair"
                      className="h-60 w-full rounded-lg object-cover md:h-72"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/75 px-4 py-3">
                      <span className="text-sm text-muted-foreground">Report Submitted</span>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">Received</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/75 px-4 py-3">
                      <span className="text-sm text-muted-foreground">Reviewed by Authorities</span>
                      <span className="text-sm font-semibold text-blue-500">In Progress</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card/75 px-4 py-3">
                      <span className="text-sm text-muted-foreground">Location Verified</span>
                      <span className="text-sm font-semibold text-primary">Ready for Repair</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 md:py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Community Road Safety Overview</h2>
              <p className="text-sm text-muted-foreground">
                Live updates showing potholes reported and repairs completed by road authorities.
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {quickStats.map((item) => (
              <Card key={item.title} className="surface-panel">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-xl px-3 py-2 ${item.badgeClass}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <p className="text-3xl font-black tracking-tight">{item.value}</p>
                  </div>
                  <p className="mt-4 text-sm font-semibold">{item.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/40 py-14 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-bold md:text-3xl">How Reporting Works</h2>
              <p className="mt-2 text-muted-foreground">
                Reporting a pothole is quick and helps authorities repair roads faster.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Mark the Location",
                  body: "Pin the exact location of the pothole on the map so repair teams can find it easily.",
                },
                {
                  title: "Add Details",
                  body: "Upload a photo and provide a short description of the road damage.",
                },
                {
                  title: "Authorities Review",
                  body: "Road officials review reports and schedule repair work where needed.",
                },
                {
                  title: "Track Progress",
                  body: "Follow updates as the pothole is reviewed and eventually repaired.",
                },
              ].map((step, index) => (
                <Card key={step.title} className="surface-panel">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 md:py-16">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="surface-panel">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold">Our Commitment</h3>
                <div className="mt-5 space-y-4">
                  {[
                    { icon: TimerReset, text: "Quick reporting that helps authorities respond faster." },
                    { icon: ShieldCheck, text: "Reliable reporting that helps improve road safety." },
                    { icon: Route, text: "Accurate map locations that guide repair teams directly to the issue." },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/75 p-3">
                      <item.icon className="mt-0.5 h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="surface-panel">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold">Ready To Report</h3>
                <p className="mt-3 text-muted-foreground">
                  Spotted a pothole? Report it now and help make roads safer for everyone in your community.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full px-6">
                    <Link href="/report">Report a Pothole</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full px-6">
                    <Link href="/admin">Admin Portal</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-card/70 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-semibold">Copyright {new Date().getFullYear()} RoadSafe</p>
          <p className="mt-2">Building safer roads through community reporting.</p>
        </div>
      </footer>
    </div>
  )
}