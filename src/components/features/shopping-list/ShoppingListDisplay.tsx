// src/components/features/shopping-list/ShoppingListDisplay.tsx v.1.0
// Componente client per visualizzare la lista della spesa con checkbox interattive.

"use client";

// 1. Import necessari
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingListItem } from "@/lib/shopping-listgenerator";

// src/components/features/shopping-list/ShoppingListDisplay.tsx v.1.0
// Componente client per visualizzare la lista della spesa con checkbox interattive.

// 2. Definizione Props
interface ShoppingListDisplayProps {
  items: ShoppingListItem[];
}

// 3. Componente Principale
export function ShoppingListDisplay({ items }: ShoppingListDisplayProps) {
  // Stato per tenere traccia degli ingredienti spuntati (acquistati/posseduti)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleToggleItem = (itemName: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemName)) {
      newCheckedItems.delete(itemName);
    } else {
      newCheckedItems.add(itemName);
    }
    setCheckedItems(newCheckedItems);
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista Generata</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Nessuna ricetta selezionata. Seleziona i pasti e aggiorna la lista
            per vedere gli ingredienti.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 4. Rendering della Lista
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista della Spesa</CardTitle>
        <CardDescription>
          Spunta gli ingredienti che hai già o che hai acquistato.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => {
            const isChecked = checkedItems.has(item.name);
            return (
              <li
                key={item.name}
                className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-gray-50"
              >
                <Checkbox
                  id={`item-${item.name}`}
                  checked={isChecked}
                  onCheckedChange={() => handleToggleItem(item.name)}
                />
                <Label
                  htmlFor={`item-${item.name}`}
                  className={`flex-grow cursor-pointer ${isChecked ? "text-gray-400 line-through" : ""}`}
                >
                  <span className="font-medium">{item.name}</span>
                </Label>
                <span
                  className={`text-sm ${isChecked ? "text-gray-400 line-through" : "text-gray-600"}`}
                >
                  {item.quantity} {item.unit}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
