// src/app/api/recipes/[recipeId]/route.ts v.1.0
// API Route per cancellare una ricetta (solo admin).
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

// Funzione DELETE, protetta da ruolo admin
export async function DELETE(
  req: NextRequest, // non usato ma richiesto
  { params }: { params: { recipeId: string } }
) {
  try {
    // 1. Autenticazione e controllo del ruolo
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin = sessionClaims?.metadata?.role === "admin";
    if (!isAdmin) {
      return new NextResponse("Forbidden: Admin role required", {
        status: 403,
      });
    }

    // 2. Validazione dell'ID della ricetta
    const recipeId = parseInt(params.recipeId, 10);
    if (isNaN(recipeId)) {
      return new NextResponse("Invalid recipe ID", { status: 400 });
    }

    // 3. Eseguiamo la cancellazione dal database
    // Usiamo una transazione per cancellare prima i preferiti associati, poi la ricetta
    const transaction = db.transaction(() => {
      // Cancella i record dalla tabella dei preferiti (per evitare errori di foreign key)
      db.prepare("DELETE FROM user_favorite_recipes WHERE recipe_id = ?").run(
        recipeId
      );
      // Cancella i record dai piani pasto (per evitare errori di foreign key)
      db.prepare("DELETE FROM meal_plan_meals WHERE recipe_id = ?").run(
        recipeId
      );
      // Infine, cancella la ricetta
      const result = db
        .prepare("DELETE FROM recipes WHERE id = ?")
        .run(recipeId);

      if (result.changes === 0) {
        // Se non è stata cancellata nessuna riga, la ricetta non esisteva
        throw new Error("Recipe not found");
      }
    });

    transaction();

    console.log(
      `[API DELETE] Admin ${userId} ha cancellato la ricetta ${recipeId}`
    );

    // 4. Restituiamo una risposta di successo
    return new NextResponse(null, { status: 204 }); // 204 No Content è standard per DELETE riuscite
  } catch (error) {
    if (error instanceof Error && error.message === "Recipe not found") {
      return new NextResponse(error.message, { status: 404 });
    }
    console.error("[API DELETE Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
