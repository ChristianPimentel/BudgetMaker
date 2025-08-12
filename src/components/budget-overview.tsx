
"use client";

import React from 'react';
import { useApp } from '@/context/app-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from './ui/separator';
import { PiggyBank, HandCoins, ShieldCheck, PartyPopper } from 'lucide-react';

const INCOME_CATEGORIES = [
  { name: 'Spending', percentage: 0.50, icon: HandCoins, color: 'text-sky-500', progressBg: '[&>div]:bg-sky-500' },
  { name: 'Saving', percentage: 0.15, icon: PiggyBank, color: 'text-emerald-500', progressBg: '[&>div]:bg-emerald-500' },
  { name: 'Emergency', percentage: 0.05, icon: ShieldCheck, color: 'text-amber-500', progressBg: '[&>div]:bg-amber-500' },
  { name: 'Fun', percentage: 0.30, icon: PartyPopper, color: 'text-rose-500', progressBg: '[&>div]:bg-rose-500' },
]

export default function BudgetOverview() {
  const { monthlyIncome, receipts } = useApp();

  const totalSpending = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return receipts
      .filter(r => r.date.getMonth() === currentMonth && r.date.getFullYear() === currentYear)
      .reduce((acc, receipt) => acc + receipt.amount, 0);
  }, [receipts]);

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  const spendingBudget = monthlyIncome * (INCOME_CATEGORIES.find(c => c.name === 'Spending')?.percentage || 0);
  const remainingSpending = spendingBudget - totalSpending;
  const spendingProgress = spendingBudget > 0 ? (totalSpending / spendingBudget) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Monthly Budget Overview</CardTitle>
            <CardDescription>Your financial breakdown based on your income.</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Monthly Income</p>
            <p className="text-2xl font-bold text-primary">{currencyFormatter.format(monthlyIncome)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold text-lg">Total Spending</h3>
              <span className={remainingSpending >= 0 ? 'text-accent-foreground font-medium' : 'text-destructive font-medium'}>
                {remainingSpending >= 0 ? `${currencyFormatter.format(remainingSpending)} left` : `${currencyFormatter.format(Math.abs(remainingSpending))} over`}
              </span>
            </div>
            <Progress value={spendingProgress > 100 ? 100 : spendingProgress} className="h-3 [&>div]:bg-primary" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{`${currencyFormatter.format(totalSpending)} of ${currencyFormatter.format(spendingBudget)}`}</span>
            </div>
          </div>
          
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {INCOME_CATEGORIES.map((category) => {
                const allocatedAmount = monthlyIncome * category.percentage;
                const Icon = category.icon;

                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md">
                        <Icon className={`w-5 h-5 ${category.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{`${(category.percentage * 100).toFixed(0)}% of income`}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                        <span className="text-2xl font-bold">{currencyFormatter.format(allocatedAmount)}</span>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
