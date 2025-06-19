// src/app/api/user/preferences/route.ts v.1.0
// API Route per creare o aggiornare le preferenze di un utente.
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import { db } from "@/lib/db";
import {
  UserPreferencesPayload,
  userPreferencesSchema,
} from "@/lib/validators/preferences";

// 1. Funzione handler per le richieste PUT (ideale per logiche di upsert)
export async function PUT(req: NextRequest) {
  try {
    // 2. Protezione della rotta: ottenere l'ID dell'utente autenticato
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3. Parsing e validazione del corpo della richiesta con Zod
    const body = await req.json();
    const validatedData: UserPreferencesPayload =
      userPreferencesSchema.parse(body);

    const {
      calorieTarget,
      distribution,
      dietaryPreference,
      difficultyLevel,
      allergenIds,
      dislikedIngredients,
    } = validatedData;

    // 4. Logica di salvataggio nel database (UPSERT)
    // Usiamo una transazione per garantire l'atomicità delle operazioni.
    const transaction = db.transaction(() => {
      // 4.1. Cerca l'ID delle preferenze esistenti per questo utente
      let userPrefStmt = db.prepare(
        "SELECT id FROM user_preferences WHERE user_id = ?"
      );
      let existingPref = userPrefStmt.get(userId) as { id: number } | undefined;

      let userPreferenceId: number;

      if (existingPref) {
        // 4.2. Se esistono, aggiorna le preferenze
        userPreferenceId = existingPref.id;
        const updateStmt = db.prepare(`
                UPDATE user_preferences
                SET calorie_target = ?, distribution = ?, dietary_preference = ?, 
                    difficulty_level = ?, disliked_ingredients = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
        updateStmt.run(
          calorieTarget,
          JSON.stringify(distribution),
          dietaryPreference,
          difficultyLevel,
          JSON.stringify(dislikedIngredients),
          userPreferenceId
        );
      } else {
        // 4.3. Se non esistono, crea un nuovo record di preferenze
        const insertStmt = db.prepare(`
                INSERT INTO user_preferences (user_id, calorie_target, distribution, dietary_preference, difficulty_level, disliked_ingredients)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
        const result = insertStmt.run(
          userId,
          calorieTarget,
          JSON.stringify(distribution),
          dietaryPreference,
          difficultyLevel,
          JSON.stringify(dislikedIngredients)
        );
        userPreferenceId = Number(result.lastInsertRowid);
      }

      // 4.4. Gestione della tabella di giunzione per gli allergeni
      // Prima si rimuovono tutti gli allergeni vecchi per questo utente
      const deleteStmt = db.prepare(
        "DELETE FROM user_preferences_allergens WHERE user_preference_id = ?"
      );
      deleteStmt.run(userPreferenceId);

      // Poi si inseriscono i nuovi
      if (allergenIds && allergenIds.length > 0) {
        const insertAllergenStmt = db.prepare(
          "INSERT INTO user_preferences_allergens (user_preference_id, allergen_id) VALUES (?, ?)"
        );
        for (const allergenId of allergenIds) {
          insertAllergenStmt.run(userPreferenceId, allergenId);
        }
      }
    });

    transaction();

    // 5. Risposta di successo
    return new NextResponse("Preferences updated successfully", {
      status: 200,
    });
  } catch (error) {
    // 6. Gestione degli errori di validazione di Zod
    if (error instanceof ZodError) {
      // Restituisce un messaggio di errore chiaro con i dettagli della validazione
      return new NextResponse(
        JSON.stringify({ message: "Validation Error", errors: error.errors }),
        { status: 400 }
      );
    }

    // 7. Gestione di altri errori server
    console.error("Errore durante l'aggiornamento delle preferenze:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
