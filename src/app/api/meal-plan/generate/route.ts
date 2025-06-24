// src/app/api/meal-plan/generate/route.ts v.1.1
// API aggiornata per salvare permanentemente il piano generato nel database.
import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import {
  GeneratedMealPlan,
  UserPreferencesForGenerator,
  generateMealPlan,
} from "@/lib/meal-plan-generator";

type UserPreferencesFromDB = {
  id: number;
  calorie_target: number;
  distribution: string;
  dietary_preference: "NONE" | "VEGETARIAN" | "VEGAN" | "PESCATARIAN";
  difficulty_level: "ANY" | "EASY" | "MEDIUM" | "HARD";
};

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userPrefStmt = db.prepare(
      "SELECT * FROM user_preferences WHERE user_id = ?"
    );
    const preferencesFromDb = userPrefStmt.get(userId) as
      | UserPreferencesFromDB
      | undefined;

    if (!preferencesFromDb) {
      return new NextResponse("User preferences not set.", { status: 400 });
    }

    const preferencesForGenerator: UserPreferencesForGenerator = {
      calorieTarget: preferencesFromDb.calorie_target,
      distribution: JSON.parse(preferencesFromDb.distribution),
      dietaryPreference: preferencesFromDb.dietary_preference,
      difficultyLevel: preferencesFromDb.difficulty_level,
    };

    const generatedPlan = generateMealPlan(preferencesForGenerator);

    // --- NUOVO BLOCCO: Salvataggio del piano nel database ---
    const savedPlanId = savePlanToDb(
      userId,
      generatedPlan,
      preferencesForGenerator
    );
    console.log(
      `[API Generate] Piano salvato con successo nel DB con ID: ${savedPlanId}`
    );
    // --- FINE NUOVO BLOCCO ---

    // Aggiungiamo l'ID del piano salvato alla risposta
    const responsePayload = {
      ...generatedPlan,
      databaseId: savedPlanId,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error("[API Generate Error]", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return new NextResponse(JSON.stringify({ message: errorMessage }), {
      status: 500,
    });
  }
}

// --- NUOVA FUNZIONE HELPER: Logica di salvataggio del piano ---
function savePlanToDb(
  userId: string,
  plan: GeneratedMealPlan,
  prefs: UserPreferencesForGenerator
): number {
  const transaction = db.transaction(() => {
    // 1. Calcola le calorie medie del piano
    const totalCalories = plan.days.reduce(
      (sum, day) => sum + day.totalCalories,
      0
    );
    const averageCalories = totalCalories / plan.days.length;

    // 2. Inserisci il record principale del piano e ottieni l'ID
    const planInsertStmt = db.prepare(`
            INSERT INTO meal_plans (user_id, total_calories_avg, dietary_preference_snapshot, difficulty_level_snapshot)
            VALUES (?, ?, ?, ?)
        `);
    const planResult = planInsertStmt.run(
      userId,
      averageCalories,
      prefs.dietaryPreference,
      prefs.difficultyLevel
    );
    const mealPlanId = Number(planResult.lastInsertRowid);

    // 3. Prepara le istruzioni per inserire giorni e pasti
    const dayInsertStmt = db.prepare(
      "INSERT INTO meal_plan_days (meal_plan_id, day_of_week) VALUES (?, ?)"
    );
    const mealInsertStmt = db.prepare(
      "INSERT INTO meal_plan_meals (meal_plan_day_id, meal_type, recipe_id) VALUES (?, ?, ?)"
    );

    // 4. Itera su ogni giorno e pasto del piano generato
    for (const day of plan.days) {
      const dayResult = dayInsertStmt.run(mealPlanId, day.dayOfWeek);
      const mealPlanDayId = Number(dayResult.lastInsertRowid);

      for (const meal of day.meals) {
        mealInsertStmt.run(mealPlanDayId, meal.mealType, meal.recipe.id);
      }
    }

    return mealPlanId; // Restituisce l'ID del piano appena creato
  });

  return transaction();
}
