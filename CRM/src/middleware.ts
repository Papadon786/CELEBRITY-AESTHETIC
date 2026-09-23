import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  ""

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && pathname === "/login") {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url))
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie)
    return redirect
  }

  if (!user && pathname !== "/login") {
    const redirect = NextResponse.redirect(new URL("/login", request.url))
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie)
    return redirect
  }

  return response
}

export const config = {
  // Excludes API routes, Next.js internals, and any request for a static
  // file (logo.jpg, fonts, etc. — anything under public/ with a file
  // extension) from the auth check. Without the extension exclusion, a
  // plain <img src="/logo.jpg"> request got redirected to /login like any
  // other unauthenticated page request, breaking every image on the site.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\..*$).*)"],
}
