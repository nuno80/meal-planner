// src/app/api/meal-plan/generate/route.ts v.1.0
// API Route per generare un nuovo piano alimentare.
import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import {
  UserPreferencesForGenerator,
  generateMealPlan,
} from "@/lib/meal-plan-generator";

// Definiamo il tipo per le preferenze lette dal DB (lo stesso di preferences/route.ts)
type UserPreferencesFromDB = {
  id: number;
  user_id: string;
  calorie_target: number;
  distribution: string;
  dietary_preference: "NONE" | "VEGETARIAN" | "VEGAN" | "PESCATARIAN";
  difficulty_level: "ANY" | "EASY" | "MEDIUM" | "HARD";
};

export async function POST() {
  try {
    // 1. Autenticazione: assicuriamoci che l'utente sia loggato
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Recupero delle preferenze dell'utente dal nostro database
    const userPrefStmt = db.prepare(
      "SELECT * FROM user_preferences WHERE user_id = ?"
    );
    const preferencesFromDb = userPrefStmt.get(userId) as
      | UserPreferencesFromDB
      | undefined;

    if (!preferencesFromDb) {
      // Se l'utente non ha salvato le preferenze, non possiamo generare un piano.
      return new NextResponse(
        "User preferences not set. Please set them first.",
        { status: 400 }
      );
    }

    // 3. Mappiamo i dati dal DB al formato atteso dal generatore
    const preferencesForGenerator: UserPreferencesForGenerator = {
      calorieTarget: preferencesFromDb.calorie_target,
      distribution: JSON.parse(preferencesFromDb.distribution),
      dietaryPreference: preferencesFromDb.dietary_preference,
      difficultyLevel: preferencesFromDb.difficulty_level,
    };

    // 4. Chiamiamo il servizio di generazione del piano
    const generatedPlan = generateMealPlan(preferencesForGenerator);

    // 5. (Futuro) Qui potremmo salvare il piano generato nel database (tabelle meal_plans, etc.)
    // Per ora, lo restituiamo direttamente al client.

    // 6. Restituiamo il piano generato come risposta JSON
    return NextResponse.json(generatedPlan, { status: 201 }); // 201 Created
  } catch (error) {
    // 7. Gestione degli errori, inclusi quelli lanciati dal generatore
    console.error("[API Generate Error]", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    // Se l'errore è "Impossibile trovare ricetta...", lo passiamo al client.
    return new NextResponse(JSON.stringify({ message: errorMessage }), {
      status: 500,
    });
  }
}
