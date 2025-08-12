
"use client";

import React from 'react';
import { useApp } from '@/context/app-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from './ui/separator';
import { PiggyBank, HandCoins, ShieldCheck, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

const INCOME_CATEGORIES = [
  { name: 'Spending', percentage: 0.50, icon: HandCoins, color: 'text-sky-500', progressBg: '[&>div]:bg-sky-500' },
  { name: 'Saving', percentage: 0.15, icon: PiggyBank, color: 'text-emerald-500', progressBg: '[&>div]:bg-emerald-500' },
  { name: 'Emergency', percentage: 0.05, icon: ShieldCheck, color: 'text-amber-500', progressBg: '[&>div]:bg-amber-500' },
  { name: 'Fun', percentage: 0.30, icon: PartyPopper, color: 'text-rose-500', progressBg: '[&>div]:bg-rose-500' },
]

const SPEND_CATEGORIES = ['Spending', 'Fun'];

export default function BudgetOverview() {
  const { monthlyIncome, receipts } = useApp();

  const spendingByCategory = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyReceipts = receipts
      .filter(r => r.date.getMonth() === currentMonth && r.date.getFullYear() === currentYear);

    return SPEND_CATEGORIES.reduce((acc, category) => {
      acc[category] = monthlyReceipts
        .filter(r => r.category === category)
        .reduce((sum, r) => sum + r.amount, 0);
      return acc;
    }, {} as Record<string, number>);
  }, [receipts]);
  
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SPEND_CATEGORIES.map(categoryName => {
              const categoryInfo = INCOME_CATEGORIES.find(c => c.name === categoryName);
              if (!categoryInfo) return null;

              const budget = monthlyIncome * categoryInfo.percentage;
              const spent = spendingByCategory[categoryName] || 0;
              const remaining = budget - spent;
              const progress = budget > 0 ? (spent / budget) * 100 : 0;
              
              return (
                <div key={categoryName} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <categoryInfo.icon className={cn("w-5 h-5", categoryInfo.color)} />
                      {categoryName}
                    </h3>
                    <span className={remaining >= 0 ? 'text-accent-foreground font-medium' : 'text-destructive font-medium'}>
                      {remaining >= 0 ? `${currencyFormatter.format(remaining)} left` : `${currencyFormatter.format(Math.abs(remaining))} over`}
                    </span>
                  </div>
                  <Progress value={progress > 100 ? 100 : progress} className={cn("h-3", categoryInfo.progressBg)} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{`${currencyFormatter.format(spent)} of ${currencyFormatter.format(budget)}`}</span>
                  </div>
                </div>
              );
            })}
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
