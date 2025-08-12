
"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Sparkles, Upload, Camera } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/lib/constants';
import { categorizeReceipt } from '@/ai/flows/categorize-receipt';
import { extractReceiptData } from '@/ai/flows/extract-receipt-data';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import type { Receipt } from '@/lib/types';
import CameraCapture from './camera-capture';

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
  receiptToEdit?: Receipt | null;
};

export default function AddReceiptSheet({ open, onOpenChange, receiptToEdit }: AddReceiptSheetProps) {
  const { addReceipt, updateReceipt } = useApp();
  const { toast } = useToast();
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!receiptToEdit;

  const form = useForm<z.infer<typeof receiptSchema>>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      vendor: '',
      description: '',
      amount: 0,
      date: new Date(),
      category: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && receiptToEdit) {
        form.reset(receiptToEdit);
      } else {
        form.reset({
          vendor: '',
          description: '',
          amount: 0,
          date: new Date(),
          category: '',
        });
      }
    }
  }, [open, isEditing, receiptToEdit, form]);

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

  const processImageDataUri = useCallback(async (imageDataUri: string) => {
    setIsExtracting(true);
    try {
      const result = await extractReceiptData({ imageDataUri });
      form.setValue('vendor', result.vendor, { shouldValidate: true });
      form.setValue('description', result.description, { shouldValidate: true });
      form.setValue('amount', result.amount, { shouldValidate: true });
      toast({
        title: 'Data Extracted!',
        description: 'We filled in the form with data from your receipt.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Extraction Failed',
        description: 'We could not extract data from the image. Please fill it out manually.',
      });
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [form, toast]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const imageDataUri = reader.result as string;
      await processImageDataUri(imageDataUri);
    };
    reader.onerror = (error) => {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'File Read Error',
        description: 'Could not read the selected file.',
      });
      setIsExtracting(false);
    };
  };
  
  const handlePhotoTaken = (imageDataUri: string) => {
    setIsCameraOpen(false);
    processImageDataUri(imageDataUri);
  };

  function onSubmit(values: z.infer<typeof receiptSchema>) {
    if (isEditing && receiptToEdit) {
      updateReceipt(receiptToEdit.id, values);
      toast({
        title: 'Expense Updated!',
        description: 'Your expense has been successfully updated.',
      });
    } else {
      addReceipt(values);
      toast({
        title: 'Expense Added!',
        description: `${values.vendor} expense for $${values.amount.toFixed(2)} has been saved.`,
      });
    }
    
    onOpenChange(false);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditing ? 'Edit Expense' : 'Add a New Expense'}</SheetTitle>
            <SheetDescription>
              {isEditing 
                ? 'Update the details of your expense below.'
                : 'Enter expense details below or upload an image to have it automatically filled.'
              }
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
                        <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value || ''} />
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
              {!isEditing && (
                <FormItem>
                  <FormLabel>Receipt Image</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isExtracting}>
                      {isExtracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      {isExtracting ? 'Extracting...' : 'Upload Image'}
                    </Button>
                     <Button type="button" variant="outline" className="w-full" onClick={() => setIsCameraOpen(true)} disabled={isExtracting}>
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>
                  <Input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <FormDescription>
                    Upload an image or take a photo to automatically fill vendor, description, and amount.
                  </FormDescription>
                </FormItem>
              )}
              <SheetFooter className="pt-4">
                <SheetClose asChild>
                  <Button type="button" variant="ghost">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={form.formState.isSubmitting || isExtracting}>
                  {(form.formState.isSubmitting || isExtracting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Save Expense'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      <CameraCapture
        open={isCameraOpen}
        onOpenChange={setIsCameraOpen}
        onPhotoTaken={handlePhotoTaken}
      />
    </>
  );
}
