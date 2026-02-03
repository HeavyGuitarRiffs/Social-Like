"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Provider, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { FaGoogle, FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const supabase: SupabaseClient = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        router.replace("/dashboard/connect");
      } else {
        setCheckingSession(false);
      }
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          router.replace("/dashboard/connect");
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signInWithProvider = async (provider: Provider) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      toast.success("Magic link sent! Check your inbox.");
      setEmail("");
    } catch {
      toast.error("Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking session…
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md shadow-xl border border-white/10 bg-gradient-to-br from-[#0b0f14] to-[#111827] p-6 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold text-white">
            Welcome to Social Like
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={() => signInWithProvider("google")}
            disabled={loading}
            className="w-full bg-white text-black hover:bg-gray-200"
          >
            <FaGoogle className="mr-2" /> Continue with Google
          </Button>

          <Button
            onClick={() => signInWithProvider("github")}
            disabled={loading}
            className="w-full bg-[#24292e] text-white hover:bg-black"
          >
            <FaGithub className="mr-2" /> Continue with GitHub
          </Button>

          <div className="text-center text-sm text-muted-foreground">or</div>

          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/20 border-white/10 text-white placeholder:text-gray-400"
          />

          <Button
            onClick={sendMagicLink}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white"
          >
            {loading ? "Sending…" : "Send Magic Link"}
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}