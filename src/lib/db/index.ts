// src/lib/db/index.ts
import Database, { type Database as DBType } from "better-sqlite3";
import fs from "fs";
import path from "path";

// Dichiarazione per estendere l'oggetto globale in ambiente di sviluppo
// per mantenere una singola istanza di connessione attraverso Hot Module Replacement (HMR).
declare global {
  // eslint-disable-next-line no-var
  var __db_connection: DBType | undefined;
}

const projectRoot = process.cwd();
const dbDir = path.join(projectRoot, "database");
const dbFileName = "starter_default.db"; // Nome del file database di default
const dbPath = path.join(dbDir, dbFileName);

/**
 * Inizializza e restituisce una connessione al database SQLite.
 * Crea la directory del database se non esiste.
 * Crea il file del database se non esiste.
 * Abilita la modalità WAL per performance migliori.
 */
function initializeDatabaseConnection(): DBType {
  console.log(
    "[DB Connection] Attempting to initialize database connection..."
  );

  // Assicura che la directory del database esista
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`[DB Connection] Created database directory: ${dbDir}`);
    } catch (error) {
      console.error(
        `[DB Connection] CRITICAL: Failed to create database directory ${dbDir}:`,
        error
      );
      // Se non possiamo creare la directory, è un errore fatale per il DB.
      throw new Error(`Failed to create database directory: ${error}`);
    }
  }

  let instance: DBType;
  try {
    // better-sqlite3 crea il file del database se non esiste al momento della connessione.
    instance = new Database(dbPath, { timeout: 10000 }); // Timeout di 10s per operazioni lockate
    instance.pragma("journal_mode = WAL"); // Abilita Write-Ahead Logging
    console.log(
      `[DB Connection] Connection to database at "${dbPath}" established. WAL mode enabled.`
    );
  } catch (error) {
    console.error(
      `[DB Connection] CRITICAL: Failed to connect to SQLite database at "${dbPath}":`,
      error
    );
    throw new Error(
      `Failed to initialize SQLite database connection: ${error}`
    );
  }
  return instance;
}

let db: DBType;

// Gestione Singleton della connessione DB
if (process.env.NODE_ENV === "production") {
  // In produzione, crea una singola istanza.
  db = initializeDatabaseConnection();
} else {
  // In sviluppo, riusa l'istanza globale per evitare problemi con HMR
  // che potrebbe rieseguire questo modulo e creare multiple connessioni.
  if (!global.__db_connection) {
    console.log(
      "[DB Connection] Development: Creating new singleton DB connection."
    );
    global.__db_connection = initializeDatabaseConnection();
  } else {
    console.log(
      "[DB Connection] Development: Reusing existing singleton DB connection."
    );
  }
  db = global.__db_connection;
}

/**
 * Chiude la connessione al database, se aperta.
 * Gestisce la chiusura sia per l'ambiente di sviluppo che di produzione.
 */
export const closeDbConnection = () => {
  let closed = false;
  if (global.__db_connection && global.__db_connection.open) {
    console.log("[DB Connection] Closing DEV singleton database connection.");
    global.__db_connection.close();
    global.__db_connection = undefined; // Rimuovi dalla cache globale per permettere una nuova inizializzazione
    closed = true;
  } else if (db && db.open && process.env.NODE_ENV === "production") {
    // Questa condizione potrebbe non essere mai raggiunta se db è sempre global.__db_connection in dev
    // e db è l'istanza diretta in prod. La logica singleton dovrebbe essere più pulita.
    // Per ora, manteniamo la possibilità di chiudere l'istanza 'db' se è quella di produzione.
    console.log("[DB Connection] Closing PROD database connection.");
    db.close(); // 'db' qui sarebbe l'istanza di produzione
    closed = true;
  }

  if (closed) {
    console.log("[DB Connection] Database connection closed.");
  } else {
    // console.log('[DB Connection] closeDbConnection called, but no active connection was found or it was already closed.');
  }
};

// Esporta l'istanza del database (singleton)
export { db };
