// src/components/features/shopping-list/ShoppingListConfigurator.tsx v.1.1
// Componente client che ora utilizza le traduzioni per l'UI del form.

'use client';

// 1. Import necessari (aggiunto useTranslations e rimosso Route)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 2. Definizione Tipi (invariata)
type Meal = { id: number; recipeId: number; recipeName: string; };
type DayPlan = { dayName: string; meals: Meal[]; };
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
  // Inizializza le funzioni di traduzione per i namespace necessari
  const t = useTranslations('ShoppingListPage');
  const tDays = useTranslations('Days');

  // 4. Gestione Stato del Form (invariata)
  const [people, setPeople] = useState(initialPeople);
  const [selectedRecipes, setSelectedRecipes] = useState(new Set(initialSelectedRecipeIds));

  useEffect(() => {
    setPeople(initialPeople);
    setSelectedRecipes(new Set(initialSelectedRecipeIds));
  }, [initialPeople, initialSelectedRecipeIds]);

  // 5. Logica di gestione degli eventi (invariata, ma senza 'as Route')
  const handleRecipeToggle = (recipeId: number) => {
    const newSelection = new Set(selectedRecipes);
    if (newSelection.has(recipeId)) newSelection.delete(recipeId);
    else newSelection.add(recipeId);
    setSelectedRecipes(newSelection);
  };

  const handleDayToggle = (day: DayPlan) => {
    const recipeIdsInDay = day.meals.map(m => m.recipeId);
    const newSelection = new Set(selectedRecipes);
    const allSelected = recipeIdsInDay.every(id => newSelection.has(id));
    if (allSelected) recipeIdsInDay.forEach(id => newSelection.delete(id));
    else recipeIdsInDay.forEach(id => newSelection.add(id));
    setSelectedRecipes(newSelection);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('people', String(people > 0 ? people : 1));
    params.set('recipes', Array.from(selectedRecipes).join(','));
    // L'asserzione di tipo 'as Route' non è più necessaria con le versioni recenti
    router.push(`/shopping-list?${params.toString()}`);
  };

  // 6. Rendering del Form con testo tradotto
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t('configuratorTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="people-input">{t('peopleLabel')}</Label>
            <Input id="people-input" type="number" min="1" value={people} onChange={(e) => setPeople(Number(e.target.value))} className="max-w-xs" />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">{t('selectMealsLabel')}</Label>
            {mealPlan.map((day) => {
              const recipeIdsInDay = day.meals.map(m => m.recipeId);
              const allSelected = recipeIdsInDay.length > 0 && recipeIdsInDay.every(id => selectedRecipes.has(id));

              return (
                <div key={day.dayName} className="p-4 border rounded-md bg-gray-50/50">
                  <div className="flex items-center space-x-3">
                    <Checkbox id={`day-${day.dayName}`} checked={allSelected} onCheckedChange={() => handleDayToggle(day)} />
                    <Label htmlFor={`day-${day.dayName}`} className="text-lg font-semibold cursor-pointer">
                      {/* Traduzione del giorno della settimana */}
                      {tDays(day.dayName as any)}
                    </Label>
                  </div>
                  <ul className="mt-3 pl-8 space-y-2">
                    {day.meals.map((meal) => (
                      <li key={meal.id} className="flex items-center space-x-3">
                        <Checkbox id={`meal-${meal.id}`} checked={selectedRecipes.has(meal.recipeId)} onCheckedChange={() => handleRecipeToggle(meal.recipeId)} />
                        <Label htmlFor={`meal-${meal.id}`} className="font-normal cursor-pointer">
                          {meal.recipeName}
                        </Label>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <Button type="submit" className="w-full sm:w-auto">{t('updateButton')}</Button>
        </form>
      </CardContent>
    </Card>
  );
}