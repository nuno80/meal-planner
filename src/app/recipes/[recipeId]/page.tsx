// src/app/recipes/[recipeId]/page.tsx v.1.0
// Pagina di dettaglio per una singola ricetta.
import Image from "next/image";
import { notFound } from "next/navigation";

import { ChefHat, Clock, Wallet } from "lucide-react";

import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";

// 1. Definiamo un tipo più completo per i dettagli della ricetta
type FullRecipe = {
  id: number;
  title: string;
  description: string | null;
  difficulty: string;
  cost: string | null;
  total_time_minutes: number | null;
  calories: number;
  instructions: string | null;
  image_url: string | null;
  ingredients_json: string | null;
};

// 2. Funzione per recuperare una singola ricetta dal DB tramite il suo ID
function getRecipeById(id: number): FullRecipe | null {
  try {
    const stmt = db.prepare("SELECT * FROM recipes WHERE id = ?");
    const recipe = stmt.get(id) as FullRecipe | undefined;
    return recipe || null;
  } catch (error) {
    console.error(
      `Errore durante il recupero della ricetta con ID ${id}:`,
      error
    );
    return null;
  }
}

// 3. Il componente pagina è un Server Component asincrono che riceve 'params'
export default async function RecipeDetailPage({
  params,
}: {
  params: { recipeId: string };
}) {
  const recipeId = parseInt(params.recipeId, 10);

  // Controlliamo che l'ID sia un numero valido
  if (isNaN(recipeId)) {
    notFound(); // Se l'URL non contiene un ID numerico, mostra 404
  }

  const recipe = getRecipeById(recipeId);

  // 4. Se la ricetta non viene trovata nel DB, mostriamo la pagina 404
  if (!recipe) {
    notFound();
  }

  // 5. Parsing sicuro degli ingredienti JSON
  let ingredients: Record<string, string | number> = {};
  try {
    if (recipe.ingredients_json) {
      ingredients = JSON.parse(recipe.ingredients_json);
    }
  } catch (e) {
    console.error(`Errore nel parsing JSON per la ricetta ${recipe.id}:`, e);
  }

  return (
    <div>
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12">
        <article>
          {/* 6. Intestazione con Titolo e Descrizione */}
          <header className="border-border-default mb-8 border-b pb-8">
            <h1 className="text-text-primary text-4xl font-bold tracking-tight md:text-5xl">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="text-text-secondary mt-4 text-lg">
                {recipe.description}
              </p>
            )}
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* 7. Colonna Sinistra: Immagine e Metadati */}
            <aside className="md:col-span-1">
              <div className="relative mb-6 aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={recipe.image_url || "/images/placeholder-recipe.jpg"}
                  alt={`Immagine di ${recipe.title}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="text-text-secondary flex items-center gap-3">
                  <ChefHat className="text-brand-accent h-5 w-5" />
                  <span className="text-text-primary font-semibold">
                    Difficoltà:
                  </span>
                  <Badge variant="secondary">{recipe.difficulty}</Badge>
                </div>
                {recipe.total_time_minutes && (
                  <div className="text-text-secondary flex items-center gap-3">
                    <Clock className="text-brand-accent h-5 w-5" />
                    <span className="text-text-primary font-semibold">
                      Tempo:
                    </span>
                    <span>{recipe.total_time_minutes} min</span>
                  </div>
                )}
                {recipe.cost && (
                  <div className="text-text-secondary flex items-center gap-3">
                    <Wallet className="text-brand-accent h-5 w-5" />
                    <span className="text-text-primary font-semibold">
                      Costo:
                    </span>
                    <span>{recipe.cost}</span>
                  </div>
                )}
              </div>
            </aside>

            {/* 8. Colonna Destra: Ingredienti e Istruzioni */}
            <div className="md:col-span-2">
              <section className="mb-8">
                <h2 className="text-text-primary border-border-default mb-4 border-b pb-2 text-2xl font-semibold">
                  Ingredienti
                </h2>
                <ul className="text-text-secondary list-disc space-y-2 pl-5">
                  {Object.entries(ingredients).map(([name, quantity]) => (
                    <li key={name}>
                      <span className="capitalize">{name}</span>: {quantity}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-text-primary border-border-default mb-4 border-b pb-2 text-2xl font-semibold">
                  Istruzioni
                </h2>
                {/* La classe 'whitespace-pre-line' rispetta gli "a capo" nel testo */}
                <div className="prose prose-invert text-text-secondary max-w-none whitespace-pre-line">
                  {recipe.instructions}
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
