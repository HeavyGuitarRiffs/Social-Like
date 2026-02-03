// app/providers/AuthListener.tsx   (or wherever you place it – often in layout or root client wrapper)
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; // ← Use the renamed export

export default function AuthListener() {
  useEffect(() => {
    const supabase = createClient();

    // Subscribe to auth changes – this also helps keep tokens refreshed
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Optional: add logging for debugging (remove in production)
      console.log("Auth event occurred:", event, session?.user?.email || "no user");

      // Examples of useful side-effects (uncomment/add as needed):
      //
      // if (event === "SIGNED_OUT") {
      //   // e.g. router.push("/login") or clear local state
      // }
      //
      // if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      //   // e.g. track analytics, refresh data, etc.
      // }
    });

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty deps = run once on mount

  return null; // This component renders nothing
}