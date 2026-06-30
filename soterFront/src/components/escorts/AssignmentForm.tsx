'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { escortAssignmentSchema, EscortAssignmentFormData } from '@/lib/schemas';

interface Escort {
  id: string;
  name: string;
  lastName: string;
  isActive: boolean;
}

interface EscortRoute {
  id: string;
  name: string;
  isActive: boolean;
}

interface EscortAssignment {
  id: string;
  escortId: string;
  routeId?: string;
  officialName: string;
  officialDocument: string;
  officialPhone?: string;
  officialPosition?: string;
  destination: string;
  startDate: string;
  endDate?: string;
  status: string;
  observations?: string;
}

interface AssignmentFormProps {
  assignment?: EscortAssignment;
  escorts: Escort[];
  routes: EscortRoute[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AssignmentForm({ assignment, escorts, routes, onSubmit, onCancel }: AssignmentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EscortAssignmentFormData>({
    resolver: zodResolver(escortAssignmentSchema),
    defaultValues: {
      escortId: assignment?.escortId || '',
      routeId: assignment?.routeId || '',
      officialName: assignment?.officialName || '',
      officialDocument: assignment?.officialDocument || '',
      officialPhone: assignment?.officialPhone || '',
      officialPosition: assignment?.officialPosition || '',
      destination: assignment?.destination || '',
      startDate: assignment?.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : '',
      endDate: assignment?.endDate ? new Date(assignment.endDate).toISOString().split('T')[0] : '',
      status: (assignment?.status as any) || 'PENDING',
      observations: assignment?.observations || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Escolta *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('escortId')}>
            <option value="">Seleccionar escolta</option>
            {escorts.filter(e => e.isActive).map((e) => (
              <option key={e.id} value={e.id}>{e.name} {e.lastName}</option>
            ))}
          </select>
          {errors.escortId && <p className="text-sm text-red-500">{errors.escortId.message}</p>}
        </div>
        <div>
          <Label>Ruta</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('routeId')}>
            <option value="">Sin ruta específica</option>
            {routes.filter(r => r.isActive).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre del Funcionario *</Label>
          <Input {...register('officialName')} placeholder="Nombre completo" />
          {errors.officialName && <p className="text-sm text-red-500">{errors.officialName.message}</p>}
        </div>
        <div>
          <Label>Documento del Funcionario *</Label>
          <Input {...register('officialDocument')} placeholder="Número de documento" />
          {errors.officialDocument && <p className="text-sm text-red-500">{errors.officialDocument.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Teléfono del Funcionario</Label>
          <Input {...register('officialPhone')} />
        </div>
        <div>
          <Label>Cargo del Funcionario</Label>
          <Input {...register('officialPosition')} />
        </div>
      </div>
      <div>
        <Label>Destino *</Label>
        <Input {...register('destination')} placeholder="Dirección o lugar de destino" />
        {errors.destination && <p className="text-sm text-red-500">{errors.destination.message}</p>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Fecha/Hora Inicio *</Label>
          <Input type="datetime-local" {...register('startDate')} />
          {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
        </div>
        <div>
          <Label>Fecha/Hora Fin</Label>
          <Input type="datetime-local" {...register('endDate')} />
        </div>
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Notas</Label>
        <Textarea {...register('observations')} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
