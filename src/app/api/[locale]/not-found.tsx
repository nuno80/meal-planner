// src/app/[locale]/not-found.tsx v.1.2
// Correzione del tipo per il componente Link.
import { Route } from "next";
import Link from "next/link";

// <-- AGGIUNGI QUESTO IMPORT
import { useTranslations } from "next-intl";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");

  return (
    <div className="text-center">
      <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
      <p className="mb-6">{t("description")}</p>
      {/* CORREZIONE: Aggiungi 'as Route' */}
      <Link href={"/" as Route} className="text-blue-500 hover:underline">
        {t("returnHome")}
      </Link>
    </div>
  );
}
