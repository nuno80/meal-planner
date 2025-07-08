// src/i18n.ts v.1.0
// File di configurazione per next-intl.
import { notFound } from "next/navigation";

import { getRequestConfig } from "next-intl/server";

// 1. Definizione delle lingue supportate
// L'array 'locales' elenca tutti i prefissi di lingua che l'app supporterà.
export const locales = ["it", "en"];
export const defaultLocale = "it";

// 2. Configurazione della richiesta
// Questa funzione viene eseguita per ogni richiesta sul server.
// Carica dinamicamente il file JSON delle traduzioni corretto in base alla lingua (locale) rilevata nell'URL.
export default getRequestConfig(async ({ locale }) => {
  // Valida che la 'locale' richiesta sia una di quelle supportate.
  // Se un utente prova ad accedere a un URL come /fr/pagina, verrà reindirizzato alla pagina 404.
  if (!locales.includes(locale as any)) notFound();

  return {
    // Carica il file delle traduzioni corrispondente.
    // L'estensione .json è importante.
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
