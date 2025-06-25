// src/app/recipes/page.tsx v.1.3
// Pagina galleria aggiornata per passare il ruolo admin alle card.
import { auth } from "@clerk/nextjs/server";

import { RecipeCard } from "@/components/features/recipes/RecipeCard";
import Navbar from "@/components/navbar";
import { db } from "@/lib/db";

type Recipe = {
  id: number;
  title: string;
  image_url: string | null;
  difficulty: string;
  calories: number;
};
type FavoriteRecipe = { recipe_id: number };

function getRecipesFromDb(): Recipe[] {
  try {
    const stmt = db.prepare(
      "SELECT id, title, image_url, difficulty, calories FROM recipes ORDER BY title ASC"
    );
    return stmt.all() as Recipe[];
  } catch (error) {
    console.error("Errore durante il recupero delle ricette:", error);
    return [];
  }
}

function getFavoriteRecipes(userId: string): Set<number> {
  try {
    const stmt = db.prepare(
      "SELECT recipe_id FROM user_favorite_recipes WHERE user_id = ?"
    );
    const favorites = stmt.all(userId) as FavoriteRecipe[];
    return new Set(favorites.map((fav) => fav.recipe_id));
  } catch (error) {
    console.error("Errore durante il recupero dei preferiti:", error);
    return new Set();
  }
}

export default async function RecipesPage() {
  // 1. MODIFICA: Recuperiamo anche sessionClaims per il ruolo
  const { userId, sessionClaims } = await auth();
  const recipes = getRecipesFromDb();
  const favoriteRecipeIds = userId
    ? getFavoriteRecipes(userId)
    : new Set<number>();

  // 2. Determiniamo se l'utente è un admin
  const isAdmin = sessionClaims?.metadata?.role === "admin";

  return (
    <div>
      <Navbar />
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
              // 3. Passiamo la nuova prop 'isAdmin' alla card
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                title={recipe.title}
                imageUrl={recipe.image_url}
                difficulty={recipe.difficulty}
                calories={recipe.calories}
                isInitiallyFavorite={favoriteRecipeIds.has(recipe.id)}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <div className="text-text-secondary text-center">
            <p>Nessuna ricetta trovata nel database.</p>
          </div>
        )}
      </main>
    </div>
  );
}
