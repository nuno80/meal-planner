// src/components/features/recipes/RecipeCard.tsx v.1.0
// Componente per visualizzare una singola ricetta in una griglia/galleria.
import Image from "next/image";
import Link from "next/link";

import { ChefHat, Flame } from "lucide-react";

import { Badge } from "@/components/ui/badge";
// Useremo Badge per la difficoltà
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// 1. Definiamo i tipi per le props del componente, basati sul nostro DB
interface RecipeCardProps {
  id: number;
  title: string;
  imageUrl: string | null;
  difficulty: string;
  calories: number;
}

export function RecipeCard({
  id,
  title,
  imageUrl,
  difficulty,
  calories,
}: RecipeCardProps) {
  // 2. Logica per determinare il colore del badge in base alla difficoltà
  const getDifficultyBadgeVariant = (level: string) => {
    switch (level.toUpperCase()) {
      case "FACILE":
        return "default"; // Verde
      case "MEDIO":
        return "secondary"; // Giallo/Arancio
      case "DIFFICILE":
        return "destructive"; // Rosso
      default:
        return "outline";
    }
  };

  return (
    // 3. L'intera card è un link alla pagina di dettaglio della ricetta
    <Link href={`/recipes/${id}`} className="group block">
      <Card className="bg-base-surface border-border-default hover:border-brand-accent h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* 4. Immagine della ricetta */}
        <CardHeader className="p-0">
          <div className="relative aspect-video w-full">
            <Image
              src={imageUrl || "/images/placeholder-recipe.jpg"} // Usa un placeholder se l'URL non c'è
              alt={`Immagine di ${title}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardHeader>

        {/* 5. Contenuto testuale della card */}
        <CardContent className="p-4">
          <h3
            className="text-text-primary line-clamp-2 text-lg font-semibold"
            title={title}
          >
            {title}
          </h3>

          <div className="text-text-secondary mt-4 flex items-center justify-between text-sm">
            {/* Difficoltà con Badge */}
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              <Badge variant={getDifficultyBadgeVariant(difficulty)}>
                {difficulty}
              </Badge>
            </div>

            {/* Calorie */}
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              <span>{calories} kcal</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
