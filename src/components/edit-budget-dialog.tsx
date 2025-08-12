
"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

type EditBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditBudgetDialog({ open, onOpenChange }: EditBudgetDialogProps) {
  const { monthlyIncome, setMonthlyIncome } = useApp();
  const { toast } = useToast();
  const [localIncome, setLocalIncome] = useState(monthlyIncome);

  React.useEffect(() => {
    if (open) {
      setLocalIncome(monthlyIncome);
    }
  }, [monthlyIncome, open]);

  const handleIncomeChange = (value: string) => {
    const amount = Number(value);
    if (!isNaN(amount) && amount >= 0) {
      setLocalIncome(amount);
    } else if (value === '') {
      setLocalIncome(0);
    }
  };

  const handleSave = () => {
    setMonthlyIncome(localIncome);
    toast({
      title: 'Income Updated',
      description: 'Your monthly income has been saved.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Monthly Income</DialogTitle>
          <DialogDescription>
            Enter your total monthly income to calculate your budget.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="income" className="font-medium">Monthly Income</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="income"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={localIncome || ''}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
        </div>
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
