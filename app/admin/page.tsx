"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { AlertCircle, Lock, ShieldCheck } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setIsAdmin, setAdminEmail } = useAppContext()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("http://localhost:3005/auth/login", { email, password })
      const { token, admin } = response.data

      if (!token || !admin) {
        setError("Invalid response from server - missing token or admin data")
        return
      }

      localStorage.setItem("authToken", token)
      localStorage.setItem("adminEmail", admin.email || email)

      setIsAdmin(true)
      setAdminEmail(admin.email || email)

      router.push("/admin/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || err.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="container mx-auto grid flex-1 items-start gap-8 px-4 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <section className="surface-panel hero-shine p-6 md:p-8">
          <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">
            RoadSafe Operations Login
          </h1>

          <p className="mt-4 max-w-xl text-muted-foreground">
            Authorized personnel can sign in to review pothole reports, update repair statuses,
            and monitor road maintenance activities.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">Commitment</p>
              <p className="mt-1 font-semibold">Safety First</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">Access Level</p>
              <p className="mt-1 font-semibold">Authorized Personnel Only</p>
            </div>
          </div>
        </section>

        <Card className="surface-panel">
          <CardContent className="p-6 md:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold">Admin Login</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your administrator credentials to access the operations dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@roadsafe.mw"
                  disabled={loading}
                  className="h-11 rounded-xl border-border/80 bg-background/70"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loading}
                  className="h-11 rounded-xl border-border/80 bg-background/70"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t border-border/70 bg-card/70 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-semibold">Copyright {new Date().getFullYear()} RoadSafe</p>
          <p className="mt-2">Secure access for managing community road safety reports.</p>
        </div>
      </footer>
    </div>
  )
}