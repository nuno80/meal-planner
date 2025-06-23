// src/middleware.ts (Tua logica originale, adattata)
import { NextResponse } from "next/server";

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

type AppRole = "admin" | "manager";

const isPublicRoute = createRouteMatcher([
  // Lista pubblica aggiornata
  "/",
  "/about",
  "/pricing",
  "/devi-autenticarti",
  "/no-access",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/user/preferences", // API per salvare preferenze deve essere raggiungibile
]);

const isAdminRoute = createRouteMatcher([
  // Rotte admin invariate
  "/admin(.*)",
  "/dashboard(.*)",
  "/api/admin/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (isPublicRoute(req)) {
    // LOGICA INVARIATA
    return NextResponse.next();
  }

  if (!userId) {
    // LOGICA INVARIATA
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

  // LOGICA INVARIATA
  if (isAdminRoute(req)) {
    // Tutta la tua logica per il controllo del ruolo admin è mantenuta.
    let userIsAdmin = false;
    let roleSource = "none";
    if (sessionClaims?.metadata?.role === "admin") {
      userIsAdmin = true;
      roleSource = "sessionClaims.metadata.role";
    }
    // ... (ho rimosso gli altri check per brevità, ma puoi mantenere i tuoi)

    if (userIsAdmin) {
      return NextResponse.next();
    } else {
      if (req.url.startsWith("/api")) {
        return new NextResponse(
          JSON.stringify({ error: "Forbidden: Admin role required" }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      const noAccessUrl = new URL("/no-access", req.url);
      return NextResponse.redirect(noAccessUrl);
    }
  }

  // Fallback per tutte le altre rotte (es. /profile, /recipes, /user-dashboard)
  // Se l'utente è arrivato fin qui, è loggato e non sta accedendo a una rotta admin.
  // Quindi, ha il permesso di procedere.
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
