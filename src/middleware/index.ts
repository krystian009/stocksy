import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "@/db/supabase.client";

const PUBLIC_AUTH_PAGES = new Set(["/login", "/register", "/forgot-password", "/password-reset"]);
const STATIC_PATH_PREFIXES = ["/_astro", "/_image", "/assets", "/public", "/@fs", "/node_modules"];
const STATIC_PATHS = new Set(["/favicon.png", "/favicon.ico", "/robots.txt"]);
const AUTH_API_PREFIX = "/api/auth";

const isStaticAssetRequest = (pathname: string) =>
  STATIC_PATHS.has(pathname) || STATIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const isPublicRoute = (pathname: string) => PUBLIC_AUTH_PAGES.has(pathname) || pathname.startsWith(AUTH_API_PREFIX);

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, request, url, locals, redirect } = context;
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      id: user.id,
      email: user.email,
    };
  }

  const isApiRoute = url.pathname.startsWith("/api/");
  const allowAnonymous =
    isPublicRoute(url.pathname) || isStaticAssetRequest(url.pathname) || request.method === "OPTIONS";

  if (!locals.user && !allowAnonymous) {
    if (isApiRoute && !url.pathname.startsWith(AUTH_API_PREFIX)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return redirect("/login");
  }

  if (locals.user && PUBLIC_AUTH_PAGES.has(url.pathname)) {
    return redirect("/");
  }

  return next();
});
