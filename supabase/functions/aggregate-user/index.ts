// supabase/functions/aggregate-user/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {Parameter 'req' implicitly has an 'any' type.ts(7006)
(parameter) req: any
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
      });
    }

    // Call your Next.js aggregation API
    await fetch(`${Deno.env.get("NEXT_PUBLIC_APP_URL")}/api/socials/aggregate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id }),
    });

    return new Response(JSON.stringify({ status: "aggregated" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});