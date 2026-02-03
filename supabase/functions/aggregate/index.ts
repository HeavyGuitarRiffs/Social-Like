// supabase/functions/aggregate/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async () => {
  try {
    // 1. Fetch all users from Supabase
    const usersRes = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/users`,
      {
        headers: {
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
          Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")
}`,
        },
      }
    );

    const users = await usersRes.json();

    // 2. Call your aggregation API for each user
    for (const user of users) {
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/aggregate-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});