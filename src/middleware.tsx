// src/middleware.ts v.1.7 (Prioritize root redirect)
// Dà priorità al redirect della lingua per la rotta di root.
import { NextRequest, NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "./i18n";

// 1. Definizione delle rotte (rimuoviamo '/' dalla lista pubblica)
const isPublicRoute = createRouteMatcher([
  // '/' è rimosso da qui per essere gestito separatamente
  "/:locale(it|en)",
  "/:locale(it|en)/sign-in(.*)",
  "/:locale(it|en)/sign-up(.*)",
  "/:locale(it|en)/about",
  "/:locale(it|en)/pricing",
  "/:locale(it|en)/devi-autenticarti",
  "/:locale(it|en)/no-access",
  "/api/webhooks(.*)",
  "/api/user/preferences",
]);

const isAdminRoute = createRouteMatcher([
  "/:locale(it|en)/admin(.*)",
  "/:locale(it|en)/dashboard(.*)",
  "/api/admin/(.*)",
]);

// 2. Creazione del middleware di next-intl (invariata)
const intlMiddleware = createIntlMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: "always",
});

// 3. Esportazione del middleware di Clerk
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  // CORREZIONE: Se la richiesta è per la root, lascia che intlMiddleware faccia il redirect.
  if (pathname === "/") {
    return intlMiddleware(req);
  }

  const intlResponse = intlMiddleware(req);

  if (isPublicRoute(req)) {
    return intlResponse;
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (isAdminRoute(req)) {
    const userIsAdmin = sessionClaims?.metadata?.role === "admin";
    if (!userIsAdmin) {
      const detectedLocale =
        locales.find((l) => pathname.startsWith(`/${l}`)) || defaultLocale;
      const noAccessUrl = new URL(`/${detectedLocale}/no-access`, req.url);
      return NextResponse.redirect(noAccessUrl);
    }
  }

  return intlResponse;
});

// 4. Configurazione del matcher (invariata)
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
