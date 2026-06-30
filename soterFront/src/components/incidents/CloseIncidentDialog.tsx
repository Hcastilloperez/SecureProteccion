'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lock } from 'lucide-react';

interface CloseIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalReport: string;
  onFinalReportChange: (value: string) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export function CloseIncidentDialog({
  open,
  onOpenChange,
  finalReport,
  onFinalReportChange,
  onClose,
  isSubmitting,
}: CloseIncidentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Lock className="mr-2 h-4 w-4" />
          Cerrar Incidente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Cerrar Incidente
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> El informe final es <strong>obligatorio</strong> para cerrar el incidente.
            </p>
          </div>
          <div>
            <Label>Descripción de Acciones Realizadas *</Label>
            <Textarea
              value={finalReport}
              onChange={(e) => onFinalReportChange(e.target.value)}
              placeholder="Describa detalladamente las acciones realizadas para resolver el incidente..."
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={onClose} disabled={!finalReport.trim() || isSubmitting}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Cerrar con Informe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
