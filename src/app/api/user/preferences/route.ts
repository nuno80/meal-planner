// src/app/api/user/preferences/route.ts v.2.1 (Tipi Corretti)
// API Route per leggere (GET) e creare/aggiornare (PUT) le preferenze utente.
import { NextRequest, NextResponse } from "next/server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import { db } from "@/lib/db";
import { userPreferencesSchema } from "@/lib/validators/preferences";

// 1. NUOVO TIPO: Definiamo la struttura dei dati come letti dal DB
type UserPreferencesFromDB = {
  id: number;
  user_id: string;
  calorie_target: number;
  distribution: string; // È una stringa JSON nel DB
  dietary_preference: "NONE" | "VEGETARIAN" | "VEGAN" | "PESCATARIAN";
  difficulty_level: "EASY" | "MEDIUM" | "HARD";
  disliked_ingredients: string; // È una stringa JSON nel DB
  created_at: string;
  updated_at: string;
};

// Funzione GET aggiornata con il tipo corretto
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userPrefStmt = db.prepare(
      "SELECT * FROM user_preferences WHERE user_id = ?"
    );
    // 2. MODIFICA: Applichiamo il nostro tipo al risultato della query
    const preferences = userPrefStmt.get(userId) as
      | UserPreferencesFromDB
      | undefined;

    if (!preferences) {
      return new NextResponse("Preferences not found", { status: 404 });
    }

    const allergensStmt = db.prepare(`
      SELECT allergen_id FROM user_preferences_allergens WHERE user_preference_id = ?
    `);
    const allergenLinks = allergensStmt.all(preferences.id) as {
      allergen_id: number;
    }[];
    const allergenIds = allergenLinks.map((link) => link.allergen_id);

    const responsePayload = {
      calorieTarget: preferences.calorie_target,
      distribution: JSON.parse(preferences.distribution),
      dietaryPreference: preferences.dietary_preference,
      difficultyLevel: preferences.difficulty_level,
      allergenIds: allergenIds,
      dislikedIngredients: JSON.parse(preferences.disliked_ingredients),
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("Errore durante il recupero delle preferenze:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Funzione PUT (invariata)
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = userPreferencesSchema.parse(body);
    const {
      calorieTarget,
      distribution,
      dietaryPreference,
      difficultyLevel,
      allergenIds,
      dislikedIngredients,
    } = validatedData;

    const transaction = db.transaction(() => {
      const primaryEmail =
        user.primaryEmailAddress?.emailAddress ?? "email-not-found@clerk.dev";
      db.prepare("INSERT OR IGNORE INTO users (id, email) VALUES (?, ?)").run(
        userId,
        primaryEmail
      );

      let userPref = db
        .prepare("SELECT id FROM user_preferences WHERE user_id = ?")
        .get(userId) as { id: number } | undefined;
      let userPreferenceId: number;

      if (userPref) {
        userPreferenceId = userPref.id;
        db.prepare(
          `UPDATE user_preferences SET calorie_target = ?, distribution = ?, dietary_preference = ?, difficulty_level = ?, disliked_ingredients = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).run(
          calorieTarget,
          JSON.stringify(distribution),
          dietaryPreference,
          difficultyLevel,
          JSON.stringify(dislikedIngredients),
          userPreferenceId
        );
      } else {
        const result = db
          .prepare(
            `INSERT INTO user_preferences (user_id, calorie_target, distribution, dietary_preference, difficulty_level, disliked_ingredients) VALUES (?, ?, ?, ?, ?, ?)`
          )
          .run(
            userId,
            calorieTarget,
            JSON.stringify(distribution),
            dietaryPreference,
            difficultyLevel,
            JSON.stringify(dislikedIngredients)
          );
        userPreferenceId = Number(result.lastInsertRowid);
      }

      db.prepare(
        "DELETE FROM user_preferences_allergens WHERE user_preference_id = ?"
      ).run(userPreferenceId);
      if (allergenIds.length > 0) {
        const insertAllergenStmt = db.prepare(
          "INSERT INTO user_preferences_allergens (user_preference_id, allergen_id) VALUES (?, ?)"
        );
        for (const allergenId of allergenIds)
          insertAllergenStmt.run(userPreferenceId, allergenId);
      }
    });
    transaction();

    return new NextResponse("Preferences saved successfully", { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse(
        JSON.stringify({ message: "Validation Error", errors: error.errors }),
        { status: 400 }
      );
    }
    console.error("[API] Errore generale nel blocco PUT:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
