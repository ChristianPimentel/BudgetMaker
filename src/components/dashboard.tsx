
"use client";

import React from 'react';
import { PlusCircle, Settings, Printer, FilePlus, LogOut, MoreVertical, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BudgetOverview from './budget-overview';
import ReceiptsList from './receipts-list';
import AddReceiptSheet from './add-receipt-sheet';
import EditBudgetDialog from './edit-budget-dialog';
import type { Receipt } from '@/lib/types';
import { useApp } from '@/context/app-provider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import EditNameDialog from './edit-name-dialog';
import InstructionsDialog from './instructions-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Dashboard() {
  const [isAddReceiptSheetOpen, setAddReceiptSheetOpen] = React.useState(false);
  const [isEditBudgetDialogOpen, setEditBudgetDialogOpen] = React.useState(false);
  const [isEditNameDialogOpen, setEditNameDialogOpen] = React.useState(false);
  const [isInstructionsDialogOpen, setInstructionsDialogOpen] = React.useState(false);
  const [receiptToEdit, setReceiptToEdit] = React.useState<Receipt | null>(null);
  const { deleteAllReceipts, userName } = useApp();
  const { toast } = useToast();

  React.useEffect(() => {
    if (userName === null) {
      setEditNameDialogOpen(true);
    }
  }, [userName]);

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
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold font-headline text-primary-foreground bg-primary px-3 py-1 rounded-md shadow">Budget Maker</h1>
          {userName && <span className="hidden md:inline text-lg font-medium text-muted-foreground">Welcome, {userName}!</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddReceiptClick} size="sm">
            <PlusCircle className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Add Expense</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={() => setInstructionsDialogOpen(true)}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Instrucciones</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    <span>New Report</span>
                  </DropdownMenuItem>
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
              <DropdownMenuItem onClick={() => setEditBudgetDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Set Income</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditNameDialogOpen(true)}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Change User</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                <span>Save as PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <EditNameDialog open={isEditNameDialogOpen} onOpenChange={setEditNameDialogOpen} />
      <InstructionsDialog open={isInstructionsDialogOpen} onOpenChange={setInstructionsDialogOpen} />
    </div>
  );
}
