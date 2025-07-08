// src/components/navbar.tsx v.1.5
// Navbar aggiornata con selettore di lingua e link localizzati.

"use client";

// 1. Import aggiornati
// <-- USARE 'next-intl/link' per il routing localizzato
import { useEffect, useState } from "react";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

import LanguageSwitcher from "./layout/LanguageSwitcher";

// src/components/navbar.tsx v.1.5
// Navbar aggiornata con selettore di lingua e link localizzati.

// <-- IMPORTA IL NUOVO COMPONENTE

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMobile();
  const { sessionClaims } = useAuth();
  const isAdmin = sessionClaims?.metadata?.role === "admin";
  const t = useTranslations("Navigation"); // <-- Inizializza le traduzioni

  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (!isMobile) setIsMenuOpen(false);
  }, [isMobile]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (!isMounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-6 md:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-xl">Vibe Planner</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <div className="flex items-center gap-4">
            <SignedIn>
              <Link
                href="/user-dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t("mealPlan")}
              </Link>
              <Link
                href="/recipes"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t("recipes")}
              </Link>
              <Link
                href="/shopping-list"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {t("shoppingList")}
              </Link>
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-red-500 transition-colors hover:text-red-700"
                >
                  Admin Panel
                </Link>
              )}
            </SignedIn>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <LanguageSwitcher /> {/* <-- AGGIUNTO QUI */}
            <SignedOut>
              <SignInButton mode="modal" />
              <SignUpButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <LanguageSwitcher /> {/* <-- AGGIUNTO ANCHE QUI */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute w-full border-b bg-background px-6 py-4 shadow-md md:hidden">
          <div className="flex flex-col space-y-4">
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <Link
                href="/user-dashboard"
                className="text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("mealPlan")}
              </Link>
              <Link
                href="/recipes"
                className="text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("recipes")}
              </Link>
              <Link
                href="/shopping-list"
                className="text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("shoppingList")}
              </Link>
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-red-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
