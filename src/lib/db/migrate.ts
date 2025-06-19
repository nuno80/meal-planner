// src/db/migrate.ts
// Assicurati che l'alias @ funzioni o usa '../lib/db'
import path from "path";

import { closeDbConnection, db } from "@/lib/db";

import { applySchemaToDb } from "./utils";

// Assicurati che il percorso a utils.ts sia corretto

async function runFullSchemaMigration() {
  const schemaPath = path.join(process.cwd(), "database", "schema.sql");
  console.log(
    "[Migrate Script] Running full schema application from database/schema.sql..."
  );

  try {
    if (!db || !db.open) {
      console.error(
        "[Migrate Script] Database connection not found or not open. This script relies on a connection being established by importing from @/lib/db. Exiting."
      );
      process.exit(1); // Esce se la connessione DB non è valida
    }

    applySchemaToDb(db, schemaPath);
    console.log(
      "[Migrate Script] Schema application script finished successfully."
    );
  } catch (e: unknown) {
    // Blocco catch inizia qui
    console.error(
      "[Migrate Script] Script failed:",
      e instanceof Error ? e.message : String(e)
    );
    // Se vuoi loggare lo stack trace per debug più approfondito:
    // if (e instanceof Error && e.stack) {
    //   console.error("[Migrate Script] Stack trace:", e.stack);
    // }
    process.exit(1); // Esci con codice di errore
  } finally {
    // Blocco finally inizia qui
    // Chiudi la connessione dopo l'esecuzione dello script, sia in caso di successo che di errore
    if (db && db.open) {
      console.log("[Migrate Script] Closing database connection.");
      closeDbConnection();
    }
    console.log("[Migrate Script] Script execution finished.");
  }
}

// Esegui la funzione principale
runFullSchemaMigration();
