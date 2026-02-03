"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-base-100 border-b">
      {/* Logo */}
      <Link href="/" className="font-bold text-xl">
        Social Like
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex gap-6 font-medium">
        <Link
          href="/"
          className="px-3 py-2 rounded-md hover:bg-green-100 hover:text-green-600 transition"
        >
          Home
        </Link>
        <Link
          href="/about"
          className="px-3 py-2 rounded-md hover:bg-green-100 hover:text-green-600 transition"
        >
          About
        </Link>
        <Link
          href="/pricing"
          className="px-3 py-2 rounded-md hover:bg-green-100 hover:text-green-600 transition"
        >
          Pricing
        </Link>
        <Link
          href="/dashboard"
          className="px-3 py-2 rounded-md hover:bg-green-100 hover:text-green-600 transition"
        >
          Dashboard
        </Link>
      </div>

      {/* Mobile hamburger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden text-2xl"
            aria-label="Open menu"
          >
            ☰
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/">Home</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/about">About</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/pricing">Pricing</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
