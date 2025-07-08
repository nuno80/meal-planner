// src/app/layout.tsx v.1.1 (Correct Root Layout)
// Layout di root che contiene i tag HTML richiesti da Next.js.
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

// Configurazione dei font (identica al tuo layout principale)
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
    // Questo layout fornisce la struttura HTML di base.
    // I provider (Clerk, Theme, NextIntl) sono nel layout localizzato.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
