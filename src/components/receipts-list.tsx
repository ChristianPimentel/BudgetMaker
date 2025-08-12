"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/app-provider';
import type { Receipt } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type SortKey = keyof Omit<Receipt, 'imageUrl' | 'id' | 'description'>;
type SortOrder = 'asc' | 'desc';

export default function ReceiptsList() {
  const { receipts, getCategoryIcon } = useApp();
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
        <CardTitle>All Receipts</CardTitle>
        <CardDescription>A list of all your recorded receipts.</CardDescription>
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
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No receipts found. Add one to get started!
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
