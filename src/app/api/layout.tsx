// src/app/layout.tsx v.2.0 (Without i18n routing)
// Layout principale che integra next-intl senza routing i18n.
// 1. Import necessari
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { itIT } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getLocale } from "next-intl/server";

import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

// 2. Configurazione Font (invariata)
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 3. Metadati (invariati)
export const metadata: Metadata = {
  title: "my-new-app",
  description: "my-new-app to solve problems",
};

// 4. Componente Layout Principale
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ottiene la lingua definita in i18n/request.ts
  const locale = await getLocale();
  const messages = useMessages();

  return (
    // Usa la localizzazione di Clerk se la lingua è 'it'
    <ClerkProvider localization={locale === "it" ? itIT : undefined}>
      <html lang={locale} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              <main className="pt-16">{children}</main>
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
