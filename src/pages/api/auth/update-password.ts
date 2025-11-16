import type { APIRoute } from "astro";

import { createSupabaseServerInstance } from "@/db/supabase.client";
import { passwordResetSchema } from "@/lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const result = passwordResetSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues.at(0)?.message ?? "Invalid password.";
    return Response.json({ error: message }, { status: 400 });
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
  const { error } = await supabase.auth.updateUser({ password: result.data.password });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ message: "Password updated successfully." }, { status: 200 });
};
