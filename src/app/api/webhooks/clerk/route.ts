// src/app/api/webhooks/clerk/route.ts v.1.2
// Route Handler per gestire i webhook inviati da Clerk.
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { Webhook } from "svix";

// 1. MODIFICA: Importazione nominata invece di default
import { db } from "@/lib/db";
import { ClerkWebhookEvent } from "@/types/clerk-webhooks";

// 2. Funzione handler per le richieste POST
export async function POST(req: NextRequest) {
  // 3. Ottenere il secret del webhook dalle variabili d'ambiente
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error(
      "Errore: CLERK_WEBHOOK_SECRET non è definito nelle variabili d'ambiente."
    );
    return new NextResponse(
      "Internal Server Error: Webhook secret not configured",
      { status: 500 }
    );
  }

  // 4. Estrarre gli header necessari per la verifica
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // 5. Verificare l'autenticità del webhook
  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: ClerkWebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Errore durante la verifica del webhook:", err);
    return new NextResponse("Error occured", {
      status: 400,
    });
  }

  // 6. Gestire l'evento 'user.created'
  const eventType = evt.type;
  if (eventType === "user.created") {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;

    if (!id || !primaryEmail) {
      console.error('Webhook "user.created" ricevuto ma mancano ID o email.');
      return new NextResponse("Bad Request: Missing user ID or email", {
        status: 400,
      });
    }

    console.log(
      `Webhook 'user.created' ricevuto per utente ${id} con email ${primaryEmail}`
    );

    // 7. Eseguire l'inserimento nel database
    try {
      const stmt = db.prepare("INSERT INTO users (id, email) VALUES (?, ?)");
      stmt.run(id, primaryEmail);
      console.log(`Utente ${id} inserito correttamente nel database.`);
    } catch (dbError) {
      console.error(
        `Errore durante l'inserimento dell'utente ${id} nel database:`,
        dbError
      );
    }
  }

  // 8. Rispondere a Clerk con successo
  return new NextResponse("Webhook processed successfully", { status: 200 });
}
