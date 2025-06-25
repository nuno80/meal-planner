// src/app/meal-plan/create/page.tsx v.1.0
// Nuova pagina per la creazione di un piano, che include il form delle preferenze.
import { PreferencesForm } from "@/components/features/profile/PreferencesForm";
// Riutilizziamo il form
import Navbar from "@/components/navbar";

export default function CreateMealPlanPage() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto flex max-w-3xl flex-col items-center justify-center py-12">
        {/* Intestazione della pagina */}
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Crea un Nuovo Piano Alimentare
          </h1>
          <p className="text-text-secondary text-lg">
            Personalizza le tue preferenze qui sotto e genera un piano su misura
            per te.
            <br />
            Le tue ultime scelte verranno salvate per la prossima volta.
          </p>
        </div>

        {/* Contenitore per il form delle preferenze */}
        <div className="mt-10 w-full">
          <PreferencesForm />
        </div>
      </main>
    </div>
  );
}
