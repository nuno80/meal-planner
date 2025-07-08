// src/middleware.ts v.1.3
// Middleware corretto che combina i18n e Clerk.
import { NextRequest, NextResponse } from "next/server";

import { getAuth } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "./i18n";

// 1. Definizione delle rotte (invariata, ma ora funzionerà correttamente)
// createRouteMatcher non è più necessario perché gestiamo la logica manualmente.
const publicRoutes = [
  "/",
  "/:locale(it|en)",
  "/:locale(it|en)/sign-in(.*)",
  "/:locale(it|en)/sign-up(.*)",
  "/:locale(it|en)/about",
  "/:locale(it|en)/pricing",
  "/:locale(it|en)/devi-autenticarti",
  "/:locale(it|en)/no-access",
  "/api/webhooks(.*)",
  "/api/user/preferences",
];

const adminRoutes = [
  "/:locale(it|en)/admin(.*)",
  "/:locale(it|en)/dashboard(.*)",
  "/api/admin/(.*)",
];

// Funzione helper per matchare le rotte, sostituisce createRouteMatcher
const matches = (path: string, patterns: string[]) =>
  patterns.some((p) => new RegExp(`^${p.replace("*", ".*")}$`).test(path));

// 2. Creazione del middleware di internazionalizzazione (invariato)
const intlMiddleware = createIntlMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: "always",
});

// 3. Middleware combinato
export default async function middleware(req: NextRequest) {
  // Eseguiamo prima il middleware di next-intl.
  const i18nResponse = intlMiddleware(req);
  const pathname = req.nextUrl.pathname;

  // Se la rotta è pubblica, procediamo.
  if (matches(pathname, publicRoutes)) {
    return i18nResponse;
  }

  const auth = getAuth(req);
  const { userId, sessionClaims } = auth;

  // Se l'utente non è autenticato per una rotta protetta...
  if (!userId) {
    if (pathname.startsWith("/api")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // CORREZIONE: Estraiamo la lingua dall'URL, non dall'oggetto auth.
    const detectedLocale =
      locales.find((l) => pathname.startsWith(`/${l}`)) || defaultLocale;
    const signInUrl = new URL(`/${detectedLocale}/sign-in`, req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  // Se la rotta richiede privilegi di admin...
  if (matches(pathname, adminRoutes)) {
    const userIsAdmin = sessionClaims?.metadata?.role === "admin";

    if (userIsAdmin) {
      return i18nResponse; // L'utente è admin, procedi.
    } else {
      if (pathname.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Admin role required" }),
          { status: 403 }
        );
      }
      // CORREZIONE: Estraiamo la lingua dall'URL anche qui.
      const detectedLocale =
        locales.find((l) => pathname.startsWith(`/${l}`)) || defaultLocale;
      const noAccessUrl = new URL(`/${detectedLocale}/no-access`, req.url);
      return NextResponse.redirect(noAccessUrl);
    }
  }

  // Se l'utente è loggato e la rotta non è admin, ha il permesso.
  return i18nResponse;
}

// 4. Configurazione del matcher (invariata)
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
