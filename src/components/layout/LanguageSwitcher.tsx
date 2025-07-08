// src/components/layout/LanguageSwitcher.tsx v.1.2 (Fallback for older next-intl)
// Utilizza gli hook standard di Next.js per la compatibilità con versioni precedenti.

"use client";

// 1. Import da 'next/navigation' e 'next-intl'
import { usePathname, useRouter } from "next/navigation";

import { Languages } from "lucide-react";
import { Route } from 'next';
import { useLocale } from "next-intl";

// <-- FALLBACK: Usiamo gli hook standard

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales } from "@/i18n";

// src/components/layout/LanguageSwitcher.tsx v.1.2 (Fallback for older next-intl)
// Utilizza gli hook standard di Next.js per la compatibilità con versioni precedenti.

// src/components/layout/LanguageSwitcher.tsx v.1.2 (Fallback for older next-intl)
// Utilizza gli hook standard di Next.js per la compatibilità con versioni precedenti.

// src/components/layout/LanguageSwitcher.tsx v.1.2 (Fallback for older next-intl)
// Utilizza gli hook standard di Next.js per la compatibilità con versioni precedenti.

// 2. Componente LanguageSwitcher
export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname(); // Questo ora restituisce il percorso completo, es. /it/shopping-list
  const locale = useLocale(); // Questo restituisce la lingua corrente, es. 'it'

  // 3. Funzione per cambiare lingua (con logica manuale e tipo corretto)
  const switchLocale = (nextLocale: string) => {
    // Rimuoviamo il prefisso della lingua attuale dal percorso
    // es. /it/shopping-list -> /shopping-list
    const pathWithoutLocale = pathname.startsWith(`/${locale}`)
      ? pathname.substring(locale.length + 1)
      : pathname;

    // Costruiamo il nuovo percorso con la nuova lingua
    // es. /en + /shopping-list -> /en/shopping-list
    // Gestisce anche il caso della root (es. /it -> /en)
    const newPath = `/${nextLocale}${pathWithoutLocale || "/"}`;

    router.replace(newPath as Route);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Cambia lingua</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            disabled={locale === loc}
          >
            {loc.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
