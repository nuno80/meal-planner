// src/app/[locale]/layout.tsx v.1.2
// Layout principale che unisce la configurazione esistente con l'internazionalizzazione.

// 1. Import necessari (esistenti e nuovi)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { it } from "@clerk/localizations"; // Per tradurre l'UI di Clerk
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";

// 2. Configurazione Font (invariata)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 3. Metadati (invariati)
export const metadata: Metadata = {
  title: "my-new-app",
  description: "my-new-app to solve problems",
};

// 4. Definizione delle Props del Layout (aggiornata)
// Il layout ora riceve 'params' con la 'locale'.
interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

// 5. Componente Layout Principale (aggiornato)
export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  // Carica i messaggi di traduzione per la lingua corrente.
  const messages = await getMessages();

  return (
    // ClerkProvider ora riceve la localizzazione dinamica.
    <ClerkProvider localization={locale === 'it' ? it : undefined}>
      {/* Il tag 'lang' ora è dinamico e viene dalla 'locale' dell'URL. */}
      <html lang={locale} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* NextIntlClientProvider wrappa ThemeProvider per fornire le traduzioni. */}
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}