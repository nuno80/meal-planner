// src/lib/db/seed.ts v.1.3 (Corretto)
// Script aggiornato per popolare utenti, allergeni e ricette con tipi corretti.
import Database from "better-sqlite3";
import path from "path";

// 1. Definiamo un tipo per la ricetta come letta dal DB di origine
// Questo risolve l'errore 'is of type unknown'.
type SourceRecipe = {
  id: number;
  Titolo: string;
  URL: string;
  Presentazione: string;
  Difficolta: string;
  Costo: string;
  Tempo_preparazione_totale: number;
  Energy_kcal: number;
  Protein_g: number;
  Total_Fat_g: number;
  Carbohydrate_g: number;
  Istruzioni: string;
  Immagine_URL: string;
  Ingredients_JSON: string;
  Tipologia_dieta: string;
  Tipologia_piatti: string;
};

console.log("🚀 Avvio dello script di seeding...");

const testUsers = [
  {
    id: "user_2ylVYTiV8ydKw8zF51TXNnjH81K",
    email: "test-meal-planner@test.com",
  },
];
const allergensToSeed = [
  { id: 1, name: "Glutine" },
  { id: 2, name: "Lattosio" },
  { id: 3, name: "Frutta a guscio" },
  { id: 4, name: "Soia" },
  { id: 5, name: "Arachidi" },
];

const dbDir = path.resolve(process.cwd(), "database");
const sourceDbPath = path.join(dbDir, "ricette.db");
const destDbPath = path.join(dbDir, "starter_default.db");

let destDB: Database.Database | null = null;

try {
  console.log(`Connessione al database di destinazione: ${destDbPath}`);
  destDB = new Database(destDbPath);

  const seedTransaction = destDB.transaction(() => {
    // UTENTI
    console.log("Pulizia e popolamento della tabella 'users'...");
    destDB!.exec("DELETE FROM users");
    const insertUserStmt = destDB!.prepare(
      "INSERT INTO users (id, email) VALUES (@id, @email)"
    );
    for (const user of testUsers) insertUserStmt.run(user);
    console.log(`Tabella 'users' popolata con ${testUsers.length} utente/i.`);

    // ALLERGENI
    console.log("Popolamento della tabella 'allergens'...");
    const insertAllergenStmt = destDB!.prepare(
      "INSERT OR IGNORE INTO allergens (id, name) VALUES (@id, @name)"
    );
    for (const allergen of allergensToSeed) insertAllergenStmt.run(allergen);
    console.log("Tabella 'allergens' popolata.");

    // RICETTE
    let sourceDB: Database.Database | null = null;
    try {
      console.log(
        `Connessione al database di origine delle ricette: ${sourceDbPath}`
      );
      sourceDB = new Database(sourceDbPath, { readonly: true });

      console.log("Lettura delle ricette...");
      const sourceRecipes = sourceDB
        .prepare("SELECT * FROM ricette")
        .all() as SourceRecipe[]; // Applichiamo il tipo qui
      console.log(
        `Trovate ${sourceRecipes.length} ricette. Inizio importazione...`
      );

      destDB!.exec("DELETE FROM recipes");
      const insertRecipeStmt = destDB!.prepare(`
          INSERT INTO recipes (id, title, url, description, difficulty, cost, total_time_minutes, calories, protein_g, fat_g, carbs_g, instructions, image_url, ingredients_json, dietary_category, meal_types)
          VALUES (@id, @title, @url, @description, @difficulty, @cost, @total_time_minutes, @calories, @protein_g, @fat_g, @carbs_g, @instructions, @image_url, @ingredients_json, @dietary_category, @meal_types)
        `);

      for (const recipe of sourceRecipes) {
        let dietaryCategory = "NONE";
        if (recipe.Tipologia_dieta.toLowerCase().includes("vegetari"))
          dietaryCategory = "VEGETARIAN";
        if (recipe.Tipologia_dieta.toLowerCase().includes("vegan"))
          dietaryCategory = "VEGAN";

        let mealTypes = '["LUNCH", "DINNER"]';
        if (recipe.Tipologia_piatti?.toLowerCase().includes("colazione"))
          mealTypes = '["BREAKFAST"]';

        insertRecipeStmt.run({
          id: recipe.id,
          title: recipe.Titolo,
          url: recipe.URL,
          description: recipe.Presentazione,
          difficulty: recipe.Difficolta.toUpperCase(),
          cost: recipe.Costo,
          total_time_minutes: recipe.Tempo_preparazione_totale,
          calories: recipe.Energy_kcal,
          protein_g: recipe.Protein_g,
          fat_g: recipe.Total_Fat_g,
          carbs_g: recipe.Carbohydrate_g,
          instructions: recipe.Istruzioni,
          image_url: recipe.Immagine_URL,
          ingredients_json: recipe.Ingredients_JSON,
          dietary_category: dietaryCategory,
          meal_types: mealTypes,
        });
      }
      console.log("Importazione ricette completata.");
    } finally {
      if (sourceDB) sourceDB.close();
    }
  });

  seedTransaction();

  console.log("✅ Seeding completato con successo!");
} catch (error) {
  console.error("❌ Errore durante il processo di seeding:", error);
} finally {
  // 2. Aggiungiamo un controllo per risolvere l'errore 'is possibly null'
  if (destDB) {
    destDB.close();
    console.log("Connessione al database di destinazione chiusa.");
  }
}
