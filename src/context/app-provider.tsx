"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Receipt, Budget } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { MoreHorizontal } from 'lucide-react';

const initialReceipts: Receipt[] = [
  { id: '1', vendor: 'SuperMart', description: 'Weekly groceries', date: new Date(new Date().setDate(new Date().getDate() - 5)), amount: 125.43, category: 'Groceries' },
  { id: '2', vendor: 'The Corner Cafe', description: 'Coffee with friends', date: new Date(new Date().setDate(new Date().getDate() - 6)), amount: 12.50, category: 'Dining' },
  { id: '3', vendor: 'Metro Transit', description: 'Monthly pass', date: new Date(new Date().setDate(new Date().getDate() - 20)), amount: 95.00, category: 'Transportation' },
  { id: '4', vendor: 'Cineplex', description: 'Movie night', date: new Date(new Date().setDate(new Date().getDate() - 2)), amount: 45.00, category: 'Entertainment' },
];

const initialBudget: Budget = Object.fromEntries(CATEGORIES.map(c => [c.name, 0]));
initialBudget['Groceries'] = 500;
initialBudget['Dining'] = 150;
initialBudget['Transportation'] = 100;
initialBudget['Utilities'] = 200;
initialBudget['Entertainment'] = 100;
initialBudget['Shopping'] = 250;
initialBudget['Travel'] = 300;
initialBudget['Other'] = 50;


interface AppContextType {
  receipts: Receipt[];
  budget: Budget;
  addReceipt: (receipt: Omit<Receipt, 'id'>) => void;
  updateBudget: (category: string, amount: number) => void;
  getCategoryIcon: (categoryName: string) => React.ElementType;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts);
  const [budget, setBudget] = useState<Budget>(initialBudget);

  const addReceipt = (receipt: Omit<Receipt, 'id'>) => {
    setReceipts(prev => [{ ...receipt, id: new Date().toISOString() + Math.random() }, ...prev]);
  };

  const updateBudget = (category: string, amount: number) => {
    setBudget(prev => ({ ...prev, [category]: amount }));
  };

  const getCategoryIcon = (categoryName: string) => {
    return CATEGORIES.find(c => c.name === categoryName)?.icon || MoreHorizontal;
  };

  return (
    <AppContext.Provider value={{ receipts, budget, addReceipt, updateBudget, getCategoryIcon }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
