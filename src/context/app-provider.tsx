
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Receipt, IncomeBudget } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { MoreHorizontal } from 'lucide-react';

const initialIncome = 3000;

interface AppContextType {
  receipts: Receipt[];
  monthlyIncome: number;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'date'> & { date: Date | object }) => void;
  updateReceipt: (id: string, receipt: Omit<Receipt, 'id' | 'date'> & { date: Date | object }) => void;
  deleteReceipt: (id: string) => void;
  setMonthlyIncome: (amount: number) => void;
  getCategoryIcon: (categoryName: string) => React.ElementType;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [monthlyIncome, setMonthlyIncomeState] = useState<number>(initialIncome);

  useEffect(() => {
    const q = collection(db, 'receipts');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const receiptsData: Receipt[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        receiptsData.push({ 
          id: doc.id, 
          ...data,
          date: data.date.toDate() 
        } as Receipt);
      });
      setReceipts(receiptsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const budgetDocRef = doc(db, 'budget', 'user_income_budget');
    const unsubscribe = onSnapshot(budgetDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as IncomeBudget;
        setMonthlyIncomeState(data.monthlyIncome);
      } else {
        setDoc(budgetDocRef, { monthlyIncome: initialIncome });
      }
    });

    return () => unsubscribe();
  }, []);


  const addReceipt = async (receipt: Omit<Receipt, 'id'>) => {
    try {
      await addDoc(collection(db, 'receipts'), receipt);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const updateReceipt = async (id: string, updatedReceipt: Omit<Receipt, 'id'>) => {
    try {
      const receiptDoc = doc(db, 'receipts', id);
      await updateDoc(receiptDoc, updatedReceipt);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  
  const deleteReceipt = async (id: string) => {
    try {
      const receiptDoc = doc(db, 'receipts', id);
      await deleteDoc(receiptDoc);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const setMonthlyIncome = async (amount: number) => {
    try {
      const budgetDocRef = doc(db, 'budget', 'user_income_budget');
      await setDoc(budgetDocRef, { monthlyIncome: amount }, { merge: true });
    } catch (error) {
      console.error("Error updating income: ", error);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    return CATEGORIES.find(c => c.name === categoryName)?.icon || MoreHorizontal;
  };

  return (
    <AppContext.Provider value={{ receipts, monthlyIncome, addReceipt, updateReceipt, deleteReceipt, setMonthlyIncome, getCategoryIcon }}>
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
