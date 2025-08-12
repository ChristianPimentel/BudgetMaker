"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES } from '@/lib/constants';
import { ScrollArea } from './ui/scroll-area';

type EditBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditBudgetDialog({ open, onOpenChange }: EditBudgetDialogProps) {
  const { budget, updateBudget } = useApp();
  const { toast } = useToast();
  const [localBudget, setLocalBudget] = useState(budget);

  React.useEffect(() => {
    if (open) {
      setLocalBudget(budget);
    }
  }, [budget, open]);

  const handleBudgetChange = (category: string, value: string) => {
    const amount = Number(value);
    if (!isNaN(amount) && amount >= 0) {
      setLocalBudget(prev => ({ ...prev, [category]: amount }));
    }
  };

  const handleSave = () => {
    Object.entries(localBudget).forEach(([category, amount]) => {
      if (budget[category] !== amount) {
        updateBudget(category, amount);
      }
    });
    toast({
      title: 'Budget Updated',
      description: 'Your monthly budget has been saved.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Monthly Budget</DialogTitle>
          <DialogDescription>
            Set your spending limits for each category.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-6 px-6">
          <div className="space-y-4 py-4 pr-1">
            {CATEGORIES.map(category => (
              <div key={category.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-muted rounded-md">
                    <category.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <label htmlFor={`budget-${category.name}`} className="font-medium whitespace-nowrap">{category.name}</label>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id={`budget-${category.name}`}
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={localBudget[category.name] || ''}
                    onChange={(e) => handleBudgetChange(category.name, e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
