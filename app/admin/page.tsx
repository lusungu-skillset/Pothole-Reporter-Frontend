"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { AlertCircle, Lock, ShieldCheck, Sparkles } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getApiUrl } from "@/lib/api"

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
      const response = await axios.post(getApiUrl("/auth/login"), { email, password })
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
    <div className="page-shell mt-15">

      <main className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
        {/* UI-only redesign: a darker operations story panel now balances the login card without altering auth logic. */}
        <section className=" screen-enter relative p-0">
          <div className="h-1.5 w-full" />
          <div className="grid gap-6 p-6 md:p-8">
            <div className="shadow-none">
              <div className="relative">
                <img
                  src="/key.jpg"
                  alt="Damaged road with a pothole requiring repair"
                  className="h-[220px] md:w-[280px] md:h-[280px] rounded-full"
                />
                
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Access level", "Restricted"],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[24px] border border-white/10 bg-white/7 p-4">
                  <p className="section-kicker text-white/70">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/78">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Card className="surface-panel screen-enter">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8">
              <h2 className="mt-5 text-3xl font-semibold">Sign in </h2>
          
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
                  disabled={loading}
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
                />
              </div>

              {error && (
                <div className="rounded-[22px] border border-destructive/25 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                    <p className="text-sm leading-6 text-destructive">{error}</p>
                  </div>
                </div>
              )}


              <Button type="submit" disabled={loading} className="w-full">
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
