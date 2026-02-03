"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PropsWithChildren } from "react";

export default function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const navItems = [
    { href: "/dashboard/goals", label: "Goals" },
    { href: "/dashboard/store", label: "Store" },
    { href: "/dashboard/leaderboard", label: "Leaderboard" },
    { href: "/dashboard/achievements", label: "Achievements" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex justify-evenly items-center px-8 py-4 bg-base-200 shadow-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`font-medium transition-colors ${
                isActive ? "text-green-600" : "hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="font-medium text-destructive hover:opacity-80 transition"
        >
          Logout
        </button>
      </nav>

      <main className="flex-1 p-8 bg-base-100">{children}</main>
    </div>
  );
}
