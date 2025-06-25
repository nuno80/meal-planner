// src/app/api/recipes/[recipeId]/favorite/route.ts v.1.3 (Sintassi Alternativa)
// API Route per aggiungere/rimuovere una ricetta dai preferiti di un utente.
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";

// Usiamo la sintassi a freccia per la dichiarazione della funzione
export const POST = async (
  req: NextRequest,
  { params }: { params: { recipeId: string } }
) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const recipeId = parseInt(params.recipeId, 10);
    if (isNaN(recipeId)) {
      return new NextResponse("Invalid recipe ID", { status: 400 });
    }

    const checkStmt = db.prepare(
      "SELECT user_id FROM user_favorite_recipes WHERE user_id = ? AND recipe_id = ?"
    );
    const existingFavorite = checkStmt.get(userId, recipeId);

    if (existingFavorite) {
      const deleteStmt = db.prepare(
        "DELETE FROM user_favorite_recipes WHERE user_id = ? AND recipe_id = ?"
      );
      deleteStmt.run(userId, recipeId);
      console.log(
        `[API Favorite] Utente ${userId} ha rimosso la ricetta ${recipeId} dai preferiti.`
      );
      return NextResponse.json({ status: "removed" });
    } else {
      const insertStmt = db.prepare(
        "INSERT INTO user_favorite_recipes (user_id, recipe_id) VALUES (?, ?)"
      );
      insertStmt.run(userId, recipeId);
      console.log(
        `[API Favorite] Utente ${userId} ha aggiunto la ricetta ${recipeId} ai preferiti.`
      );
      return NextResponse.json({ status: "added" }, { status: 201 });
    }
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "SQLITE_CONSTRAINT_FOREIGNKEY"
    ) {
      return new NextResponse("Recipe not found", { status: 404 });
    }
    console.error("[API Favorite Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
