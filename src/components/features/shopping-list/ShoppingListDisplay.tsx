// src/components/features/shopping-list/ShoppingListDisplay.tsx v.1.1
// Componente client per visualizzare la lista, ora con testo tradotto.

'use client';

// 1. Import necessari (aggiunto useTranslations)
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingListItem } from '@/lib/shopping-list-generator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// 2. Definizione Props (invariata)
interface ShoppingListDisplayProps {
  items: ShoppingListItem[];
}

// 3. Componente Principale
export function ShoppingListDisplay({ items }: ShoppingListDisplayProps) {
  // Inizializza la funzione di traduzione
  const t = useTranslations('ShoppingListPage');
  
  // Stato per le checkbox (invariato)
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

  // 4. Rendering dello Stato Vuoto con testo tradotto
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t('emptyState')}</p>
        </CardContent>
      </Card>
    );
  }

  // 5. Rendering della Lista con testo tradotto
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('listTitle')}</CardTitle>
        <CardDescription>{t('listDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {items.map((item) => {
            const isChecked = checkedItems.has(item.name);
            return (
              <li key={item.name} className="flex items-center space-x-3 p-2 rounded-md transition-colors hover:bg-gray-50">
                <Checkbox
                  id={`item-${item.name}`}
                  checked={isChecked}
                  onCheckedChange={() => handleToggleItem(item.name)}
                />
                <Label
                  htmlFor={`item-${item.name}`}
                  className={`flex-grow cursor-pointer ${isChecked ? 'text-gray-400 line-through' : ''}`}
                >
                  <span className="font-medium">{item.name}</span>
                </Label>
                <span className={`text-sm ${isChecked ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
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