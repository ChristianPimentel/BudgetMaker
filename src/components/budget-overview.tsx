
"use client";

import React from 'react';
import { useApp } from '@/context/app-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from './ui/separator';
import { PiggyBank, HandCoins, ShieldCheck, PartyPopper, Wallet, Landmark } from 'lucide-react';
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

  const totalSpent = React.useMemo(() => {
    return Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
  }, [spendingByCategory]);

  const spendingPercentage = monthlyIncome > 0 ? (totalSpent / monthlyIncome) * 100 : 0;
  
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const spendingBudget = monthlyIncome * (INCOME_CATEGORIES.find(c => c.name === 'Spending')?.percentage || 0);
  const funBudget = monthlyIncome * (INCOME_CATEGORIES.find(c => c.name === 'Fun')?.percentage || 0);
  
  const spentOnSpending = spendingByCategory['Spending'] || 0;
  const spentOnFun = spendingByCategory['Fun'] || 0;
  
  const isSpendingOverBudget = spentOnSpending > spendingBudget;
  const spendingOverage = isSpendingOverBudget ? spentOnSpending - spendingBudget : 0;
  
  const flexibleSpendingBudget = spendingBudget + funBudget;
  const totalFlexibleSpent = spentOnSpending + spentOnFun;
  const remainingFlexible = flexibleSpendingBudget - totalFlexibleSpent;
  const flexibleProgress = flexibleSpendingBudget > 0 ? (totalFlexibleSpent / flexibleSpendingBudget) * 100 : 0;

  const totalRemaining = monthlyIncome - totalSpent;

  return (
    <Card className="print:shadow-none print:border-none">
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
          <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-lg">Total Spent</h3>
                  <span className="text-lg font-bold text-primary">{`${spendingPercentage.toFixed(1)}%`}</span>
                </div>
                <Progress value={spendingPercentage > 100 ? 100 : spendingPercentage} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{`${currencyFormatter.format(totalSpent)} of ${currencyFormatter.format(monthlyIncome)}`}</span>
                </div>
              </div>
              <div className="space-y-2 text-right">
                <h3 className="font-semibold text-lg">Total Remaining</h3>
                <p className="text-3xl font-bold text-emerald-600">{currencyFormatter.format(totalRemaining)}</p>
                <p className="text-sm text-muted-foreground">including Savings & Emergency</p>
              </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!isSpendingOverBudget ? (
              SPEND_CATEGORIES.map(categoryName => {
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
              })
            ) : (
              <div className="space-y-2 md:col-span-2">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-purple-500" />
                    Flexible Spending (Spending + Fun)
                  </h3>
                  <span className={remainingFlexible >= 0 ? 'text-accent-foreground font-medium' : 'text-destructive font-medium'}>
                    {remainingFlexible >= 0 ? `${currencyFormatter.format(remainingFlexible)} left` : `${currencyFormatter.format(Math.abs(remainingFlexible))} over`}
                  </span>
                </div>
                <Progress value={flexibleProgress > 100 ? 100 : flexibleProgress} className={cn("h-3", '[&>div]:bg-purple-500')} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{`${currencyFormatter.format(totalFlexibleSpent)} of ${currencyFormatter.format(flexibleSpendingBudget)}`}</span>
                  <span className="text-xs text-amber-600">{`(${currencyFormatter.format(spendingOverage)} over from Spending)`}</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {INCOME_CATEGORIES.map((category) => {
                const allocatedAmount = monthlyIncome * category.percentage;
                const Icon = category.icon;

                return (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-md print:bg-transparent">
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
