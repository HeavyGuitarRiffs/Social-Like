import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/supabase/types";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const url = req.nextUrl.pathname;

  // Allow API routes
  if (url.startsWith("/api")) {
    return res;
  }

  // Public routes
  const publicRoutes = ["/", "/login", "/pricing", "/about"];
  if (publicRoutes.includes(url)) {
    return res;
  }

  // DEV BYPASS
  if (process.env.NODE_ENV === "development") {
    return res;
  }

  // Auth check
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Fetch user plan
  const { data: userPlan } = await supabase
    .from("user_plans")
    .select("plan_id")
    .eq("user_id", session.user.id)
    .single();

  const plan = userPlan?.plan_id || "free";

  // Paid-only routes
  const paidRoutes = ["/dashboard/analytics", "/dashboard/insights"];

  if (paidRoutes.some(route => url === route) && plan === "free") {
    return NextResponse.redirect(new URL("/upgrade", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};