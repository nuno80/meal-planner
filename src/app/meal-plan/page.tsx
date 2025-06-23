// src/app/meal-plan/page.tsx v.1.0
// Pagina principale per la visualizzazione e generazione del piano alimentare.
import { MealPlanInterface } from "@/components/features/meal-plan/MealPlanInterface";
import Navbar from "@/components/navbar";

export default function MealPlanPage() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        {/* Intestazione della pagina */}
        <div className="mb-10 text-center">
          <h1 className="text-text-primary text-4xl font-bold tracking-tight">
            Il Tuo Piano Alimentare
          </h1>
          <p className="text-text-secondary mt-4 text-lg">
            Genera un nuovo piano settimanale basato sulle tue preferenze o
            visualizza l'ultimo generato.
          </p>
        </div>

        {/* 
          Inseriamo qui il componente Client che conterrà tutta la logica interattiva.
          L'errore di importazione è temporaneo e atteso.
        */}
        <MealPlanInterface />
      </main>
    </div>
  );
}
