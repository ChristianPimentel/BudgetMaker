"use client";

import React from 'react';
import { useApp } from '@/context/app-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from './ui/separator';

export default function BudgetOverview() {
  const { budget, receipts, getCategoryIcon } = useApp();

  const spending = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return receipts
      .filter(r => r.date.getMonth() === currentMonth && r.date.getFullYear() === currentYear)
      .reduce((acc, receipt) => {
        if (!acc[receipt.category]) {
          acc[receipt.category] = 0;
        }
        acc[receipt.category] += receipt.amount;
        return acc;
      }, {} as { [key: string]: number });
  }, [receipts]);

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const totalBudget = React.useMemo(() => Object.values(budget).reduce((sum, amount) => sum + amount, 0), [budget]);
  const totalSpending = React.useMemo(() => Object.values(spending).reduce((sum, amount) => sum + amount, 0), [spending]);
  const totalRemaining = totalBudget - totalSpending;
  const totalProgress = totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget Overview</CardTitle>
        <CardDescription>Your spending progress for the current month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <h3 className="font-semibold text-lg">Total Spending</h3>
              <span className={totalRemaining >= 0 ? 'text-accent-foreground font-medium' : 'text-destructive font-medium'}>
                {totalRemaining >= 0 ? `${currencyFormatter.format(totalRemaining)} left` : `${currencyFormatter.format(Math.abs(totalRemaining))} over`}
              </span>
            </div>
            <Progress value={totalProgress > 100 ? 100 : totalProgress} className="h-3 [&>div]:bg-primary" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{`${currencyFormatter.format(totalSpending)} of ${currencyFormatter.format(totalBudget)}`}</span>
            </div>
          </div>
          
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {Object.entries(budget)
              .filter(([, budgetAmount]) => budgetAmount > 0)
              .map(([category, budgetAmount]) => {
                const spentAmount = spending[category] || 0;
                const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                const remaining = budgetAmount - spentAmount;
                const Icon = getCategoryIcon(category);

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg">{category}</h3>
                    </div>
                    <Progress value={percentage > 100 ? 100 : percentage} className="h-2 [&>div]:bg-primary" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{`${currencyFormatter.format(spentAmount)} of ${currencyFormatter.format(budgetAmount)}`}</span>
                      <span className={remaining >= 0 ? 'text-accent-foreground font-medium' : 'text-destructive font-medium'}>
                        {remaining >= 0 ? `${currencyFormatter.format(remaining)} left` : `${currencyFormatter.format(Math.abs(remaining))} over`}
                      </span>
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
