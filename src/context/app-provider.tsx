
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Receipt, Budget } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import { MoreHorizontal } from 'lucide-react';

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
  addReceipt: (receipt: Omit<Receipt, 'id' | 'date'> & { date: Date | object }) => void;
  updateReceipt: (id: string, receipt: Omit<Receipt, 'id' | 'date'> & { date: Date | object }) => void;
  deleteReceipt: (id: string) => void;
  updateBudget: (category: string, amount: number) => void;
  getCategoryIcon: (categoryName: string) => React.ElementType;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [budget, setBudget] = useState<Budget>(initialBudget);

  useEffect(() => {
    const q = query(collection(db, 'receipts'));
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
    const budgetDocRef = doc(db, 'budget', 'user_budget');
    const unsubscribe = onSnapshot(budgetDocRef, (doc) => {
      if (doc.exists()) {
        setBudget(doc.data() as Budget);
      } else {
        // If budget doesn't exist, create it with initial values
        setDoc(budgetDocRef, initialBudget);
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

  const updateBudget = async (category: string, amount: number) => {
    try {
      const budgetDocRef = doc(db, 'budget', 'user_budget');
      // Use setDoc with merge to update or create fields
      await setDoc(budgetDocRef, { [category]: amount }, { merge: true });
    } catch (error) {
      console.error("Error updating budget: ", error);
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    return CATEGORIES.find(c => c.name === categoryName)?.icon || MoreHorizontal;
  };

  return (
    <AppContext.Provider value={{ receipts, budget, addReceipt, updateReceipt, deleteReceipt, updateBudget, getCategoryIcon }}>
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
