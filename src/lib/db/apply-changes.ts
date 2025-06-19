// src/db/apply_changes.ts
import fs from "fs";
import path from "path";

import { closeDbConnection, db } from "@/lib/db";

import { createBackup } from "./backup-utils";

// Per il backup automatico

const changesSQLPath = path.join(
  process.cwd(),
  "database",
  "adhoc_changes.sql"
);

async function applyAdHocChanges() {
  console.log(
    `[Apply Changes Script] Attempting to apply ad-hoc SQL changes from: ${changesSQLPath}`
  );

  // 1. Esegui il backup prima di qualsiasi modifica
  try {
    const backupPath = await createBackup("pre-apply-adhoc-changes");
    if (!backupPath) {
      // Questo potrebbe succedere se il DB non esiste ancora.
      // In tal caso, l'utente dovrebbe probabilmente eseguire db:migrate prima.
      console.warn(
        "[Apply Changes Script] Backup not created (database file might not exist). Proceeding with caution."
      );
    }
  } catch (backupError) {
    console.error(
      "[Apply Changes Script] Failed to create backup before applying changes. Aborting.",
      backupError
    );
    process.exit(1);
  }

  // 2. Controlla se il file di modifiche esiste e non è vuoto
  if (!fs.existsSync(changesSQLPath)) {
    console.error(
      `[Apply Changes Script] Error: Ad-hoc changes file not found at ${changesSQLPath}. Nothing to apply.`
    );
    process.exit(1);
  }

  let sqlToExecute = "";
  try {
    sqlToExecute = fs.readFileSync(changesSQLPath, "utf8");
    if (
      sqlToExecute.trim() === "" ||
      sqlToExecute.trim().startsWith("-- Incolla qui")
    ) {
      console.log(
        "[Apply Changes Script] adhoc_changes.sql is empty or contains only placeholder comments. No changes applied."
      );
      // Chiudi la connessione se è stata aperta solo per questo script
      if (db && db.open) closeDbConnection();
      return; // Esce se non ci sono query da eseguire
    }
  } catch (readError) {
    console.error(
      // prettier-ignore
      "[Apply Changes Script] Error reading adhoc_changes.sql:",
      readError
    );
    process.exit(1);
  }

  // 3. Applica le modifiche SQL
  console.log("[Apply Changes Script] Executing SQL from adhoc_changes.sql...");
  try {
    // Esegui le query in una transazione per assicurare atomicità
    db.transaction(() => {
      db.exec(sqlToExecute);
    })(); // Chiamata immediata della funzione transazionale
    console.log(
      "[Apply Changes Script] Ad-hoc changes from adhoc_changes.sql applied successfully."
    );
    console.warn(
      "[Apply Changes Script] IMPORTANT: If you made structural changes (like ALTER TABLE), please ensure your main `database/schema.sql` is updated to reflect the new desired state for future initializations."
    );
    console.warn(
      "[Apply Changes Script] Consider clearing or commenting out an_changes.sql after successful execution."
    );
  } catch (error) {
    console.error(
      "[Apply Changes Script] Error applying SQL from adhoc_changes.sql:",
      error
    );
    console.error(
      "[Apply Changes Script] Changes were rolled back if a transaction was active."
    );
    process.exit(1);
  } finally {
    if (db && db.open) {
      console.log("[Apply Changes Script] Closing database connection.");
      closeDbConnection();
    }
  }
}

applyAdHocChanges().catch((e) => {
  console.error("[Apply Changes Script] Unhandled error:", e);
  process.exit(1);
});
