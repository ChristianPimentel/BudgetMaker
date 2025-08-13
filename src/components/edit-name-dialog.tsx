
"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

type EditNameDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditNameDialog({ open, onOpenChange }: EditNameDialogProps) {
  const { userName, setUserName, deleteAllReceipts } = useApp();
  const { toast } = useToast();
  const [localName, setLocalName] = useState(userName || '');
  const isInitialSetup = userName === null;

  useEffect(() => {
    if (open) {
      setLocalName(userName || '');
    }
  }, [userName, open]);

  const handleSave = () => {
    if (localName.trim() === '') {
        toast({
            variant: "destructive",
            title: 'Name is required',
            description: 'Please enter a name to continue.',
        });
        return;
    }
    
    // If it's a new user, clear previous data
    if (isInitialSetup || (userName && userName !== localName)) {
        deleteAllReceipts();
        toast({
            title: `Welcome, ${localName}!`,
            description: "Previous report data has been cleared for a fresh start.",
        });
    }

    setUserName(localName);
    onOpenChange(false);
  };
  
  const handleDialogInteraction = (e: React.SyntheticEvent) => {
    if(isInitialSetup) {
      e.preventDefault();
      toast({
        variant: 'destructive',
        title: 'Please enter your name',
        description: 'You need to provide a name to use the app.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        onEscapeKeyDown={handleDialogInteraction}
        onPointerDownOutside={handleDialogInteraction}
      >
        <DialogHeader>
          <DialogTitle>{isInitialSetup ? 'Welcome!' : 'Change User'}</DialogTitle>
          <DialogDescription>
            {isInitialSetup 
              ? 'Please enter your name to begin creating your budget report.'
              : 'Enter a new name to start a new report. This will clear all current data.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="e.g. Jane Doe"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                />
              </div>
            </div>
        </div>
        <DialogFooter>
          {!isInitialSetup && (
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
          )}
          <Button type="button" onClick={handleSave}>
            {isInitialSetup ? 'Start Budgeting' : 'Save and Start New Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
