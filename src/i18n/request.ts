// src/i18n/request.ts v.2.0 (Without i18n routing)
// Configura il caricamento dei messaggi per una lingua specifica.
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // In questo setup, dobbiamo determinare la lingua manualmente.
  // Per ora, la impostiamo staticamente a 'it'.
  // In futuro, potremmo leggerla da un cookie o dalle preferenze dell'utente.
  const locale = "it";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
