import type { APIRoute } from "astro";

import { createSupabaseServerInstance } from "@/db/supabase.client";
import { forgotPasswordSchema } from "@/lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, url }) => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const result = forgotPasswordSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues.at(0)?.message ?? "Invalid email address.";
    return Response.json({ error: message }, { status: 400 });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const redirectTo = new URL("/password-reset", url.origin).toString();
  await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo,
  });

  return Response.json(
    {
      message: "If an account exists for that email, a reset link has been sent.",
    },
    { status: 200 }
  );
};
