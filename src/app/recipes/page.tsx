// src/app/recipes/page.tsx v.1.1
// Pagina galleria che visualizza le ricette, con Navbar inclusa.
import { RecipeCard } from "@/components/features/recipes/RecipeCard";
import Navbar from "@/components/navbar";
// 1. Aggiunta importazione Navbar
import { db } from "@/lib/db";

// 2. Definiamo il tipo di dato che ci aspettiamo dal DB (INVARIATO)
type Recipe = {
  id: number;
  title: string;
  image_url: string | null;
  difficulty: string;
  calories: number;
};

// 3. Funzione per recuperare i dati dal database (INVARIATO)
function getRecipesFromDb(): Recipe[] {
  try {
    const stmt = db.prepare(
      "SELECT id, title, image_url, difficulty, calories FROM recipes ORDER BY title ASC"
    );
    const recipes = stmt.all() as Recipe[];
    return recipes;
  } catch (error) {
    console.error("Errore durante il recupero delle ricette dal DB:", error);
    return [];
  }
}

// 4. Componente pagina aggiornato con la struttura richiesta
export default async function RecipesPage() {
  const recipes = getRecipesFromDb();

  return (
    // 4.1 Wrapper div principale, come da tuo esempio
    <div>
      <Navbar />

      {/* 4.2 Contenuto specifico della pagina (logica invariata) */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-text-primary text-4xl font-bold tracking-tight">
            Esplora le Nostre Ricette
          </h1>
          <p className="text-text-secondary mt-4 text-lg">
            Trova l'ispirazione per il tuo prossimo pasto.
          </p>
        </div>

        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                imageUrl={recipe.image_url}
                difficulty={recipe.difficulty}
                calories={recipe.calories}
              />
            ))}
          </div>
        ) : (
          <div className="text-text-secondary text-center">
            <p>Nessuna ricetta trovata nel database.</p>
            <p>Assicurati di aver eseguito lo script `pnpm run db:seed`.</p>
          </div>
        )}
      </main>
    </div>
  );
}
