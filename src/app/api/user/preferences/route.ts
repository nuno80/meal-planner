// src/app/api/user/preferences/route.ts v.1.2
// API Route per creare o aggiornare le preferenze e impostare il flag di onboarding su Clerk.
import { NextRequest, NextResponse } from "next/server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import { db } from "@/lib/db";
import {
  UserPreferencesPayload,
  userPreferencesSchema,
} from "@/lib/validators/preferences";

export async function PUT(req: NextRequest) {
  try {
    // 2. Protezione della rotta
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3. Parsing e validazione del corpo della richiesta
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
    const transaction = db.transaction(() => {
      let userPrefStmt = db.prepare(
        "SELECT id FROM user_preferences WHERE user_id = ?"
      );
      let existingPref = userPrefStmt.get(userId) as { id: number } | undefined;
      let userPreferenceId: number;

      if (existingPref) {
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

      const deleteStmt = db.prepare(
        "DELETE FROM user_preferences_allergens WHERE user_preference_id = ?"
      );
      deleteStmt.run(userPreferenceId);

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

    // 5. NUOVO BLOCCO: Aggiornamento Metadati Clerk (CORRETTO)
    // Prima si 'attende' il client, poi si usa il metodo updateUser.
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });

    // 6. Risposta di successo
    return new NextResponse("Preferences updated and onboarding complete", {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse(
        JSON.stringify({ message: "Validation Error", errors: error.errors }),
        { status: 400 }
      );
    }

    console.error("Errore durante l'aggiornamento delle preferenze:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
