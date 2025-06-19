"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth, // Importa useAuth
} from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();
  const { sessionClaims } = useAuth(); // Ottieni i sessionClaims

  // Determina se l'utente è admin
  const isAdmin = sessionClaims?.metadata?.role === "admin";

  // Close menu when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold">
            {/* Potresti voler mettere un logo SVG o un'immagine qui invece di testo */}
            <span className="text-xl">Meal Planner App</span>{" "}
            {/* Nome aggiornato */}
          </Link>
        </div>

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

            <Link
              href="/features"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>

            <SignedIn>
              {" "}
              {/* Mostra questi link solo se loggato */}
              <Link
                href="/user-dashboard" // Link alla dashboard utente
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Mia Dashboard
              </Link>
              <Link
                href="/auctions" // Link alle aste (da creare)
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Aste
              </Link>
              {isAdmin && ( // Mostra il link Dashboard/Admin solo se l'utente è admin
                <Link
                  href="/dashboard" // Questa è la dashboard admin protetta dal middleware
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

        {/* Mobile Navigation Toggle & UserButton (se loggato) */}
        <div className="flex items-center gap-2 md:hidden">
          {" "}
          {/* Ridotto gap per più spazio */}
          <ModeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          {/* Mostra il toggle del menu solo se ci sono link da mostrare (cioè utente loggato) o se vuoi mostrare il menu anche da sloggato */}
          <SignedIn>
            {" "}
            {/* O sposta fuori da SignedIn se vuoi il menu anche da sloggato per SignIn/Up */}
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
          </SignedIn>
          <SignedOut>
            {" "}
            {/* Pulsanti di login/signup per mobile se non loggato */}
            <SignInButton mode="modal" />
            {/* <SignUpButton mode="modal" /> Potrebbe essere ridondante se SignInButton porta a entrambe */}
          </SignedOut>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute w-full border-b bg-background px-6 py-4 shadow-md md:hidden">
          {" "}
          {/* Migliorato styling per il menu mobile */}
          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <SignedIn>
              {" "}
              {/* Mostra questi link solo se loggato */}
              <Link
                href="/user-dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Mia Dashboard
              </Link>
              <Link
                href="/auctions"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Aste
              </Link>
              {isAdmin && ( // Mostra il link Dashboard/Admin solo se l'utente è admin
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-red-500 transition-colors hover:text-red-700"
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
