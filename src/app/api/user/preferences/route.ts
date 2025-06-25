// src/app/api/user/preferences/route.ts v.2.2 (Semplificato)
// API Route aggiornata senza la logica degli allergeni.
import { NextRequest, NextResponse } from "next/server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import { db } from "@/lib/db";
import { userPreferencesSchema } from "@/lib/validators/preferences";

type UserPreferencesFromDB = {
  id: number;
  user_id: string;
  calorie_target: number;
  distribution: string;
  dietary_preference: "NONE" | "VEGETARIAN" | "VEGAN" | "PESCATARIAN";
  difficulty_level: "ANY" | "EASY" | "MEDIUM" | "HARD";
  disliked_ingredients: string;
  created_at: string;
  updated_at: string;
};

// Funzione GET aggiornata senza allergeni
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userPrefStmt = db.prepare(
      "SELECT * FROM user_preferences WHERE user_id = ?"
    );
    const preferences = userPrefStmt.get(userId) as
      | UserPreferencesFromDB
      | undefined;

    if (!preferences) {
      return new NextResponse("Preferences not found", { status: 404 });
    }

    const responsePayload = {
      calorieTarget: preferences.calorie_target,
      distribution: JSON.parse(preferences.distribution),
      dietaryPreference: preferences.dietary_preference,
      difficultyLevel: preferences.difficulty_level,
      // MODIFICA: Rimosso 'allergenIds'
      dislikedIngredients: JSON.parse(preferences.disliked_ingredients),
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("Errore durante il recupero delle preferenze:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Funzione PUT aggiornata senza allergeni
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = userPreferencesSchema.parse(body);
    // MODIFICA: Rimosso 'allergenIds' dalla destrutturazione
    const {
      calorieTarget,
      distribution,
      dietaryPreference,
      difficultyLevel,
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

      // MODIFICA: Rimossa tutta la logica di cancellazione e inserimento per 'user_preferences_allergens'
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
