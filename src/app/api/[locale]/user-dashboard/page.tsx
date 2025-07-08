// src/app/user-dashboard/page.tsx v.1.2 (Pulsante stilizzato)
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { Utensils } from "lucide-react";

import {
  MealPlanDisplay,
  PlanForDisplay,
} from "@/components/features/meal-plan/MealPlanDisplay";
import Navbar from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
// 1. Importiamo gli stili del bottone
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

// 2. Importiamo l'utility per unire le classi

async function getLastMealPlan(userId: string): Promise<PlanForDisplay | null> {
  // ... (logica invariata)
  try {
    const lastPlanStmt = db.prepare(
      `SELECT id FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
    );
    const lastPlan = lastPlanStmt.get(userId) as { id: number } | undefined;
    if (!lastPlan) return null;
    const planId = lastPlan.id;
    const daysStmt = db.prepare(
      "SELECT id, day_of_week FROM meal_plan_days WHERE meal_plan_id = ? ORDER BY day_of_week ASC"
    );
    const days = daysStmt.all(planId) as { id: number; day_of_week: number }[];
    if (days.length === 0) return null;
    const mealsStmt = db.prepare(
      `SELECT m.id, m.meal_plan_day_id, m.meal_type, m.recipe_id, r.title, r.calories FROM meal_plan_meals as m JOIN recipes as r ON m.recipe_id = r.id WHERE m.meal_plan_day_id IN (${days.map((d) => d.id).join(",")})`
    );
    const allMeals = mealsStmt.all() as any[];
    const planForDisplay: PlanForDisplay = {
      id: planId,
      days: days.map((day) => {
        const dayMeals = allMeals
          .filter((meal) => meal.meal_plan_day_id === day.id)
          .map((meal) => ({
            id: meal.id,
            mealType: meal.meal_type,
            recipe: {
              id: meal.recipe_id,
              title: meal.title,
              calories: meal.calories,
            },
          }));
        const totalCalories = dayMeals.reduce(
          (sum, meal) => sum + meal.recipe.calories,
          0
        );
        return {
          id: day.id,
          dayOfWeek: day.day_of_week,
          meals: dayMeals,
          totalCalories: totalCalories,
        };
      }),
    };
    return planForDisplay;
  } catch (error) {
    console.error("Errore nel recupero dell'ultimo piano:", error);
    return null;
  }
}

export default async function UserDashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return <div>Devi essere autenticato per vedere questa pagina.</div>;
  }

  const lastPlan = await getLastMealPlan(userId);

  return (
    <div>
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-text-primary text-4xl font-bold tracking-tight">
            Il Tuo Ultimo Piano
          </h1>
          <p className="text-text-secondary mt-4 text-lg">
            Ecco l'ultimo piano alimentare che hai generato.
          </p>
        </div>

        {lastPlan ? (
          <MealPlanDisplay initialPlan={lastPlan} />
        ) : (
          <div className="text-text-secondary border-border-default rounded-lg border-2 border-dashed py-10 text-center">
            <Utensils className="mx-auto mb-4 h-12 w-12" />
            <h3 className="text-text-primary text-xl font-semibold">
              Nessun piano trovato.
            </h3>
            <p className="mt-2">
              Sembra che tu non abbia ancora generato un piano alimentare.
            </p>

            {/* 3. MODIFICA: Applichiamo gli stili del bottone al Link */}
            <Link
              href="/meal-plan/create"
              className={cn(buttonVariants({ variant: "default" }), "mt-6")} // Usiamo 'default' per lo stile primario
            >
              Genera il tuo primo piano
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
