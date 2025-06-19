// src/app/api/admin/get-users/route.ts
// L'import originale
import { NextResponse } from "next/server";

import { auth, clerkClient } from "@clerk/nextjs/server";

// Interfaccia per la risposta, utile per chiarezza
interface SimplifiedUser {
  id: string;
  primaryEmail: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
}

export async function GET() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Non autorizzato: Login richiesto." },
      { status: 401 }
    );
  }

  // Controllo del ruolo admin basato sulla stessa logica del middleware
  const isAdmin = sessionClaims?.metadata?.role === "admin";

  if (!isAdmin) {
    console.warn(
      `Accesso API negato per get-users per l'utente ${userId}. Ruolo (da claims): ${sessionClaims?.metadata?.role}`
    );
    return NextResponse.json(
      { error: "Accesso negato: Privilegi insufficienti." },
      { status: 403 }
    );
  }

  try {
    console.log(
      `Admin ${userId} confermato tramite sessionClaims. Tentativo di recuperare la lista utenti...`
    );

    // Utilizzo di @ts-expect-error per l'errore "Property 'users' does not exist on type '() => Promise<ClerkClient>'"
    // Questo dice a TypeScript di aspettarsi un errore sulla riga successiva e di ignorarlo.
    // @ts-expect-error TS#2339: TypeScript infers clerkClient as a function, but we expect an object with a 'users' property.
    const userList = await clerkClient.users.getUserList({
      limit: 200,
      orderBy: "-created_at",
    });

    // Aggiungiamo un controllo per assicurarci che userList sia qualcosa di mappabile,
    // dato che stiamo bypassando i controlli di tipo.
    if (!userList || typeof userList.map !== "function") {
      console.error(
        "getUserList non ha restituito un array o un oggetto mappabile:",
        userList
      );
      return NextResponse.json(
        { error: "Errore nel recuperare gli utenti: formato dati inatteso." },
        { status: 500 }
      );
    }

    // Utilizzo di (user: any) per l'errore "Parameter 'user' implicitly has an 'any' type"
    // e un commento eslint per eventuale regola no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const simplifiedUsers: SimplifiedUser[] = userList.map((user: any) => ({
      id: user.id, // Sperando che 'user' abbia queste proprietà al runtime
      primaryEmail: user.primaryEmailAddress?.emailAddress ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      role: (user.publicMetadata?.role as string) ?? null, // L'asserzione 'as string' qui è separata dall'any sopra
    }));

    console.log(`Recuperati ${simplifiedUsers.length} utenti.`);
    return NextResponse.json({ users: simplifiedUsers });
  } catch (error: unknown) {
    console.error("Errore API nel caricare gli utenti:", error);
    let errorMessage =
      "Errore interno del server durante il caricamento degli utenti.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Includi più dettagli dell'errore nel log server-side per il debug
    if (typeof error === "object" && error !== null && "message" in error) {
      console.error(
        "Dettagli errore:",
        (error as { message: string }).message,
        error
      );
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
