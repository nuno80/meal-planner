// src/components/features/meal-plan/MealPlanInterface.tsx v.1.1
// Aggiunta la funzionalità di "swap" di un singolo pasto.

"use client";

import { useState } from "react";

import {
  AlertTriangle,
  Loader2,
  Moon,
  RotateCw,
  Sun,
  Sunrise,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { GeneratedMealPlan } from "@/lib/meal-plan-generator";

// src/components/features/meal-plan/MealPlanInterface.tsx v.1.1
// Aggiunta la funzionalità di "swap" di un singolo pasto.

// 1. Aggiungiamo 'mealId' e la funzione 'onSwap' alle props di MealCard
function MealCard({
  mealId,
  mealType,
  recipeName,
  calories,
  onSwap,
}: {
  mealId: number;
  mealType: string;
  recipeName: string;
  calories: number;
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
        {icons[mealType as keyof typeof icons] || (
          <Utensils className="text-brand-accent" />
        )}
      </div>
      <div className="flex-grow">
        <p className="text-text-secondary text-xs font-medium uppercase">
          {mealType}
        </p>
        <h3 className="text-text-primary font-semibold">{recipeName}</h3>
        <p className="text-text-secondary text-xs">~ {calories} kcal</p>
      </div>
      {/* Aggiungiamo il pulsante di swap che chiama la funzione passata come prop */}
      <button
        onClick={() => onSwap(mealId)}
        className="hover:bg-base-muted rounded-full p-2 transition-colors"
        title="Sostituisci pasto"
      >
        <RotateCw className="text-text-secondary h-4 w-4" />
      </button>
    </div>
  );
}

// Estendiamo il tipo del piano per includere l'ID del pasto
type MealWithId = GeneratedMealPlan["days"][0]["meals"][0] & { id: number };
type DayWithMealIds = Omit<GeneratedMealPlan["days"][0], "meals"> & {
  meals: MealWithId[];
};
type PlanWithMealIds = {
  databaseId?: number;
  days: DayWithMealIds[];
};

export function MealPlanInterface() {
  const [plan, setPlan] = useState<PlanWithMealIds | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
      const response = await fetch("/api/meal-plan/generate", {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Qualcosa è andato storto.");

      // Simuleremo gli ID dei pasti per ora, in un'app reale arriverebbero dall'API
      let mealCounter = 1;
      const planWithIds: PlanWithMealIds = {
        ...result,
        days: result.days.map((day: any) => ({
          ...day,
          meals: day.meals.map((meal: any) => ({
            ...meal,
            id: mealCounter++, // Assegnamo un ID fittizio
          })),
        })),
      };

      setPlan(planWithIds);
      toast({
        title: "Successo!",
        description: "Il tuo nuovo piano è pronto.",
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      toast({
        title: "Errore di Generazione",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. NUOVA FUNZIONE per gestire la sostituzione di un pasto
  const handleSwapMeal = async (mealIdToSwap: number) => {
    // Simulazione: scegliamo una ricetta a caso con ID 10 per la sostituzione
    const newRecipeId = 10;

    // Mostriamo un feedback immediato all'utente (opzionale, ma buona UX)
    toast({ description: "Sto sostituendo il pasto..." });

    try {
      const response = await fetch(`/api/meal-plan/meal/${mealIdToSwap}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRecipeId: newRecipeId }),
      });

      if (!response.ok) {
        throw new Error("Impossibile sostituire il pasto.");
      }

      // Se la chiamata API ha successo, aggiorniamo lo stato locale
      // per riflettere il cambiamento senza ricaricare la pagina.
      setPlan((currentPlan) => {
        if (!currentPlan) return null;

        const newPlan = { ...currentPlan };
        // Troviamo il pasto da aggiornare e lo sostituiamo
        newPlan.days = newPlan.days.map((day) => ({
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.id === mealIdToSwap) {
              return {
                ...meal,
                recipe: {
                  id: newRecipeId,
                  title: "Nuova Ricetta Sostitutiva",
                  calories: 500,
                },
              }; // Dati fittizi
            }
            return meal;
          }),
        }));
        return newPlan;
      });

      toast({
        title: "Successo!",
        description: "Pasto sostituito correttamente.",
      });
    } catch (err) {
      toast({
        title: "Errore",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <Button onClick={handleGeneratePlan} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generazione...
            </>
          ) : (
            "Genera Nuovo Piano"
          )}
        </Button>
      </div>

      <div className="space-y-8">
        {isLoading && (
          <div className="text-text-secondary text-center">
            <p>Creazione in corso...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-4 rounded-lg border border-red-500 bg-red-900/50 p-4 text-red-300">
            <AlertTriangle />
            <p>{error}</p>
          </div>
        )}

        {/* 3. Passiamo mealId e onSwap al componente MealCard */}
        {plan && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plan.days.map((day) => (
              <div
                key={day.dayOfWeek}
                className="bg-base-surface border-border-default rounded-2xl border p-4"
              >
                <h3 className="text-text-primary mb-4 text-center text-lg font-bold">
                  Giorno {day.dayOfWeek}
                </h3>
                <div className="space-y-3">
                  {day.meals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      mealId={meal.id} // Passiamo l'ID del pasto
                      mealType={meal.mealType}
                      recipeName={meal.recipe.title}
                      calories={meal.recipe.calories}
                      onSwap={handleSwapMeal} // Passiamo la funzione di callback
                    />
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
        )}

        {!isLoading && !plan && !error && (
          <div className="text-text-secondary border-border-default rounded-lg border-2 border-dashed py-10 text-center">
            <Utensils className="mx-auto mb-4 h-12 w-12" />
            <h3 className="text-text-primary text-xl font-semibold">
              Pronto a iniziare?
            </h3>
            <p>
              Clicca il pulsante qui sopra per generare il tuo primo piano
              alimentare.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
