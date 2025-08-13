
"use client";

import React from 'react';
import { PlusCircle, Settings, Printer, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BudgetOverview from './budget-overview';
import ReceiptsList from './receipts-list';
import AddReceiptSheet from './add-receipt-sheet';
import EditBudgetDialog from './edit-budget-dialog';
import type { Receipt } from '@/lib/types';
import { useApp } from '@/context/app-provider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [isAddReceiptSheetOpen, setAddReceiptSheetOpen] = React.useState(false);
  const [isEditBudgetDialogOpen, setEditBudgetDialogOpen] = React.useState(false);
  const [receiptToEdit, setReceiptToEdit] = React.useState<Receipt | null>(null);
  const { deleteAllReceipts } = useApp();
  const { toast } = useToast();

  const handleAddReceiptClick = () => {
    setReceiptToEdit(null);
    setAddReceiptSheetOpen(true);
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setReceiptToEdit(receipt);
    setAddReceiptSheetOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearAll = () => {
    deleteAllReceipts();
    toast({
      title: 'All Expenses Cleared',
      description: 'You have a fresh start!',
    });
  };
  
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm sticky top-0 z-10 print:hidden">
        <h1 className="text-xl md:text-2xl font-bold font-headline text-primary-foreground bg-primary px-3 py-1 rounded-md shadow">Budget Maker</h1>
        <div className="flex items-center gap-2">
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FilePlus className="mr-0 md:mr-2 h-4 w-4" />
                <span className="hidden md:inline">New</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  of your expenses and clear your budget data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">
                  Yes, clear everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={() => setEditBudgetDialogOpen(true)} variant="outline" size="sm">
            <Settings className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Set Income</span>
          </Button>
          <Button onClick={handleAddReceiptClick} size="sm">
            <PlusCircle className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Add Expense</span>
          </Button>
           <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Save as PDF</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 lg:p-8 print:p-0 print:overflow-visible">
        <div className="max-w-7xl mx-auto space-y-8">
          <BudgetOverview />
          <div className="receipts-list-container">
            <ReceiptsList onEditReceipt={handleEditReceipt} />
          </div>
        </div>
      </main>

      <AddReceiptSheet 
        open={isAddReceiptSheetOpen} 
        onOpenChange={setAddReceiptSheetOpen}
        receiptToEdit={receiptToEdit} 
      />
      <EditBudgetDialog open={isEditBudgetDialogOpen} onOpenChange={setEditBudgetDialogOpen} />
    </div>
  );
}
