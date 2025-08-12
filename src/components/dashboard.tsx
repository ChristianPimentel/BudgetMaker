
"use client";

import React from 'react';
import { PlusCircle, Settings, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BudgetOverview from './budget-overview';
import ReceiptsList from './receipts-list';
import AddReceiptSheet from './add-receipt-sheet';
import EditBudgetDialog from './edit-budget-dialog';
import type { Receipt } from '@/lib/types';
import { useApp } from '@/context/app-provider';
import * as XLSX from 'xlsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

export default function Dashboard() {
  const [isAddReceiptSheetOpen, setAddReceiptSheetOpen] = React.useState(false);
  const [isEditBudgetDialogOpen, setEditBudgetDialogOpen] = React.useState(false);
  const [receiptToEdit, setReceiptToEdit] = React.useState<Receipt | null>(null);
  const { receipts } = useApp();

  const handleAddReceiptClick = () => {
    setReceiptToEdit(null);
    setAddReceiptSheetOpen(true);
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setReceiptToEdit(receipt);
    setAddReceiptSheetOpen(true);
  };
  
  const handleExport = (period: 'month' | 'year') => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const filteredReceipts = receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      if (period === 'month') {
        return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
      }
      if (period === 'year') {
        return receiptDate.getFullYear() === currentYear;
      }
      return false;
    });

    const dataToExport = filteredReceipts.map(r => ({
      Date: format(new Date(r.date), 'yyyy-MM-dd'),
      Vendor: r.vendor,
      Description: r.description,
      Category: r.category,
      Amount: r.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Receipts');

    const fileName = `receipts_export_${period}_${period === 'month' ? format(currentDate, 'MMMM_yyyy') : currentYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };


  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm sticky top-0 z-10">
        <h1 className="text-xl md:text-2xl font-bold font-headline text-primary-foreground bg-primary px-3 py-1 rounded-md shadow">Receipt Wrangler</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileDown className="mr-0 md:mr-2 h-4 w-4" />
                <span className="hidden md:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('month')}>
                Export Monthly
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('year')}>
                Export Yearly
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setEditBudgetDialogOpen(true)} variant="outline" size="sm">
            <Settings className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Set Income</span>
          </Button>
          <Button onClick={handleAddReceiptClick} size="sm">
            <PlusCircle className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">Add Expense</span>
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
