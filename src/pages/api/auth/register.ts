import type { APIRoute } from "astro";

import { createSupabaseServerInstance } from "@/db/supabase.client";
import { registerSchema } from "@/lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const result = registerSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues.at(0)?.message ?? "Invalid registration data.";
    return Response.json({ error: message }, { status: 400 });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (error || !data.user) {
    return Response.json({ error: error?.message ?? "Unable to create account." }, { status: 400 });
  }

  return Response.json(
    {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    },
    { status: 201 }
  );
};
