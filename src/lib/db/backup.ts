// src/db/backup.ts
import { closeDbConnection, db } from "@/lib/db";

// Importa db per chiudere la connessione
import { createBackup } from "./backup-utils";

async function runManualBackup() {
  // È una buona pratica chiudere la connessione al DB prima di fare un backup del file,
  // specialmente se la modalità WAL è attiva, per assicurare la consistenza.
  if (db && db.open) {
    console.log(
      "[Manual Backup CLI] Closing database connection before backup..."
    );
    closeDbConnection();
    // Piccola pausa per assicurare che i file -wal e -shm siano finalizzati se possibile
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  try {
    const backupPath = await createBackup("manual_cli_invocation");
    if (backupPath) {
      console.log(
        `[Manual Backup CLI] Manual backup completed successfully: ${backupPath}`
      );
    } else {
      console.log(
        "[Manual Backup CLI] Backup not created (database file might not exist)."
      );
    }
  } catch (error) {
    console.error("[Manual Backup CLI] Manual backup process failed:", error);
    process.exit(1);
  }
  // Non è necessario riaprire la connessione qui, lo script termina.
}

runManualBackup();
