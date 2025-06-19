// src/middleware.ts v.1.2 (Senza accesso al DB)
import { NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// type AppRole = "admin" | "manager"; // Puoi decommentare se ti serve

// 1. Definizione delle rotte (inclusa la nuova per il profilo)
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/pricing",
  "/devi-autenticarti",
  "/no-access",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/user/preferences(.*)", // Rendiamo l'API delle preferenze accessibile per il salvataggio
]);

const isOnboardingRoute = createRouteMatcher(["/profile(.*)"]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard(.*)",
  "/api/admin/(.*)",
]);

const isAuthenticatedRoute = createRouteMatcher(["/features(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Se la rotta è pubblica, non fare nulla
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Se l'utente non è autenticato, gestisci il redirect
  if (!userId) {
    if (req.url.startsWith("/api")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set(
      "redirect_url",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(signInUrl);
  }

  // --- NUOVA LOGICA: CONTROLLO ONBOARDING TRAMITE CLERK ---
  // Leggiamo un flag dai metadati pubblici dell'utente su Clerk.
  const hasCompletedOnboarding =
    sessionClaims?.publicMetadata?.onboardingComplete === true;

  // Se l'utente non ha completato l'onboarding E non è già sulla pagina del profilo,
  // lo reindirizziamo lì.
  if (!hasCompletedOnboarding && !isOnboardingRoute(req)) {
    const profileUrl = new URL("/profile", req.url);
    console.log(
      `[DECISION] Utente ${userId} non ha completato l'onboarding (flag Clerk). Redirect a ${profileUrl.toString()}`
    );
    return NextResponse.redirect(profileUrl);
  }

  // Se l'utente ha completato l'onboarding MA cerca di tornare alla pagina del profilo,
  // lo reindirizziamo alla sua dashboard per evitare confusione.
  if (hasCompletedOnboarding && isOnboardingRoute(req)) {
    const mealPlanUrl = new URL("/meal-plan", req.url); // O la pagina principale post-login
    console.log(
      `[DECISION] Utente ${userId} ha già completato l'onboarding. Redirect a ${mealPlanUrl.toString()}`
    );
    return NextResponse.redirect(mealPlanUrl);
  }
  // --- FINE NUOVA LOGICA ---

  // Controllo per le rotte Admin (LOGICA INVARIATA)
  if (isAdminRoute(req)) {
    const userIsAdmin = sessionClaims?.metadata?.role === "admin";
    if (userIsAdmin) {
      return NextResponse.next();
    } else {
      if (req.url.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Admin role required" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      const noAccessUrl = new URL("/no-access", req.url);
      return NextResponse.redirect(noAccessUrl);
    }
  }

  // Controllo per le rotte utente autenticato (LOGICA INVARIATA)
  if (isAuthenticatedRoute(req)) {
    return NextResponse.next();
  }

  // Fallback per tutte le altre rotte protette.
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
