
"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/app-provider';
import type { Receipt } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type SortKey = keyof Omit<Receipt, 'imageUrl' | 'id' | 'description'>;
type SortOrder = 'asc' | 'desc';

type ReceiptsListProps = {
  onEditReceipt: (receipt: Receipt) => void;
};

export default function ReceiptsList({ onEditReceipt }: ReceiptsListProps) {
  const { receipts, getCategoryIcon, deleteReceipt } = useApp();
  const { toast } = useToast();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'date', order: 'desc' });

  const sortedReceipts = useMemo(() => {
    let sortableItems = [...receipts];
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [receipts, sortConfig]);

  const requestSort = (key: SortKey) => {
    let order: SortOrder = 'asc';
    if (sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
  };

  const handleDelete = (id: string) => {
    deleteReceipt(id);
    toast({
      title: 'Expense Deleted',
      description: 'The expense has been successfully removed.',
    });
  };
  
  const SortableHeader = ({ children, sortKey }: { children: React.ReactNode, sortKey: SortKey }) => (
    <TableHead>
      <Button variant="ghost" onClick={() => requestSort(sortKey)} className="-ml-4">
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Expenses</CardTitle>
        <CardDescription>A list of all your recorded expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader sortKey="date">Date</SortableHeader>
                <SortableHeader sortKey="vendor">Vendor</SortableHeader>
                <SortableHeader sortKey="category">Category</SortableHeader>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReceipts.length > 0 ? sortedReceipts.map((receipt) => {
                const Icon = getCategoryIcon(receipt.category);
                return (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{format(receipt.date, 'MMM d, yyyy')}</TableCell>
                    <TableCell>{receipt.vendor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-2 w-fit">
                        <Icon className="h-4 w-4" />
                        <span>{receipt.category}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{currencyFormatter.format(receipt.amount)}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditReceipt(receipt)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this expense from your records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(receipt.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No expenses found. Add one to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
