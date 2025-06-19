// src/types/globals.d.ts v.1.0
// Definizioni di tipo globali per l'applicazione, incluse le estensioni per Clerk.

// 1. Definiamo i ruoli dell'applicazione in un unico posto.
export type AppRole = "admin" | "manager";

// 2. Estendiamo i tipi di Clerk per includere i nostri metadati personalizzati.
// Questo permette a TypeScript di conoscere la struttura di publicMetadata e metadata.
declare global {
  interface CustomJwtSessionClaims {
    // Aggiungiamo i nostri campi personalizzati ai metadati pubblici
    publicMetadata: {
      onboardingComplete?: boolean; // Il nostro nuovo flag
    };
    // Definiamo la struttura dei metadati privati (per i ruoli)
    metadata: {
      role?: AppRole;
    };
  }
}

// È necessario un export vuoto per trasformare il file in un modulo e rendere 'declare global' efficace.
export {};
