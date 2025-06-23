// src/components/features/meal-plan/MealPlanInterface.tsx v.1.0

// Componente Client per gestire la generazione e la visualizzazione del piano alimentare.

"use client";

import { useState } from "react";

// Importiamo il tipo
import {
  AlertTriangle,
  Loader2,
  Moon,
  Sun,
  Sunrise,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { GeneratedMealPlan } from "@/lib/meal-plan-generator";

// src/components/features/meal-plan/MealPlanInterface.tsx v.1.0

// Componente Client per gestire la generazione e la visualizzazione del piano alimentare.

// src/components/features/meal-plan/MealPlanInterface.tsx v.1.0
// src/components/features/MealPlanInterface.tsx
// Componente Client per gestire la generazione e la visualizzazione del piano alimentare.

// src/components/features/meal-plan/MealPlanInterface.tsx v.1.0
// Componente Client per gestire la generazione e la visualizzazione del piano alimentare.

// 1. Componente per visualizzare una singola card di un pasto
function MealCard({
  mealType,
  recipeName,
  calories,
}: {
  mealType: string;
  recipeName: string;
  calories: number;
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
    </div>
  );
}

// 2. Componente principale dell'interfaccia
export function MealPlanInterface() {
  const [plan, setPlan] = useState<GeneratedMealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setError(null);
    setPlan(null); // Resetta il piano precedente

    try {
      const response = await fetch("/api/meal-plan/generate", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Qualcosa è andato storto durante la generazione."
        );
      }

      setPlan(result);
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

  return (
    <div className="mx-auto max-w-4xl">
      {/* 3. Pulsante di generazione */}
      <div className="mb-8 text-center">
        <Button onClick={handleGeneratePlan} disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generazione in corso...
            </>
          ) : (
            "Genera Nuovo Piano Settimanale"
          )}
        </Button>
      </div>

      {/* 4. Area di visualizzazione dinamica */}
      <div className="space-y-8">
        {/* Stato di caricamento */}
        {isLoading && (
          <div className="text-text-secondary text-center">
            <p>Stiamo creando il tuo piano personalizzato...</p>
          </div>
        )}

        {/* Stato di errore */}
        {error && (
          <div className="flex items-center gap-4 rounded-lg border border-red-500 bg-red-900/50 p-4 text-red-300">
            <AlertTriangle />
            <div>
              <h4 className="font-bold">Impossibile generare il piano</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stato di successo: visualizzazione del piano */}
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
                      key={meal.recipe.id}
                      mealType={meal.mealType}
                      recipeName={meal.recipe.title}
                      calories={meal.recipe.calories}
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

        {/* Stato iniziale (nessun piano, nessun errore, non in caricamento) */}
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
