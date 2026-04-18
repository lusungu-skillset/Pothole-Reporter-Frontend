"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Moon, Sun, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navigation() {
  const pathname = usePathname()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const links = [
    { href: "/", label: "Home" },
    { href: "/report", label: "Report" },
    { href: "/map", label: "Map" },
  ]

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  if (!mounted) {
    return null
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-4">
      <div className="container mx-auto">
        {/* UI-only redesign: pill navigation shell with glass layering. */}
        <div className="glass-subtle flex items-center justify-between gap-3 rounded-[28px] px-3 py-3 shadow-[0_24px_64px_-38px_rgba(92,111,189,0.42)]">
          <Link
            href="/"
            className="font-primary flex min-w-0 items-center gap-3 rounded-[22px] px-2 py-1 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-white/70 bg-white/80 shadow-[0_18px_40px_-30px_rgba(92,111,189,0.38)] backdrop-blur-md dark:border-white/12 dark:bg-white/8">
              <img src="/Logo.jpg" alt="RoadSafe logo" className="h-10 w-10 rounded-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="section-kicker text-[0.65rem] text-primary/80 dark:text-white/70">RoadSafe</p>
              <p className="truncate text-base font-semibold text-foreground">Pothole Reporter</p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-1 rounded-full border border-border/70 bg-white/72 p-1.5 shadow-[0_18px_44px_-34px_rgba(92,111,189,0.34)] backdrop-blur-md dark:border-white/10 dark:bg-white/7">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-primary rounded-full px-4 py-2.5 text-sm tracking-[0.01em] transition-all ${
                    isActive(link.href)
                      ? "bg-gradient-to-r from-primary via-blue-500 to-cyan-400 text-primary-foreground shadow-[0_18px_40px_-26px_rgba(78,96,216,0.75)]"
                      : "text-muted-foreground hover:bg-white/80 hover:text-foreground dark:hover:bg-white/8 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="rounded-2xl"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="surface-panel mt-3 p-3 md:hidden">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-primary block rounded-2xl px-4 py-3 text-sm tracking-[0.01em] transition-all ${
                    isActive(link.href)
                      ? "bg-gradient-to-r from-primary via-blue-500 to-cyan-400 text-primary-foreground shadow-[0_18px_40px_-26px_rgba(78,96,216,0.75)]"
                      : "text-muted-foreground hover:bg-white/72 hover:text-foreground dark:hover:bg-white/8 dark:hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="soft-divider my-3" />
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start rounded-2xl">
              {theme === "light" ? (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
