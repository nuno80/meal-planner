// src/lib/meal-plan-generator.ts v.1.0
// Servizio contenente l'algoritmo per la generazione di piani alimentari personalizzati.
import { db } from "@/lib/db";

// 1. Definiamo i tipi di dato necessari per l'algoritmo

// Le preferenze dell'utente, come lette dal DB e passate alla funzione
export interface UserPreferencesForGenerator {
  calorieTarget: number;
  distribution: { breakfast: number; lunch: number; dinner: number };
  dietaryPreference: "NONE" | "VEGETARIAN" | "VEGAN" | "PESCATARIAN";
  difficultyLevel: "ANY" | "EASY" | "MEDIUM" | "HARD";
  // Nota: gli allergeni e gli ingredienti non graditi vengono gestiti a livello di query
}

// La struttura di una ricetta come usata dall'algoritmo
type RecipeForGenerator = {
  id: number;
  title: string;
  calories: number;
  meal_types: string; // JSON array as string, e.g., '["LUNCH", "DINNER"]'
};

// La struttura del piano generato
export type GeneratedMealPlan = {
  days: {
    dayOfWeek: number; // 1 = Lunedì, ..., 7 = Domenica
    meals: {
      mealType: "BREAKFAST" | "LUNCH" | "DINNER";
      recipe: { id: number; title: string; calories: number };
    }[];
    totalCalories: number;
  }[];
};

// 2. Funzione di supporto per trovare la ricetta migliore per uno slot
function findBestRecipeForSlot(
  recipes: RecipeForGenerator[],
  targetCalories: number,
  usedRecipeIds: Set<number>
): RecipeForGenerator | null {
  let bestMatch: RecipeForGenerator | null = null;
  let smallestDifference = Infinity;

  for (const recipe of recipes) {
    if (usedRecipeIds.has(recipe.id)) {
      continue; // Salta la ricetta se è già stata usata
    }

    const difference = Math.abs(recipe.calories - targetCalories);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestMatch = recipe;
    }
  }
  return bestMatch;
}

// 3. Funzione principale per la generazione del piano alimentare
export function generateMealPlan(
  preferences: UserPreferencesForGenerator
): GeneratedMealPlan {
  console.log("[Generator] Avvio generazione con preferenze:", preferences);

  // 3.1. Query per recuperare TUTTE le ricette che soddisfano i criteri base
  // Questo è l'unico accesso al DB, un'ottimizzazione fondamentale.
  let query =
    "SELECT id, title, calories, meal_types, dietary_category, difficulty FROM recipes WHERE 1=1";
  const params: (string | number)[] = [];

  // Filtro per la dieta (se non è 'NONE')
  if (preferences.dietaryPreference !== "NONE") {
    query += " AND dietary_category = ?";
    params.push(preferences.dietaryPreference);
  }

  // Filtro per la difficoltà (se non è 'ANY')
  if (preferences.difficultyLevel !== "ANY") {
    query += " AND difficulty = ?";
    params.push(preferences.difficultyLevel);
  }

  const eligibleRecipes = db
    .prepare(query)
    .all(...params) as RecipeForGenerator[];
  console.log(`[Generator] Trovate ${eligibleRecipes.length} ricette idonee.`);

  // 3.2. Suddividiamo le ricette per tipo di pasto per un accesso più rapido
  const recipePool = {
    BREAKFAST: eligibleRecipes.filter((r) =>
      JSON.parse(r.meal_types).includes("BREAKFAST")
    ),
    LUNCH: eligibleRecipes.filter((r) =>
      JSON.parse(r.meal_types).includes("LUNCH")
    ),
    DINNER: eligibleRecipes.filter((r) =>
      JSON.parse(r.meal_types).includes("DINNER")
    ),
  };

  // 3.3. Inizializziamo le strutture dati del piano
  const mealPlan: GeneratedMealPlan = { days: [] };
  const usedRecipeIds = new Set<number>();

  // 3.4. Ciclo di generazione per 7 giorni
  for (let day = 1; day <= 7; day++) {
    const dailyMeals: GeneratedMealPlan["days"][0]["meals"] = [];
    let dailyTotalCalories = 0;

    const mealOrder: ("BREAKFAST" | "LUNCH" | "DINNER")[] = [
      "BREAKFAST",
      "LUNCH",
      "DINNER",
    ];

    for (const mealType of mealOrder) {
      // Calcoliamo le calorie target per questo specifico pasto
      const distributionPercent =
        preferences.distribution[
          mealType.toLowerCase() as keyof typeof preferences.distribution
        ] / 100;
      const targetCalories = preferences.calorieTarget * distributionPercent;

      // Troviamo la ricetta migliore dal pool corretto
      const recipe = findBestRecipeForSlot(
        recipePool[mealType],
        targetCalories,
        usedRecipeIds
      );

      if (!recipe) {
        // Se non troviamo una ricetta, la generazione fallisce.
        // In futuro qui si potrebbe inserire logica di backtracking.
        throw new Error(
          `Impossibile trovare una ricetta valida per ${mealType} del giorno ${day}. Prova ad allargare i criteri.`
        );
      }

      // Aggiungiamo la ricetta al piano e la segniamo come usata
      dailyMeals.push({
        mealType,
        recipe: {
          id: recipe.id,
          title: recipe.title,
          calories: recipe.calories,
        },
      });
      dailyTotalCalories += recipe.calories;
      usedRecipeIds.add(recipe.id);
    }

    mealPlan.days.push({
      dayOfWeek: day,
      meals: dailyMeals,
      totalCalories: dailyTotalCalories,
    });
  }

  console.log("[Generator] Generazione piano completata con successo.");
  return mealPlan;
}
