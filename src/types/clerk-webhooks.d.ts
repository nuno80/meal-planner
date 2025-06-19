// src/types/clerk-webhooks.d.ts v.1.0
// Definizioni di tipo per i payload dei webhook di Clerk.
// Ci concentriamo solo sui dati di cui abbiamo bisogno per l'evento 'user.created'.

// 1. Struttura del dato principale dell'evento
// Contiene l'ID dell'utente e gli indirizzi email associati.
interface UserData {
  id: string;
  email_addresses: Array<{
    id: string;
    email_address: string;
  }>;
  // Aggiungere qui altri campi se necessari in futuro (es. first_name, last_name)
}

// 2. Struttura dell'evento webhook
// Questo è l'oggetto principale inviato da Clerk.
export interface ClerkWebhookEvent {
  // Il tipo di evento, es. "user.created", "user.updated"
  type: "user.created" | "user.updated" | "user.deleted";
  // L'oggetto che contiene i dati specifici dell'evento
  data: UserData;
  object: "event";
}
