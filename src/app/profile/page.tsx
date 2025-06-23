// src/app/profile/page.tsx v.1.0
// Pagina di setup del profilo utente (Onboarding).
import { currentUser } from "@clerk/nextjs/server";

// L'import del form darà errore finché non creiamo il prossimo file. È normale.
import { PreferencesForm } from "@/components/features/profile/PreferencesForm";
import Navbar from "@/components/navbar";

// La pagina è un Server Component asincrono
export default async function ProfilePage() {
  const user = await currentUser();
  const userName = user?.firstName || "utente";

  return (
    <div>
      <Navbar />
      <main className="container mx-auto flex max-w-3xl flex-col items-center justify-center py-12">
        {/* Intestazione della pagina */}
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Benvenuto, {userName}!
          </h1>
          <p className="text-text-secondary text-lg">
            Configuriamo insieme le tue preferenze.
            <br />
            Questo ci aiuterà a creare piani alimentari perfetti per te.
          </p>
        </div>

        {/* Contenitore per il form */}
        <div className="mt-10 w-full">
          {/* Questo componente Client conterrà la logica del form. */}
          <PreferencesForm />
        </div>
      </main>
    </div>
  );
}
