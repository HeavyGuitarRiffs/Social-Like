import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async () => {
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SERVICE_ROLE_KEY")!;

    // 1. Fetch all users
    const usersRes = await fetch(`${url}/rest/v1/users?select=id`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });

    const users = await usersRes.json();

    // 2. Run aggregation for each user in parallel
    await Promise.all(
      users.map((user: { id: string }) =>
        fetch(`${url}/functions/v1/aggregate-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ user_id: user.id }),
        })
      )
    );

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