// src/app/layout.tsx v.1.1
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

// <-- 1. NUOVO IMPORT

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "my-new-app",
  description: "my-new-app to solve problems",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster /> {/* <-- 2. TOASTER AGGIUNTO QUI */}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
