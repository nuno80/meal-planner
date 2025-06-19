// src/components/features/profile/PreferencesForm.tsx v.1.1
// Form interattivo per raccogliere le preferenze dell'utente.

"use client";

import type { Route } from "next";
// MODIFICA: Import per type-safe routing
import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Importiamo i componenti UI da shadcn
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
// <-- QUESTA È LA RIGA CORRETTA
import {
  UserPreferencesPayload,
  userPreferencesSchema,
} from "@/lib/validators/preferences";

// src/components/features/profile/PreferencesForm.tsx v.1.1
// Form interattivo per raccogliere le preferenze dell'utente.

// src/components/features/profile/PreferencesForm.tsx v.1.1
// Form interattivo per raccogliere le preferenze dell'utente.

// src/components/features/profile/PreferencesForm.tsx v.1.1
// Form interattivo per raccogliere le preferenze dell'utente.

// src/components/features/profile/PreferencesForm.tsx v.1.1
// Form interattivo per raccogliere le preferenze dell'utente.

const ALLERGENS = [
  { id: 1, name: "Glutine" },
  { id: 2, name: "Lattosio" },
  { id: 3, name: "Frutta a guscio" },
  { id: 4, name: "Soia" },
  { id: 5, name: "Arachidi" },
];

export function PreferencesForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserPreferencesPayload>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      calorieTarget: 2000,
      distribution: { breakfast: 30, lunch: 40, dinner: 30 },
      dietaryPreference: "NONE",
      difficultyLevel: "MEDIUM",
      allergenIds: [],
      dislikedIngredients: [],
    },
  });

  async function onSubmit(data: UserPreferencesPayload) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Errore del server durante il salvataggio.");
      }

      toast({
        title: "Preferenze salvate!",
        description: "Stiamo per preparare la tua area personale.",
      });

      router.refresh();
      // MODIFICA: Aggiunto type casting per risolvere l'errore del router
      router.push("/meal-plan" as Route);
    } catch (error) {
      console.error("Errore nel salvataggio delle preferenze:", error);
      toast({
        title: "Oh no! Qualcosa è andato storto.",
        description:
          "Non è stato possibile salvare le tue preferenze. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Obiettivo Calorico</CardTitle>
          <CardDescription>
            Indica il tuo fabbisogno giornaliero.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="calorieTarget">Calorie Giornaliere Totali</Label>
          <Input
            id="calorieTarget"
            type="number"
            {...form.register("calorieTarget")}
          />
          {form.formState.errors.calorieTarget && (
            <p className="mt-1 text-sm text-red-500">
              {form.formState.errors.calorieTarget.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferenze Alimentari</CardTitle>
          <CardDescription>
            Seleziona il tuo regime alimentare e il livello di difficoltà.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>Regime alimentare</Label>
            {/* MODIFICA: Aggiunto tipo esplicito a 'value' */}
            <Select
              onValueChange={(value: string) =>
                form.setValue("dietaryPreference", value as any)
              }
              defaultValue={form.getValues("dietaryPreference")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Nessuna</SelectItem>
                <SelectItem value="VEGETARIAN">Vegetariana</SelectItem>
                <SelectItem value="VEGAN">Vegana</SelectItem>
                <SelectItem value="PESCATARIAN">Pescatariana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Livello di difficoltà</Label>
            {/* MODIFICA: Aggiunto tipo esplicito a 'value' */}
            <Select
              onValueChange={(value: string) =>
                form.setValue("difficultyLevel", value as any)
              }
              defaultValue={form.getValues("difficultyLevel")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Facile</SelectItem>
                <SelectItem value="MEDIUM">Medio</SelectItem>
                <SelectItem value="HARD">Difficile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Allergeni e Ingredienti da Escludere</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Seleziona eventuali allergeni</Label>
            <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3">
              {ALLERGENS.map((allergen) => (
                <div key={allergen.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${allergen.id}`}
                    // MODIFICA: Aggiunto tipo esplicito a 'checked'
                    onCheckedChange={(checked: boolean) => {
                      const currentIds = form.getValues("allergenIds");
                      if (checked) {
                        form.setValue("allergenIds", [
                          ...currentIds,
                          allergen.id,
                        ]);
                      } else {
                        form.setValue(
                          "allergenIds",
                          currentIds.filter((id) => id !== allergen.id)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`allergen-${allergen.id}`}>
                    {allergen.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="dislikedIngredients">
              Ingredienti non graditi (separati da virgola)
            </Label>
            <Input
              id="dislikedIngredients"
              placeholder="Es. funghi, cipolle, olive"
              {...form.register("dislikedIngredients", {
                setValueAs: (value) =>
                  value
                    ? value.split(",").map((item: string) => item.trim())
                    : [],
              })}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvataggio..." : "Salva e Inizia"}
      </Button>
    </form>
  );
}
