import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  const { url } = await req.json();
  if (!url.includes("linktr.ee")) return new Response(JSON.stringify([]));

  // TODO: Add real fetch & parse logic
  return new Response(JSON.stringify([
    { platform: "twitter", handle: "@example" },
    { platform: "instagram", handle: "@example" }
  ]));
});
