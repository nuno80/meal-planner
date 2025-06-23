// src/lib/validators/preferences.ts v.1.2
// Schema aggiornato per includere 'ANY' come livello di difficoltà.
import { z } from "zod";

const distributionSchema = z
  .object({
    breakfast: z.number().int().min(0).max(100),
    lunch: z.number().int().min(0).max(100),
    dinner: z.number().int().min(0).max(100),
  })
  .refine(
    (data: { breakfast: number; lunch: number; dinner: number }) =>
      data.breakfast + data.lunch + data.dinner === 100,
    {
      message:
        "La somma delle percentuali di colazione, pranzo e cena deve essere 100.",
      path: ["distribution"],
    }
  );

export const userPreferencesSchema = z.object({
  calorieTarget: z.coerce
    .number()
    .int()
    .positive("L'obiettivo calorico deve essere un numero positivo."),
  distribution: distributionSchema,
  dietaryPreference: z.enum(["NONE", "VEGETARIAN", "VEGAN", "PESCATARIAN"]),
  // MODIFICA: Aggiungiamo 'ANY' alla lista e lo impostiamo come default.
  difficultyLevel: z.enum(["ANY", "EASY", "MEDIUM", "HARD"]),
  allergenIds: z.array(z.number().int()),
  dislikedIngredients: z.array(z.string()),
});

export type UserPreferencesPayload = z.infer<typeof userPreferencesSchema>;
