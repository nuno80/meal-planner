// src/components/features/profile/PreferencesForm.tsx v.2.2 (Corretto)

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

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
import {
  UserPreferencesPayload,
  userPreferencesSchema,
} from "@/lib/validators/preferences";

// src/components/features/profile/PreferencesForm.tsx v.2.2 (Corretto)

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<UserPreferencesPayload>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      calorieTarget: 2000,
      distribution: { breakfast: 30, lunch: 40, dinner: 30 },
      dietaryPreference: "NONE",
      difficultyLevel: "ANY",
      allergenIds: [],
      dislikedIngredients: [],
    },
  });

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const data: UserPreferencesPayload = await response.json();
          form.reset(data);
        }
      } catch (error) {
        console.error("Errore durante il caricamento delle preferenze:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPreferences();
  }, [form]);

  async function onSubmit(data: UserPreferencesPayload) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error("Errore del server durante il salvataggio.");
      toast({
        title: "Preferenze salvate!",
        description: "Ora puoi generare il tuo piano alimentare.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-brand-accent h-8 w-8 animate-spin" />
      </div>
    );
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
            <Select
              onValueChange={(value) =>
                form.setValue("dietaryPreference", value as any)
              }
              value={form.watch("dietaryPreference")}
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
            <Select
              onValueChange={(value) =>
                form.setValue("difficultyLevel", value as any)
              }
              value={form.watch("difficultyLevel")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">Qualsiasi</SelectItem>
                <SelectItem value="EASY">Facile</SelectItem>
                <SelectItem value="MEDIUM">Medio</SelectItem>
                <SelectItem value="HARD">Difficile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blocco 1: MODIFICA CORRETTA del tag di chiusura */}
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
                    checked={form.watch("allergenIds").includes(allergen.id)}
                    onCheckedChange={(checked) => {
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
                setValueAs: (value) => {
                  if (typeof value === "string")
                    return value
                      ? value.split(",").map((item) => item.trim())
                      : [];
                  return value;
                },
                onChange: (e) => {
                  form.setValue(
                    "dislikedIngredients",
                    e.target.value.split(",").map((s: string) => s.trim())
                  );
                },
              })}
              defaultValue={
                Array.isArray(form.getValues("dislikedIngredients"))
                  ? form.getValues("dislikedIngredients").join(", ")
                  : ""
              }
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvataggio..." : "Salva Preferenze"}
      </Button>
    </form>
  );
}
