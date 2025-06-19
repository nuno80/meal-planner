// src/db/utils.ts
import type { Database } from "better-sqlite3";
import fs from "fs";

/**
 * Applica un file di schema SQL a un'istanza di database fornita.
 * @param dbInstance L'istanza di better-sqlite3 Database.
 * @param schemaFilePath Il percorso al file .sql dello schema.
 */
export function applySchemaToDb(
  dbInstance: Database,
  schemaFilePath: string
): void {
  console.log(
    `[Schema Apply Util] Attempting to apply schema from: ${schemaFilePath}`
  );
  if (!fs.existsSync(schemaFilePath)) {
    const errorMessage = `[Schema Apply Util] Error: Schema file not found at ${schemaFilePath}. Cannot apply schema.`;
    console.error(errorMessage);
    throw new Error(errorMessage); // Lancia un errore se lo schema non è trovato, è un problema serio.
  }

  try {
    const schemaSql = fs.readFileSync(schemaFilePath, "utf8");
    if (schemaSql.trim() === "") {
      console.warn(
        `[Schema Apply Util] Schema file (${schemaFilePath}) is empty. No schema applied.`
      );
      return; // Esce se lo schema è vuoto, ma non è un errore fatale.
    }

    console.log(`[Schema Apply Util] Executing SQL from ${schemaFilePath}...`);
    dbInstance.exec(schemaSql); // Esegue l'intero script SQL
    console.log("[Schema Apply Util] Schema SQL applied successfully.");
  } catch (error) {
    console.error(
      `[Schema Apply Util] Error applying schema SQL from ${schemaFilePath}:`,
      error
    );
    throw error; // Rilancia l'errore per essere gestito dal chiamante dello script di migrazione/reset
  }
}
