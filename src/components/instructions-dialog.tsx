
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { HelpCircle, User, Settings, PlusCircle, Camera, Upload, Printer, FilePlus } from 'lucide-react';

type InstructionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function InstructionsDialog({ open, onOpenChange }: InstructionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Cómo Usar Budget Maker
          </DialogTitle>
          <DialogDescription>
            Una guía rápida para empezar a gestionar tus finanzas.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  <span className="font-semibold">1. Introduce tu Nombre</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8">
                Al abrir la aplicación por primera vez, se te pedirá tu nombre. Esto personaliza la experiencia y el informe final.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    <span className="font-semibold">2. Define tu Ingreso Mensual</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8">
                Ve a <span className="font-semibold">Acciones {'>'} Set Income</span> para establecer tu ingreso mensual. Esto es crucial para que el presupuesto se calcule correctamente.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                 <div className="flex items-center gap-3">
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-semibold">3. Añade tus Gastos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8 space-y-2">
                <p>Haz clic en <span className="font-semibold">Add Expense</span> para registrar un nuevo gasto. Puedes hacerlo de dos maneras:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><span className="font-semibold">Manualmente:</span> Rellena los campos del formulario con los detalles del gasto.</li>
                  <li><span className="font-semibold">Automáticamente:</span> Usa los botones <Camera className="inline h-4 w-4" /> <span className="font-semibold">Take Photo</span> o <Upload className="inline h-4 w-4" /> <span className="font-semibold">Upload Image</span> para escanear un recibo. La IA extraerá los datos por ti.</li>
                </ul>
                <p>También puedes usar el botón de <span className="font-semibold">Auto-categorizar</span> para que la IA asigne una categoría a tu gasto.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                    <Printer className="h-5 w-5" />
                    <span className="font-semibold">4. Guarda o Imprime tu Informe</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8">
                Cuando quieras, ve a <span className="font-semibold">Acciones {'>'} Save as PDF</span> para generar una versión imprimible de tu informe de presupuesto, que incluirá el resumen y la lista completa de gastos.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                    <FilePlus className="h-5 w-5" />
                    <span className="font-semibold">5. Empieza un Nuevo Informe</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8">
                Si quieres empezar de cero, la opción <span className="font-semibold">Acciones {'>'} New Report</span> borrará todos los datos actuales. Se te pedirá confirmación para evitar borrados accidentales.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Entendido</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
