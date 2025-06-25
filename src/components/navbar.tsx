// src/components/navbar.tsx v.1.4 (Correzione Tipo Rotta)

"use client";

import type { Route } from "next";
// 1. Importiamo il tipo Route
import Link from "next/link";
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

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

// src/components/navbar.tsx v.1.4 (Correzione Tipo Rotta)

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMobile();
  const { sessionClaims } = useAuth();
  const isAdmin = sessionClaims?.metadata?.role === "admin";

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
            <ModeToggle />
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>

            <SignedIn>
              <Link
                href="/meal-plan/create"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Crea Piano
              </Link>
              <Link
                href="/user-dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Mio Piano
              </Link>
              <Link
                href="/recipes"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Ricette
              </Link>
              {/* 2. MODIFICA: Aggiungiamo il type casting */}
              <Link
                href={"/user-profile" as Route}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Profilo
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
            <Link
              href="/"
              className="text-sm font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <SignedOut>
              <SignInButton mode="modal" />
            </SignedOut>
            <SignedIn>
              <Link
                href="/meal-plan/create"
                className="text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Crea Piano
              </Link>
              <Link
                href="/user-dashboard"
                className="text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Mio Piano
              </Link>
              <Link
                href="/recipes"
                className="text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Ricette
              </Link>
              {/* 3. MODIFICA: Aggiungiamo il type casting anche qui */}
              <Link
                href={"/user-profile" as Route}
                className="text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Profilo
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
