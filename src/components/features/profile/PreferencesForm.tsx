// src/components/features/profile/PreferencesForm.tsx v.5.1 (JSX Corretto)

"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// src/components/features/profile/PreferencesForm.tsx v.5.1 (JSX Corretto)

// src/components/features/profile/PreferencesForm.tsx v.5.1 (JSX Corretto)

export function PreferencesForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<UserPreferencesPayload>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      calorieTarget: 2000,
      distribution: { breakfast: 30, lunch: 40, dinner: 30 },
      dietaryPreference: "NONE",
      difficultyLevel: "ANY",
      dislikedIngredients: [],
    },
  });

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const data = await response.json();
          form.reset(data);
        }
      } catch (error) {
        console.error("Errore caricamento preferenze:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPreferences();
  }, [form]);

  async function onSubmit(data: UserPreferencesPayload) {
    setIsProcessing(true);
    try {
      await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const params = new URLSearchParams();
      params.append("calorieTarget", data.calorieTarget.toString());
      params.append("dietaryPreference", data.dietaryPreference);
      params.append("difficultyLevel", data.difficultyLevel);
      params.append("dislikedIngredients", data.dislikedIngredients.join(","));

      const url = `/meal-plan/generate?${params.toString()}`;

      router.push(url as Route);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile avviare la generazione.",
        variant: "destructive",
      });
      setIsProcessing(false);
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
      <div className="border-warning flex items-start gap-4 rounded-lg border bg-yellow-900/50 p-4 text-yellow-300">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div>
          <h4 className="font-bold">Attenzione a Allergie e Intolleranze</h4>
          <p className="text-sm text-yellow-400">
            Il piano generato non tiene conto di allergie o intolleranze
            specifiche. Controlla sempre gli ingredienti delle ricette se hai
            esigenze particolari.
          </p>
        </div>
      </div>
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
        <CardContent className="space-y-6">
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
                <SelectItem value="NONE">Nessuna (Mediterranea)</SelectItem>
                <SelectItem value="VEGETARIAN">Vegetariana</SelectItem>
                <SelectItem value="VEGAN">Vegana</SelectItem>
                <SelectItem value="PESCATARIAN">Pescatariana</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-text-secondary mt-2 text-xs">
              Nota: Attualmente il database è ottimizzato per la dieta
              Mediterranea. Altre selezioni potrebbero limitare le ricette
              disponibili.
            </p>
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

      {/* MODIFICA: Corretto il tag di chiusura */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredienti da Escludere</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-pink-500 hover:bg-pink-700"
      >
        {isProcessing ? "AVVIO..." : "CLICCA QUI - TEST NUOVO CODICE"}
      </Button>
    </form>
  );
}
