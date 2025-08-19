
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Receipt } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { MoreHorizontal } from 'lucide-react';

const initialIncome = 0;

interface AppContextType {
  receipts: Receipt[];
  monthlyIncome: number;
  userName: string | null;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'date'> & { date: Date | object }) => void;
  updateReceipt: (id: string, receipt: Omit<Receipt, 'id' | 'date'> & { date: Date | object }) => void;
  deleteReceipt: (id: string) => void;
  deleteAllReceipts: () => void;
  setMonthlyIncome: (amount: number) => void;
  setUserName: (name: string) => void;
  getCategoryIcon: (categoryName: string) => React.ElementType;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [monthlyIncome, setMonthlyIncomeState] = useState<number>(initialIncome);
  const [userName, setUserNameState] = useState<string | null>(null);

  // Load initial data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedName = localStorage.getItem('userName');
        if (storedName) {
          setUserNameState(storedName);
        }

        const storedIncome = localStorage.getItem('monthlyIncome');
        if (storedIncome) {
          setMonthlyIncomeState(JSON.parse(storedIncome));
        }

        const storedReceipts = localStorage.getItem('receipts');
        if (storedReceipts) {
          // Parse dates which are stored as strings
          const parsedReceipts = JSON.parse(storedReceipts).map((r: Receipt) => ({
            ...r,
            date: new Date(r.date),
          }));
          setReceipts(parsedReceipts);
        }
      } catch (error) {
        console.error("Error reading from localStorage", error);
      }
    }
  }, []);

  const addReceipt = (receipt: Omit<Receipt, 'id'>) => {
    try {
      const newReceipt = { ...receipt, id: new Date().toISOString() };
      const updatedReceipts = [...receipts, newReceipt];
      setReceipts(updatedReceipts);
      localStorage.setItem('receipts', JSON.stringify(updatedReceipts));
    } catch (error) {
      console.error("Error adding receipt to localStorage: ", error);
    }
  };

  const updateReceipt = (id: string, updatedReceiptData: Omit<Receipt, 'id'>) => {
    try {
      const updatedReceipts = receipts.map(r => 
        r.id === id ? { ...updatedReceiptData, id } : r
      );
      setReceipts(updatedReceipts);
      localStorage.setItem('receipts', JSON.stringify(updatedReceipts));
    } catch (error) {
      console.error("Error updating receipt in localStorage: ", error);
    }
  };
  
  const deleteReceipt = (id: string) => {
    try {
      const updatedReceipts = receipts.filter(r => r.id !== id);
      setReceipts(updatedReceipts);
      localStorage.setItem('receipts', JSON.stringify(updatedReceipts));
    } catch (error) {
      console.error("Error deleting receipt from localStorage: ", error);
    }
  };

  const deleteAllReceipts = () => {
    try {
      setReceipts([]);
      localStorage.removeItem('receipts');
      setMonthlyIncome(0);
    } catch (error) {
      console.error("Error deleting all receipts from localStorage: ", error);
    }
  };

  const setMonthlyIncome = (amount: number) => {
    try {
      setMonthlyIncomeState(amount);
      localStorage.setItem('monthlyIncome', JSON.stringify(amount));
    } catch (error) {
      console.error("Error updating income in localStorage: ", error);
    }
  };

  const setUserName = (name: string) => {
    if (name.trim() === '') {
      localStorage.removeItem('userName');
      setUserNameState(null);
    } else {
      localStorage.setItem('userName', name);
      setUserNameState(name);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    return CATEGORIES.find(c => c.name === categoryName)?.icon || MoreHorizontal;
  };

  return (
    <AppContext.Provider value={{ receipts, monthlyIncome, userName, addReceipt, updateReceipt, deleteReceipt, deleteAllReceipts, setMonthlyIncome, setUserName, getCategoryIcon }}>
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
