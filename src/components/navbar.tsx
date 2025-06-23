// src/components/navbar.tsx v.1.1

"use client";

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

// src/components/navbar.tsx v.1.1

export default function Navbar() {
  // MODIFICA: Aggiunto export default per coerenza
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();
  const { sessionClaims } = useAuth();
  const isAdmin = sessionClaims?.metadata?.role === "admin";

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
            <span className="text-xl">Vibe Planner</span>{" "}
            {/* Nome aggiornato */}
          </Link>
        </div>

        {/* 1. Desktop Navigation - AGGIORNATO */}
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
              <Link
                href="/user-dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Mio Piano
              </Link>
              {/* NUOVO LINK RECIPES */}
              <Link
                href="/recipes"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Ricette
              </Link>
              {/* LINK PROFILE CORRETTO */}
              <Link
                href="/profile"
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

        {/* Mobile Navigation Toggle (Logica invariata) */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedIn>
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
            <SignInButton mode="modal" />
          </SignedOut>
        </div>
      </div>

      {/* 2. Mobile Menu - AGGIORNATO */}
      {isMenuOpen && (
        <div className="absolute w-full border-b bg-background px-6 py-4 shadow-md md:hidden">
          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <SignedIn>
              <Link
                href="/user-dashboard"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Mio Piano
              </Link>
              {/* NUOVO LINK RECIPES */}
              <Link
                href="/recipes"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Ricette
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Profilo
              </Link>
              {isAdmin && (
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
