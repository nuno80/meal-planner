// src/app/meal-plan/generate/page.tsx v.1.1 (Corretto)
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@clerk/nextjs/server";
import { Loader2 } from "lucide-react";

import {
  MealPlanDisplay,
  PlanForDisplay,
} from "@/components/features/meal-plan/MealPlanDisplay";
import Navbar from "@/components/navbar";
import { db } from "@/lib/db";
import {
  GeneratedMealPlan,
  UserPreferencesForGenerator,
  generateMealPlan,
} from "@/lib/meal-plan-generator";

// Funzione helper per salvare il piano
function savePlanToDb(
  userId: string,
  plan: GeneratedMealPlan,
  prefs: UserPreferencesForGenerator
): number {
  const transaction = db.transaction(() => {
    const totalCalories = plan.days.reduce(
      (sum, day) => sum + day.totalCalories,
      0
    );
    const averageCalories = totalCalories / plan.days.length;
    const planInsertStmt = db.prepare(
      `INSERT INTO meal_plans (user_id, total_calories_avg, dietary_preference_snapshot, difficulty_level_snapshot) VALUES (?, ?, ?, ?)`
    );
    const planResult = planInsertStmt.run(
      userId,
      averageCalories,
      prefs.dietaryPreference,
      prefs.difficultyLevel
    );
    const mealPlanId = Number(planResult.lastInsertRowid);
    const dayInsertStmt = db.prepare(
      "INSERT INTO meal_plan_days (meal_plan_id, day_of_week) VALUES (?, ?)"
    );
    const mealInsertStmt = db.prepare(
      "INSERT INTO meal_plan_meals (meal_plan_day_id, meal_type, recipe_id) VALUES (?, ?, ?)"
    );
    for (const day of plan.days) {
      const dayResult = dayInsertStmt.run(mealPlanId, day.dayOfWeek);
      const mealPlanDayId = Number(dayResult.lastInsertRowid);
      for (const meal of day.meals) {
        mealInsertStmt.run(mealPlanDayId, meal.mealType, meal.recipe.id);
      }
    }
    return mealPlanId;
  });
  return transaction();
}

// Componente asincrono che fa il lavoro pesante (CORRETTO)
async function Generator({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // MODIFICA: Aggiunto 'await'
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const preferences: UserPreferencesForGenerator = {
    calorieTarget: parseInt(
      (searchParams.calorieTarget as string) || "2000",
      10
    ),
    dietaryPreference: (searchParams.dietaryPreference as any) || "NONE",
    difficultyLevel: (searchParams.difficultyLevel as any) || "ANY",
    distribution: { breakfast: 30, lunch: 40, dinner: 30 },
  };

  try {
    const generatedPlan = generateMealPlan(preferences);
    const savedPlanId = savePlanToDb(userId, generatedPlan, preferences);

    let mealCounter = 1;
    const planForDisplay: PlanForDisplay = {
      id: savedPlanId,
      days: generatedPlan.days.map((day, dayIndex) => ({
        id: dayIndex,
        dayOfWeek: day.dayOfWeek,
        totalCalories: day.totalCalories,
        meals: day.meals.map((meal) => ({
          id: mealCounter++,
          mealType: meal.mealType,
          recipe: meal.recipe,
        })),
      })),
    };

    return <MealPlanDisplay initialPlan={planForDisplay} />;
  } catch (error) {
    return (
      <div className="rounded-lg border border-red-500 bg-red-900/50 p-6 text-center text-red-400">
        <h2 className="text-xl font-bold">Errore durante la generazione</h2>
        <p className="mt-2">{(error as Error).message}</p>
        <p className="mt-4 text-sm">
          Prova a modificare le tue preferenze e a generare di nuovo il piano.
        </p>
      </div>
    );
  }
}

// Pagina contenitore (invariata)
export default function GeneratePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">Generazione del Tuo Piano...</h1>
          <p className="text-text-secondary mt-4 text-lg">
            Attendere prego, stiamo creando un piano su misura per te.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="text-brand-accent h-12 w-12 animate-spin" />
            </div>
          }
        >
          <Generator searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
