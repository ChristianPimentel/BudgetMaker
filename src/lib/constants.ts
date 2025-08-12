import { Car, ShoppingCart, Utensils, Bolt, Ticket, ShoppingBag, Plane, MoreHorizontal } from 'lucide-react';
import type { Category } from './types';

export const CATEGORIES: Category[] = [
  { name: 'Groceries', icon: ShoppingCart },
  { name: 'Dining', icon: Utensils },
  { name: 'Transportation', icon: Car },
  { name: 'Utilities', icon: Bolt },
  { name: 'Entertainment', icon: Ticket },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Travel', icon: Plane },
  { name: 'Other', icon: MoreHorizontal },
];
