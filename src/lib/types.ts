
import type { LucideIcon } from 'lucide-react';

export type Category = {
  name: string;
  icon: LucideIcon;
};

export type Receipt = {
  id: string;
  vendor: string;
  description: string;
  date: Date;
  amount: number;
  category: string;
  imageUrl?: string;
};

export type Budget = {
  [category: string]: number;
};

export type IncomeBudget = {
  monthlyIncome: number;
}
