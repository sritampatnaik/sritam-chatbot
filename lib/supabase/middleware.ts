import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes logic - only protect admin routes
  const isOnAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isOnAdminLogin = request.nextUrl.pathname.startsWith("/admin/login");
  const isLoggedIn = !!user;

  // Redirect logged in users away from admin login page
  if (isLoggedIn && isOnAdminLogin) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Protect admin routes (except login page)
  if (isOnAdminRoute && !isOnAdminLogin && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Allow all other routes (guests can access / without login)
  return supabaseResponse;
}

