// src/app/no-access/page.tsx
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";

import Navbar from "@/components/navbar";

// Rendi la funzione componente async
export default async function NoAccessPage() {
  // Usa await per risolvere la Promise restituita da auth()
  const authData = await auth();
  const userId = authData?.userId; // Accedi a userId dopo await
  // const orgRole = authData?.orgRole; // Puoi accedere anche a orgRole se necessario

  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <h1>Accesso Negato</h1>
      <p>
        Non disponi delle autorizzazioni necessarie per visualizzare la risorsa
        richiesta.
      </p>
      {userId && ( // Mostra l'ID solo se l'utente è effettivamente loggato
        <p>
          Sei autenticato come utente con ID: {userId}. Contatta un
          amministratore se credi sia un errore.
        </p>
      )}
      <Link href="/">Torna alla Homepage</Link>
    </div>
  );
}
