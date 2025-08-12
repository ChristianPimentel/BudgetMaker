"use client";

import React from 'react';
import { PlusCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BudgetOverview from './budget-overview';
import ReceiptsList from './receipts-list';
import AddReceiptSheet from './add-receipt-sheet';
import EditBudgetDialog from './edit-budget-dialog';
import type { Receipt } from '@/lib/types';

export default function Dashboard() {
  const [isAddReceiptSheetOpen, setAddReceiptSheetOpen] = React.useState(false);
  const [isEditBudgetDialogOpen, setEditBudgetDialogOpen] = React.useState(false);
  const [receiptToEdit, setReceiptToEdit] = React.useState<Receipt | null>(null);

  const handleAddReceiptClick = () => {
    setReceiptToEdit(null);
    setAddReceiptSheetOpen(true);
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setReceiptToEdit(receipt);
    setAddReceiptSheetOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold font-headline text-primary-foreground bg-primary px-3 py-1 rounded-md shadow">Receipt Wrangler</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setEditBudgetDialogOpen(true)} variant="outline" size="sm">
            <Settings className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Manage Budget</span>
          </Button>
          <Button onClick={handleAddReceiptClick} size="sm">
            <PlusCircle className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Add Receipt</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <BudgetOverview />
          <ReceiptsList onEditReceipt={handleEditReceipt} />
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
