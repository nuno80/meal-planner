// src/app/api/meal-plan/meal/[mealId]/route.ts v.1.0
// API Route per modificare una singola ricetta in un piano esistente.
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "@/lib/db";

// 1. Schema di validazione per i dati in ingresso
const swapMealSchema = z.object({
  newRecipeId: z.number().int().positive(),
});

// 2. La funzione PATCH riceve `params` dalla rotta dinamica
export async function PATCH(
  req: NextRequest,
  { params }: { params: { mealId: string } }
) {
  try {
    // 3. Autenticazione e validazione dell'input
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const mealIdToSwap = parseInt(params.mealId, 10);
    if (isNaN(mealIdToSwap)) {
      return new NextResponse("Invalid meal ID", { status: 400 });
    }

    const body = await req.json();
    const { newRecipeId } = swapMealSchema.parse(body);

    // 4. Verifica di Sicurezza e Appartenenza
    // Questa query complessa verifica che il mealId appartenga a un piano dell'utente corrente.
    const stmt = db.prepare(`
      SELECT m.id
      FROM meal_plan_meals as m
      JOIN meal_plan_days as d ON m.meal_plan_day_id = d.id
      JOIN meal_plans as p ON d.meal_plan_id = p.id
      WHERE m.id = ? AND p.user_id = ?
    `);
    const mealOwnerCheck = stmt.get(mealIdToSwap, userId);

    if (!mealOwnerCheck) {
      // Se la query non restituisce nulla, l'utente non è il proprietario del pasto
      return new NextResponse("Forbidden: You do not own this meal plan.", {
        status: 403,
      });
    }

    // 5. Eseguiamo l'aggiornamento
    const updateStmt = db.prepare(
      "UPDATE meal_plan_meals SET recipe_id = ? WHERE id = ?"
    );
    const result = updateStmt.run(newRecipeId, mealIdToSwap);

    if (result.changes === 0) {
      // Questo caso si verifica se, per qualche motivo, l'ID del pasto non viene trovato
      return new NextResponse("Meal not found or no changes made.", {
        status: 404,
      });
    }

    console.log(
      `[API Swap] Utente ${userId} ha sostituito il pasto ${mealIdToSwap} con la ricetta ${newRecipeId}`
    );

    // 6. Restituiamo una risposta di successo
    return new NextResponse("Meal swapped successfully", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid request data",
          errors: error.errors,
        }),
        { status: 400 }
      );
    }
    console.error("[API Swap Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
