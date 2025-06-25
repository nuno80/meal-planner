// src/lib/validators/preferences.ts v.2.0 (Semplificato)
// Schema di validazione senza la gestione degli allergeni.
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

// Schema principale aggiornato
export const userPreferencesSchema = z.object({
  calorieTarget: z.coerce
    .number()
    .int()
    .positive("L'obiettivo calorico deve essere un numero positivo."),
  distribution: distributionSchema,
  dietaryPreference: z.enum(["NONE", "VEGETARIAN", "VEGAN", "PESCATARIAN"]),
  difficultyLevel: z.enum(["ANY", "EASY", "MEDIUM", "HARD"]),
  // MODIFICA: Rimosso 'allergenIds'
  dislikedIngredients: z.array(z.string()),
});

export type UserPreferencesPayload = z.infer<typeof userPreferencesSchema>;
