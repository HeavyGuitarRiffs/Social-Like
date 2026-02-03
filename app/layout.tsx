// app/layout.tsx
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/components/providers/UserProvider";

import TopNav from "@/components/TopNav";
import { Footer } from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Social Like",
  description: "Track social growth. Convert attention into income.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <UserProvider>
            <TooltipProvider>
              <TopNav />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster richColors closeButton />
            </TooltipProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
