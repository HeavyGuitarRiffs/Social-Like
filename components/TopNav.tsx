// components/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Hide TopNav ONLY on homepage
  if (pathname === "/") return null;

  return (
    <header className="w-full bg-base-200 shadow-md flex justify-between items-center px-6 py-3 sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold">
        Social Like
      </Link>

      <div className="flex gap-4 items-center">
        <nav className="flex gap-4 text-lg opacity-80">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/dashboard/connect">Connect</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>

        {/* Light/Dark toggle */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="gap-1"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === "light" ? "Dark" : "Light"}
        </Button>
      </div>
    </header>
  );
}
