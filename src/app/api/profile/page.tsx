// src/app/profile/page.tsx v.1.0
// Pagina di setup del profilo utente (Onboarding).
import { currentUser } from "@clerk/nextjs/server";

// Nota: Il componente PreferencesForm non esiste ancora, lo creeremo nel prossimo step.
// L'errore di importazione è temporaneo e atteso.
import { PreferencesForm } from "@/components/features/profile/PreferencesForm";

// 1. La pagina è un Server Component asincrono
export default async function ProfilePage() {
  // 2. Otteniamo i dati dell'utente dal server per un messaggio di benvenuto personalizzato
  const user = await currentUser();
  const userName = user?.firstName || "utente";

  return (
    <main className="container mx-auto flex max-w-3xl flex-col items-center justify-center py-12">
      {/* 3. Intestazione della pagina */}
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Benvenuto, {userName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Configuriamo insieme le tue preferenze.
          <br />
          Questo ci aiuterà a creare piani alimentari perfetti per te.
        </p>
      </div>

      {/* 4. Contenitore per il form */}
      <div className="mt-10 w-full">
        {/* 
          Questo componente conterrà tutta la logica interattiva del form.
          Lo creeremo come Client Component nel prossimo step.
          Per ora, VS Code segnalerà un errore qui perché il file non esiste ancora.
        */}
        <PreferencesForm />
      </div>
    </main>
  );
}
