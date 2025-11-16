import type { APIRoute } from "astro";

import { createSupabaseServerInstance } from "@/db/supabase.client";
import { loginSchema } from "@/lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const result = loginSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues.at(0)?.message ?? "Invalid credentials.";
    return Response.json({ error: message }, { status: 400 });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error || !data.user) {
    return Response.json({ error: error?.message ?? "Invalid email or password." }, { status: 401 });
  }

  return Response.json(
    {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    },
    { status: 200 }
  );
};
