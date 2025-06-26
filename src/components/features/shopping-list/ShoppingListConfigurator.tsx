// src/components/features/shopping-list/ShoppingListConfigurator.tsx v.1.0
// Componente client interattivo per configurare i parametri della lista della spesa.

"use client";

// 1. Import necessari da React, Next.js e shadcn/ui
import { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// src/components/features/shopping-list/ShoppingListConfigurator.tsx v.1.0
// Componente client interattivo per configurare i parametri della lista della spesa.

// src/components/features/shopping-list/ShoppingListConfigurator.tsx v.1.0
// Componente client interattivo per configurare i parametri della lista della spesa.

// src/components/features/shopping-list/ShoppingListConfigurator.tsx v.1.0
// Componente client interattivo per configurare i parametri della lista della spesa.

// src/components/features/shopping-list/ShoppingListConfigurator.tsx v.1.0
// Componente client interattivo per configurare i parametri della lista della spesa.

// 2. Definizione Tipi (duplicati dalla pagina per autonomia del componente)
type Meal = {
  id: number;
  recipeId: number;
  recipeName: string;
};
type DayPlan = {
  dayName: string;
  meals: Meal[];
};
type MealPlan = DayPlan[];

interface ShoppingListConfiguratorProps {
  mealPlan: MealPlan;
  initialPeople: number;
  initialSelectedRecipeIds: number[];
}

// 3. Componente Principale
export function ShoppingListConfigurator({
  mealPlan,
  initialPeople,
  initialSelectedRecipeIds,
}: ShoppingListConfiguratorProps) {
  const router = useRouter();

  // 4. Gestione Stato del Form
  const [people, setPeople] = useState(initialPeople);
  const [selectedRecipes, setSelectedRecipes] = useState(
    new Set(initialSelectedRecipeIds)
  );

  // Sincronizza lo stato se le props iniziali cambiano (es. navigazione browser)
  useEffect(() => {
    setPeople(initialPeople);
    setSelectedRecipes(new Set(initialSelectedRecipeIds));
  }, [initialPeople, initialSelectedRecipeIds]);

  // 5. Logica di gestione degli eventi
  const handleRecipeToggle = (recipeId: number) => {
    const newSelection = new Set(selectedRecipes);
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId);
    } else {
      newSelection.add(recipeId);
    }
    setSelectedRecipes(newSelection);
  };

  const handleDayToggle = (day: DayPlan) => {
    const recipeIdsInDay = day.meals.map((m) => m.recipeId);
    const newSelection = new Set(selectedRecipes);
    const allSelected = recipeIdsInDay.every((id) => newSelection.has(id));

    if (allSelected) {
      recipeIdsInDay.forEach((id) => newSelection.delete(id));
    } else {
      recipeIdsInDay.forEach((id) => newSelection.add(id));
    }
    setSelectedRecipes(newSelection);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("people", String(people > 0 ? people : 1));
    params.set("recipes", Array.from(selectedRecipes).join(","));

    const url = `/shopping-list?${params.toString()}`;
    // CORREZIONE: Asserzione di tipo per router.push con URL dinamico
    router.push(url as Route);
  };

  // 6. Rendering del Form
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Configura la tua spesa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="people-input">Numero di persone</Label>
            <Input
              id="people-input"
              type="number"
              min="1"
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              className="max-w-xs"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">
              Seleziona i pasti da includere
            </Label>
            {mealPlan.map((day) => {
              const recipeIdsInDay = day.meals.map((m) => m.recipeId);
              const allSelected =
                recipeIdsInDay.length > 0 &&
                recipeIdsInDay.every((id) => selectedRecipes.has(id));

              return (
                <div
                  key={day.dayName}
                  className="rounded-md border bg-gray-50/50 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`day-${day.dayName}`}
                      checked={allSelected}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label
                      htmlFor={`day-${day.dayName}`}
                      className="cursor-pointer text-lg font-semibold"
                    >
                      {day.dayName}
                    </Label>
                  </div>
                  <ul className="mt-3 space-y-2 pl-8">
                    {day.meals.map((meal) => (
                      <li key={meal.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`meal-${meal.id}`}
                          checked={selectedRecipes.has(meal.recipeId)}
                          onCheckedChange={() =>
                            handleRecipeToggle(meal.recipeId)
                          }
                        />
                        <Label
                          htmlFor={`meal-${meal.id}`}
                          className="cursor-pointer font-normal"
                        >
                          {meal.recipeName}
                        </Label>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            Aggiorna Lista
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
