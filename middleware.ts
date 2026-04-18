import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const ADMIN_LOCAL_HOSTS = new Set(["admin.localhost", "admin.localhost:3000"])
const EXCLUDED_PREFIXES = ["/_next", "/favicon.ico", "/leaflet", "/Logo.jpg", "/key.jpg", "/k.jpg"]

function isAdminLocalhost(host: string | null) {
  if (!host) return false

  const normalizedHost = host.toLowerCase()
  return ADMIN_LOCAL_HOSTS.has(normalizedHost)
}

function isExcludedPath(pathname: string) {
  return EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")
  const { pathname } = request.nextUrl

  if (!isAdminLocalhost(host) || isExcludedPath(pathname)) {
    return NextResponse.next()
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/admin"
    return NextResponse.rewrite(url)
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = `/admin${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
}
