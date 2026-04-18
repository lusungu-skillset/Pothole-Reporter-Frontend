"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle,
  Clock,
  Crosshair,
  MapPin,
  Route,
  Sparkles,
} from "lucide-react"
import Navigation from "@/components/navigation"
import { Reveal } from "@/components/ui/reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getApiUrl } from "@/lib/api"

export default function HomePage() {
  const [stats, setStats] = useState({ reported: "-", repaired: "-", pending: "-" })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(getApiUrl("/potholes"), {
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
      title: "Reported",
      value: stats.reported,
      icon: AlertTriangle,
      accent: "from-blue-500 to-cyan-400",
      glow: "bg-blue-500/12 text-blue-600 dark:text-blue-300",
    },
    {
      title: "In Review",
      value: stats.pending,
      icon: Clock,
      accent: "from-violet-500 to-fuchsia-400",
      glow: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    },
    {
      title: "Fixed",
      value: stats.repaired,
      icon: CheckCircle,
      accent: "from-emerald-500 to-cyan-400",
      glow: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    },
  ]

  const highlights = [
    {
      icon: Crosshair,
      title: "Exact pin",
      body: "Select the road damage precisely.",
    },
    {
      icon: Camera,
      title: "Photo proof",
      body: "Keep pothole imagery clear and intact.",
    },
    {
      icon: Sparkles,
      title: "Live status",
      body: "Track review and repair progress.",
    },
  ]

  const workflow = [
    {
      title: "Pin the spot",
      body: "Mark the exact pothole location on the map.",
    },
    {
      title: "Add details",
      body: "Attach a description and optional photos.",
    },
    {
      title: "Track progress",
      body: "Authorities review and update the report.",
    },
  ]

  return (
    <div className="page-shell">
      <Navigation />

      <main>
        <section className="relative overflow-hidden pb-16 pt-4 md:pb-24 md:pt-8">
          <div className="road-grid absolute inset-0 opacity-40" />
          <div className="container relative mx-auto px-4">
            <div className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
              <div className="space-y-8 mt-[10vh]">
                <div className="space-y-5">
                  <Reveal as="h1" delay={80} className="heading-display text-5xl sm:text-6xl xl:text-7xl">
                    Report potholes faster. Keep roads safer.
                  </Reveal>
                  <Reveal as="p" delay={140} className="body-copy max-w-2xl text-lg text-muted-foreground md:text-xl">
                    Pin the damage, add a photo, and help repair teams respond with confidence.
                  </Reveal>
                </div>

                <Reveal delay={200} className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="px-7">
                    <Link href="/report">
                      <MapPin className="h-5 w-5" />
                      Report Pothole
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="px-7">
                    <Link href="/map">
                      <Route className="h-5 w-5" />
                      Explore Live Map
                    </Link>
                  </Button>
                </Reveal>

                <div className="grid gap-4 md:grid-cols-3 mt-[6vh]">
                  {quickStats.map((item, index) => (
                    <Reveal key={item.title} delay={260 + index * 70}>
                      <Card className="metric-card">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${item.glow}`}>
                              <item.icon className="h-5 w-5" />
                            </div>
                            <div className={`h-2 w-20 rounded-full bg-gradient-to-r ${item.accent} opacity-85`} />
                          </div>
                          <p className="stat-value mt-6 text-4xl">{item.value}</p>
                          <p className="mt-2 text-sm text-muted-foreground">{item.title}</p>
                        </CardContent>
                      </Card>
                    </Reveal>
                  ))}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {highlights.map((item, index) => (
                    <Reveal key={item.title} delay={360 + index * 60}>
                      <div className="glass-subtle p-4">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <h2 className="font-primary text-base font-semibold">{item.title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <Reveal delay={180} className="hidden md:block xl:-mt-8 xl:self-start">
                <div className="hero-shine relative min-h-[680px] overflow-hidden rounded-tr-[36px] rounded-br-[36px] rounded-bl-[36px] rounded-tl-[128px] border border-white/12 shadow-[0_40px_120px_-56px_rgba(11,17,53,0.95)] md:min-h-[740px] xl:min-h-[780px] left-15">
                  <img
                    src="/damaged-road-with-pothole-requiring-repair.jpg"
                    alt="Damaged road with a pothole requiring repair"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/68 via-slate-950/16 to-slate-950/82" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(132,156,255,0.24),transparent_28%)]" />

                  <div className="relative flex h-full min-h-[680px] flex-col justify-between p-6 md:min-h-[740px] md:p-8 xl:min-h-[780px] xl:p-10">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-md">
                        <p className="section-kicker text-white/70">Incident preview</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                          Keep pothole evidence clear and actionable.
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-4">

                      <div className="grid gap-3 md:grid-cols-3">
                        {[
                          ["Pin", "Map location locked in."],
                          ["Review", "Authorities confirm the issue."],
                          ["Repair", "Status updates stay visible."],
                        ].map(([title, body], index) => (
                          <Reveal
                            key={title}
                            delay={260 + index * 60}
                            className="rounded-[22px] border border-white/14 bg-white/10 p-4 backdrop-blur-md"
                          >
                            <p className="font-primary text-sm font-semibold text-white">{title}</p>
                            <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
                          </Reveal>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <Reveal as="div">
              <p className="section-kicker">How it works</p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">A quick path from report to repair.</h2>
            </Reveal>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((step, index) => (
              <Reveal key={step.title} delay={140 + index * 80}>
                <Card className="metric-card">
                  <CardContent className="p-6">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-sm font-semibold text-primary dark:bg-white/10 dark:text-white">
                      {index + 1}
                    </div>
                    <h3 className="font-primary text-lg font-semibold">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-14 md:py-16">
          <Reveal>
            <Card className="surface-panel overflow-hidden p-0">
              <div className="ambient-strip h-1.5 w-full" />
              <CardContent className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <p className="section-kicker">Ready to report</p>
                  <h2 className="mt-2 text-3xl font-semibold md:text-4xl">See a pothole? Send it in.</h2>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <Button asChild size="lg" className="px-7">
                    <Link href="/report">Start Reporting</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>
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
