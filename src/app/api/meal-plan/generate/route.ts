// src/app/api/meal-plan/generate/route.ts v.1.5 (Debug Version)
// Versione di debug per analizzare la richiesta in arrivo.
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { ZodError } from "zod";

import { db } from "@/lib/db";
import {
  UserPreferencesForGenerator,
  generateMealPlan,
} from "@/lib/meal-plan-generator";
import { userPreferencesSchema } from "@/lib/validators/preferences";

// Usiamo la tua funzione di debug
export async function POST(req: NextRequest) {
  try {
    console.log("[API Generate] Richiesta ricevuta");

    // Autenticazione
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.log(`[API Generate] Utente autenticato: ${userId}`);

    // Verifica del Content-Type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error(
        "[API Generate Error] Content-Type non valido:",
        contentType
      );
      return NextResponse.json(
        { message: "Content-Type deve essere application/json" },
        { status: 415 } // Unsupported Media Type
      );
    }

    // Leggi il body come testo prima di parsare
    const bodyText = await req.text();
    console.log("[API Generate] Body text length:", bodyText.length);

    if (!bodyText || bodyText.trim() === "") {
      console.error("[API Generate Error] Body vuoto");
      return NextResponse.json(
        { message: "Body della richiesta vuoto" },
        { status: 400 }
      );
    }
    console.log(
      "[API Generate] Body text ricevuto:",
      bodyText.substring(0, 500)
    );

    // Prova a parsare il JSON
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("[API Generate Error] JSON Parse Error:", parseError);
      return NextResponse.json(
        { message: "JSON malformato nel body della richiesta" },
        { status: 400 }
      );
    }

    // Validazione con schema Zod
    const preferencesForGenerator = userPreferencesSchema.parse(
      body
    ) as UserPreferencesForGenerator;
    console.log("[API Generate] Validazione schema completata");

    // Se arriviamo qui, l'input è valido. Ora generiamo il piano.
    console.log("[API Generate] Iniziando generazione piano...");
    const generatedPlan = generateMealPlan(preferencesForGenerator);

    // Salviamo il piano nel DB
    const savedPlanId = savePlanToDb(
      userId,
      generatedPlan,
      preferencesForGenerator
    );
    console.log(
      `[API Generate] Piano salvato con successo nel DB con ID: ${savedPlanId}`
    );

    const responsePayload = {
      ...generatedPlan,
      databaseId: savedPlanId,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Dati di input non validi", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("[API Generate Error] Errore generale:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Errore interno del server.";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

// Funzione helper per salvare il piano (invariata)
function savePlanToDb(
  userId: string,
  plan: any,
  prefs: UserPreferencesForGenerator
): number {
  const transaction = db.transaction(() => {
    const totalCalories = plan.days.reduce(
      (sum: number, day: any) => sum + day.totalCalories,
      0
    );
    const averageCalories = totalCalories / plan.days.length;
    const planInsertStmt = db.prepare(
      `INSERT INTO meal_plans (user_id, total_calories_avg, dietary_preference_snapshot, difficulty_level_snapshot) VALUES (?, ?, ?, ?)`
    );
    const planResult = planInsertStmt.run(
      userId,
      averageCalories,
      prefs.dietaryPreference,
      prefs.difficultyLevel
    );
    const mealPlanId = Number(planResult.lastInsertRowid);
    const dayInsertStmt = db.prepare(
      "INSERT INTO meal_plan_days (meal_plan_id, day_of_week) VALUES (?, ?)"
    );
    const mealInsertStmt = db.prepare(
      "INSERT INTO meal_plan_meals (meal_plan_day_id, meal_type, recipe_id) VALUES (?, ?, ?)"
    );
    for (const day of plan.days) {
      const dayResult = dayInsertStmt.run(mealPlanId, day.dayOfWeek);
      const mealPlanDayId = Number(dayResult.lastInsertRowid);
      for (const meal of day.meals) {
        mealInsertStmt.run(mealPlanDayId, meal.mealType, meal.recipe.id);
      }
    }
    return mealPlanId;
  });
  return transaction();
}
