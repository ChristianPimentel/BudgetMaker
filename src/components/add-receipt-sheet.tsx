"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Sparkles, Upload } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/lib/constants';
import { categorizeReceipt } from '@/ai/flows/categorize-receipt';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const receiptSchema = z.object({
  vendor: z.string().min(1, 'Vendor is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.date({ required_error: 'A date is required.' }),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().optional(),
});

type AddReceiptSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddReceiptSheet({ open, onOpenChange }: AddReceiptSheetProps) {
  const { addReceipt } = useApp();
  const { toast } = useToast();
  const [isCategorizing, setIsCategorizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof receiptSchema>>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      vendor: '',
      description: '',
      date: new Date(),
      category: '',
    },
  });

  const handleAutoCategorize = useCallback(async () => {
    const vendor = form.getValues('vendor');
    const description = form.getValues('description');
    if (!vendor || !description) return;

    setIsCategorizing(true);
    try {
      const result = await categorizeReceipt({ vendorName: vendor, description });
      if (result && CATEGORIES.some(c => c.name === result.category)) {
        form.setValue('category', result.category, { shouldValidate: true });
        toast({
          title: "Auto-categorized!",
          description: `We've set the category to ${result.category}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Categorization failed",
          description: "AI could not determine a category. Please select one manually.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to auto-categorize. Please try again.",
      });
    } finally {
      setIsCategorizing(false);
    }
  }, [form, toast]);

  function onSubmit(values: z.infer<typeof receiptSchema>) {
    addReceipt(values);
    toast({
      title: 'Receipt Added!',
      description: `${values.vendor} receipt for $${values.amount.toFixed(2)} has been saved.`,
    });
    form.reset({
      vendor: '',
      description: '',
      date: new Date(),
      category: ''
    });
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add a New Receipt</SheetTitle>
          <SheetDescription>
            Enter receipt details below. Use the magic wand to auto-categorize.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Starbucks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Morning coffee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal h-10",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={handleAutoCategorize} disabled={isCategorizing}>
                      {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                      <span className="sr-only">Auto-categorize</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Receipt Image</FormLabel>
              <FormControl>
                 <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                   <Upload className="mr-2 h-4 w-4" />
                   Upload an image
                 </Button>
              </FormControl>
              <Input ref={fileInputRef} type="file" className="hidden" accept="image/*" />
              <FormDescription>
                (Optional) Image upload is for record-keeping only.
              </FormDescription>
            </FormItem>
            <SheetFooter className="pt-4">
              <SheetClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Receipt
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
