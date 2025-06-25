// src/components/features/recipes/RecipeCard.tsx v.1.2
// Aggiunta la funzionalità di cancellazione per admin.

"use client";

// 1. Aggiunta icona Trash2
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@clerk/nextjs";
import { ChefHat, Flame, Heart, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// src/components/features/recipes/RecipeCard.tsx v.1.2
// Aggiunta la funzionalità di cancellazione per admin.

interface RecipeCardProps {
  id: number;
  title: string;
  imageUrl: string | null;
  difficulty: string;
  calories: number;
  isInitiallyFavorite: boolean;
  isAdmin: boolean; // 2. Aggiunta nuova prop
}

export function RecipeCard({
  id,
  title,
  imageUrl,
  difficulty,
  calories,
  isInitiallyFavorite,
  isAdmin,
}: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(isInitiallyFavorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false); // Stato per "nascondere" la card
  const { isSignedIn } = useAuth();
  const { toast } = useToast();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      toast({
        title: "Accesso Richiesto",
        description: "Devi fare login per salvare i preferiti.",
        variant: "destructive",
      });
      return;
    }
    setIsTogglingFavorite(true);
    setIsFavorite((current) => !current);
    try {
      const response = await fetch(`/api/recipes/${id}/favorite`, {
        method: "POST",
      });
      if (!response.ok) {
        setIsFavorite((current) => !current);
        toast({
          title: "Errore",
          description: "Impossibile aggiornare i preferiti.",
          variant: "destructive",
        });
      } else {
        const result = await response.json();
        toast({
          description:
            result.status === "added"
              ? "Aggiunto ai preferiti!"
              : "Rimosso dai preferiti.",
        });
      }
    } catch (error) {
      setIsFavorite((current) => !current);
      toast({
        title: "Errore di Rete",
        description: "Controlla la tua connessione.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // 3. NUOVA FUNZIONE per gestire la cancellazione
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !confirm(
        `Sei sicuro di voler cancellare la ricetta "${title}"? L'azione è irreversibile.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Impossibile cancellare la ricetta.");
      }
      toast({
        title: "Successo",
        description: `Ricetta "${title}" cancellata.`,
      });
      // Nascondiamo la card dall'interfaccia
      setIsDeleted(true);
    } catch (error) {
      toast({
        title: "Errore",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyBadgeVariant = (level: string) => {
    switch (level.toUpperCase()) {
      case "FACILE":
        return "default";
      case "MEDIO":
        return "secondary";
      case "DIFFICILE":
        "destructive";
      default:
        return "outline";
    }
  };

  // 4. Se la card è stata cancellata, non renderizziamo nulla
  if (isDeleted) {
    return null;
  }

  return (
    <Card className="bg-base-surface border-border-default hover:border-brand-accent group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        {/* Pulsante Preferiti */}
        {isSignedIn && (
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/75 disabled:cursor-not-allowed"
            aria-label="Aggiungi ai preferiti"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </button>
        )}
        {/* 5. Pulsante Cancella (visibile solo per admin) */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-full bg-red-900/80 p-2 text-white backdrop-blur-sm transition-colors hover:bg-red-700/80 disabled:cursor-not-allowed"
            aria-label="Cancella ricetta"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <Link href={`/recipes/${id}`} className="block">
        {/* ... resto del JSX invariato ... */}
        <CardHeader className="p-0">
          <div className="relative aspect-video w-full">
            <Image
              src={imageUrl || "/images/placeholder-recipe.jpg"}
              alt={`Immagine di ${title}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3
            className="text-text-primary line-clamp-2 text-lg font-semibold"
            title={title}
          >
            {title}
          </h3>
          <div className="text-text-secondary mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              <Badge variant={getDifficultyBadgeVariant(difficulty)}>
                {difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              <span>{calories} kcal</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
