// src/middleware.ts v.4.1 (Clerk only, Manual Protect)
// Middleware di Clerk di base con controllo manuale dell'autenticazione.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Definisci le rotte pubbliche
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about",
  "/pricing",
  "/api/webhooks(.*)",
]);

// 2. Esporta il middleware di Clerk
// CORREZIONE: Aggiunto async/await
export default clerkMiddleware(async (auth, req) => {
  // Se la rotta è pubblica, non fare nulla.
  if (isPublicRoute(req)) {
    return;
  }

  // Per le rotte protette, controlla l'ID utente.
  const { userId, redirectToSignIn } = await auth();

  // Se l'utente non è loggato, reindirizzalo.
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }
});

// 3. Configurazione del matcher
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
