// Minimal safe webhook for one‑time payments.
// Does NOT verify signatures.
// Does NOT process events.
// Prevents 500 errors.

import { serve } from "https://deno.land/std/http/server.ts";

serve(() => {
  return new Response("OK", { status: 200 });
});