// src/lib/shopping-list-generator.ts v.1.0
// Servizio per aggregare ingredienti, scalare le porzioni e arrotondare le quantità.

// 1. Definizione dei Tipi
// Aggiungiamo 'servings' al tipo Recipe per il calcolo delle porzioni.
export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: number;
  name: string;
  ingredients: Ingredient[];
  servings: number; // Numero di porzioni per cui la ricetta è pensata
}

export interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
}

// 2. Funzione di Arrotondamento Intelligente
/**
 * Arrotonda le quantità per renderle pratiche per la spesa.
 * @param quantity La quantità calcolata.
 * @param unit L'unità di misura.
 * @returns La quantità arrotondata.
 */
function smartRound(quantity: number, unit: string): number {
  const lowerUnit = unit.toLowerCase().trim();

  // Non arrotondare unità discrete, ma arrotonda sempre per eccesso all'intero.
  const discreteUnits = [
    "uovo",
    "uova",
    "spicchio",
    "spicchi",
    "fetta",
    "fette",
    "pezzo",
    "pezzi",
  ];
  if (
    discreteUnits.includes(lowerUnit) ||
    lowerUnit.startsWith("qb") ||
    lowerUnit.startsWith("q.b")
  ) {
    return Math.ceil(quantity);
  }

  // Arrotonda quantità piccole (es. spezie) al grammo/ml intero superiore.
  if (quantity < 10) {
    return Math.ceil(quantity);
  }

  // Arrotonda quantità medie ai 5g/ml superiori per praticità.
  if (quantity <= 100) {
    return Math.ceil(quantity / 5) * 5;
  }

  // Oltre i 100g/ml, arrotonda ai 10g/ml superiori.
  return Math.ceil(quantity / 10) * 10;
}

// 3. Funzione Principale di Generazione Lista
/**
 * Genera una lista della spesa aggregando ingredienti da più ricette,
 * e scalando le quantità in base al numero di persone.
 * @param recipes Array di ricette selezionate.
 * @param numberOfPeople Numero di persone per cui cucinare.
 * @returns Una lista della spesa aggregata e arrotondata.
 */
export function generateShoppingList(
  recipes: Recipe[],
  numberOfPeople: number
): ShoppingListItem[] {
  const aggregatedIngredients = new Map<
    string,
    { totalQuantity: number; unit: string }
  >();

  for (const recipe of recipes) {
    // Salta ricette non valide o senza l'indicazione delle porzioni.
    if (
      !recipe.ingredients ||
      !Array.isArray(recipe.ingredients) ||
      !recipe.servings ||
      recipe.servings <= 0
    ) {
      continue;
    }

    const scaleFactor = numberOfPeople / recipe.servings;

    // CORREZIONE: 'ingredient' deve essere un elemento di 'recipe.ingredients'
    for (const ingredient of recipe.ingredients) {
      const scaledQuantity = ingredient.quantity * scaleFactor;
      const normalizedName = ingredient.name.trim().toLowerCase();
      const existingIngredient = aggregatedIngredients.get(normalizedName);

      if (existingIngredient) {
        // Se l'ingrediente esiste già, somma la quantità scalata.
        // Assumiamo che l'unità sia la stessa.
        existingIngredient.totalQuantity += scaledQuantity;
      } else {
        // Altrimenti, crea una nuova voce nella mappa.
        aggregatedIngredients.set(normalizedName, {
          totalQuantity: scaledQuantity,
          unit: ingredient.unit,
        });
      }
    }
  }

  // Converte la mappa in un array, arrotondando le quantità finali.
  const shoppingList: ShoppingListItem[] = Array.from(
    aggregatedIngredients.entries()
  ).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    quantity: smartRound(data.totalQuantity, data.unit),
    unit: data.unit,
  }));

  // Ordina la lista alfabeticamente per nome dell'ingrediente.
  return shoppingList.sort((a, b) => a.name.localeCompare(b.name));
}
