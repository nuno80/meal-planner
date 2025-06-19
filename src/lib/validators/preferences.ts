// src/lib/validators/preferences.ts v.1.1
// Schema di validazione Zod per i dati delle preferenze utente.
import { z } from "zod";

// 1. Schema per la distribuzione dei pasti
const distributionSchema = z
  .object({
    breakfast: z.number().int().min(0).max(100),
    lunch: z.number().int().min(0).max(100),
    dinner: z.number().int().min(0).max(100),
    // MODIFICA: Aggiunto il tipo esplicito per il parametro 'data' per risolvere l'errore 'implicitly has an any type'
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

// 2. Schema principale per le preferenze dell'utente
export const userPreferencesSchema = z.object({
  calorieTarget: z.coerce
    .number()
    .int()
    .positive("L'obiettivo calorico deve essere un numero positivo."),
  distribution: distributionSchema,
  dietaryPreference: z.enum(["NONE", "VEGETARIAN", "VEGAN", "PESCATARIAN"]),
  difficultyLevel: z.enum(["EASY", "MEDIUM", "HARD"]),
  allergenIds: z.array(z.number().int()),
  dislikedIngredients: z.array(z.string()),
});

// 3. Tipo TypeScript inferito dallo schema
export type UserPreferencesPayload = z.infer<typeof userPreferencesSchema>;
