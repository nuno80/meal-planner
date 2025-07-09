// src/app/[locale]/shopping-list/page.tsx v.1.3
// Pagina Server-Side che integra i componenti client e le traduzioni.

// 1. Import necessari (aggiunto useTranslations)
import { Suspense } from "react";
import { useTranslations } from 'next-intl';
import { ShoppingListConfigurator } from "@/components/features/shopping-list/ShoppingListConfigurator";
import { ShoppingListDisplay } from "@/components/features/shopping-list/ShoppingListDisplay";
import {
  Recipe,
  ShoppingListItem,
  generateShoppingList,
} from "@/lib/shopping-list-generator"; // Corretto il nome del file

// 2. Definizione Tipi di Dati (invariata)
type Meal = { id: number; recipeId: number; recipeName: string; recipeServings: number; };
type DayPlan = { dayName: string; meals: Meal[]; };
type MealPlan = DayPlan[];

// 3. Funzioni Mock (invariate)
async function getUserLatestMealPlan(userId: string): Promise<MealPlan> {
  console.log(`Recupero piano per l'utente: ${userId}`);
  return [
    { dayName: "Lunedì", meals: [ { id: 1, recipeId: 101, recipeName: "Insalata di Pollo", recipeServings: 1 }, { id: 2, recipeId: 102, recipeName: "Salmone e Zucchine", recipeServings: 1 } ] },
    { dayName: "Martedì", meals: [ { id: 3, recipeId: 103, recipeName: "Riso e Lenticchie", recipeServings: 2 }, { id: 4, recipeId: 104, recipeName: "Frittata di Spinaci", recipeServings: 2 } ] },
  ];
}
async function getRecipesDetails(recipeIds: number[]): Promise<Recipe[]> {
  console.log(`Recupero dettagli per le ricette: ${recipeIds.join(", ")}`);
  const allRecipes: Record<number, Recipe> = {
    101: { id: 101, name: "Insalata di Pollo", servings: 1, ingredients: [ { name: "Petto di pollo", quantity: 150, unit: "g" }, { name: "Insalata", quantity: 50, unit: "g" } ] },
    102: { id: 102, name: "Salmone e Zucchine", servings: 1, ingredients: [ { name: "Filetto di salmone", quantity: 120, unit: "g" }, { name: "Zucchine", quantity: 1, unit: "pezzo" } ] },
    103: { id: 103, name: "Riso e Lenticchie", servings: 2, ingredients: [ { name: "Riso Basmati", quantity: 160, unit: "g" }, { name: "Lenticchie secche", quantity: 150, unit: "g" } ] },
    104: { id: 104, name: "Frittata di Spinaci", servings: 2, ingredients: [ { name: "Uova", quantity: 4, unit: "uova" }, { name: "Spinaci freschi", quantity: 150, unit: "g" } ] },
  };
  return recipeIds.map((id) => allRecipes[id]).filter((r): r is Recipe => !!r);
}

// 4. Componente Pagina Principale (Server Component)
interface ShoppingListPageProps {
  searchParams: { people?: string; recipes?: string; };
}

export default async function ShoppingListPage({ searchParams }: ShoppingListPageProps) {
  // Inizializza la funzione di traduzione per il namespace 'ShoppingListPage'
  const t = useTranslations('ShoppingListPage');

  const userId = "user_mock_id";
  const mealPlan = await getUserLatestMealPlan(userId);

  const allRecipeIdsInPlan = mealPlan.flatMap((day) => day.meals.map((meal) => meal.recipeId));
  const numberOfPeople = parseInt(searchParams.people || "2", 10);
  const selectedRecipeIds = searchParams.recipes ? searchParams.recipes.split(",").map((id) => parseInt(id, 10)) : allRecipeIdsInPlan;

  const recipesToProcess = await getRecipesDetails(selectedRecipeIds);

  let shoppingList: ShoppingListItem[] = [];
  if (recipesToProcess.length > 0) {
    shoppingList = generateShoppingList(recipesToProcess, numberOfPeople);
  }

  // 5. Rendering della Pagina con i Componenti Client e testo tradotto
  return (
    <div className="container mx-auto space-y-8 p-4">
      {/* Titolo tradotto */}
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      {/* Fallback di Suspense tradotti */}
      <Suspense fallback={<p>{t('loadingConfigurator')}</p>}>
        <ShoppingListConfigurator
          mealPlan={mealPlan}
          initialPeople={numberOfPeople}
          initialSelectedRecipeIds={selectedRecipeIds}
        />
      </Suspense>

      <Suspense fallback={<p>{t('loadingList')}</p>}>
        <ShoppingListDisplay items={shoppingList} />
      </Suspense>
    </div>
  );
}