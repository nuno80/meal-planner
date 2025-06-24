// src/components/features/meal-plan/MealPlanDisplay.tsx v.1.0
// Componente Client dedicato a visualizzare un piano alimentare e gestire le interazioni.

"use client";

import { useState } from "react";

import { Moon, RotateCw, Sun, Sunrise, Utensils } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";

// src/components/features/meal-plan/MealPlanDisplay.tsx v.1.0
// Componente Client dedicato a visualizzare un piano alimentare e gestire le interazioni.

// src/components/features/meal-plan/MealPlanDisplay.tsx v.1.0
// Componente Client dedicato a visualizzare un piano alimentare e gestire le interazioni.

// 1. Definiamo i tipi di dato che questo componente si aspetta di ricevere
// Questi tipi riflettono i dati come vengono letti dal database.
type RecipeInfo = { id: number; title: string; calories: number };
type MealInfo = {
  id: number;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  recipe: RecipeInfo;
};
type DayInfo = {
  id: number;
  dayOfWeek: number;
  meals: MealInfo[];
  totalCalories: number;
};
export type PlanForDisplay = { id: number; days: DayInfo[] };

// 2. Componente per la singola card di un pasto (simile a prima)
function MealCard({
  meal,
  onSwap,
}: {
  meal: MealInfo;
  onSwap: (mealId: number) => void;
}) {
  const icons = {
    BREAKFAST: <Sunrise className="text-brand-accent" />,
    LUNCH: <Sun className="text-brand-accent" />,
    DINNER: <Moon className="text-brand-accent" />,
  };

  return (
    <div className="bg-base-surface border-border-default flex items-center gap-4 rounded-xl border p-4">
      <div className="bg-base-muted rounded-lg p-3">
        {icons[meal.mealType] || <Utensils className="text-brand-accent" />}
      </div>
      <div className="flex-grow">
        <p className="text-text-secondary text-xs font-medium uppercase">
          {meal.mealType}
        </p>
        <h3 className="text-text-primary font-semibold">{meal.recipe.title}</h3>
        <p className="text-text-secondary text-xs">
          ~ {meal.recipe.calories} kcal
        </p>
      </div>
      <button
        onClick={() => onSwap(meal.id)}
        className="hover:bg-base-muted rounded-full p-2 transition-colors"
        title="Sostituisci pasto"
      >
        <RotateCw className="text-text-secondary h-4 w-4" />
      </button>
    </div>
  );
}

// 3. Componente principale per la visualizzazione
export function MealPlanDisplay({
  initialPlan,
}: {
  initialPlan: PlanForDisplay;
}) {
  // MODIFICA: Lo stato ora può essere PlanForDisplay o null
  const [plan, setPlan] = useState<PlanForDisplay | null>(initialPlan);
  const { toast } = useToast();

  const handleSwapMeal = async (mealIdToSwap: number) => {
    const newRecipeId = 10;
    toast({ description: "Sto sostituendo il pasto..." });

    try {
      const response = await fetch(`/api/meal-plan/meal/${mealIdToSwap}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRecipeId }),
      });

      if (!response.ok) throw new Error("Impossibile sostituire il pasto.");

      // MODIFICA: Logica di aggiornamento stato corretta
      setPlan((currentPlan) => {
        if (!currentPlan) return null; // Se il piano è nullo, resta nullo

        const newPlan = { ...currentPlan };
        newPlan.days = newPlan.days.map((day) => ({
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.id === mealIdToSwap) {
              return {
                ...meal,
                recipe: {
                  id: newRecipeId,
                  title: "Pasto Sostitutivo",
                  calories: 555,
                },
              };
            }
            return meal;
          }),
        }));
        // Restituisce sempre un oggetto di tipo PlanForDisplay
        return newPlan;
      });

      toast({ title: "Successo!", description: "Pasto sostituito." });
    } catch (err) {
      toast({
        title: "Errore",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  // MODIFICA: Aggiunto un controllo per quando il piano è nullo
  if (!plan) {
    return <div>Nessun piano da visualizzare.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plan.days.map((day) => (
        <div
          key={day.id}
          className="bg-base-surface border-border-default rounded-2xl border p-4"
        >
          <h3 className="text-text-primary mb-4 text-center text-lg font-bold">
            Giorno {day.dayOfWeek}
          </h3>
          <div className="space-y-3">
            {day.meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onSwap={handleSwapMeal} />
            ))}
          </div>
          <div className="border-border-default mt-4 border-t pt-3 text-right">
            <p className="text-text-secondary text-sm">
              Totale:{" "}
              <span className="text-text-primary font-bold">
                {day.totalCalories} kcal
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
