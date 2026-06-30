'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { escortMovementSchema, EscortMovementFormData } from '@/lib/schemas';

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
  escort?: { name: string; lastName: string };
}

interface EscortAssignment {
  id: string;
  officialName: string;
  destination: string;
  status: string;
}

interface EscortMovement {
  id: string;
  assignmentId?: string;
  routeId: string;
  escortId: string;
  date: string;
  startTime: string;
  startLatitude?: number;
  startLongitude?: number;
  status: string;
  observations?: string;
}

interface MovementFormProps {
  movement?: EscortMovement;
  escorts: Escort[];
  routes: EscortRoute[];
  assignments: EscortAssignment[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function MovementForm({ movement, escorts, routes, assignments, onSubmit, onCancel }: MovementFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EscortMovementFormData>({
    resolver: zodResolver(escortMovementSchema),
    defaultValues: {
      assignmentId: movement?.assignmentId || '',
      routeId: movement?.routeId || '',
      escortId: movement?.escortId || '',
      date: movement?.date ? new Date(movement.date).toISOString().split('T')[0] : '',
      startTime: movement?.startTime ? new Date(movement.startTime).toISOString().slice(0, 16) : '',
      startLatitude: movement?.startLatitude || undefined,
      startLongitude: movement?.startLongitude || undefined,
      status: (movement?.status as any) || 'SCHEDULED',
      observations: movement?.observations || '',
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
          <Label>Ruta *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('routeId')}>
            <option value="">Seleccionar ruta</option>
            {routes.filter(r => r.isActive).map((r) => (
              <option key={r.id} value={r.id}>{r.name} - {r.escort?.name} {r.escort?.lastName}</option>
            ))}
          </select>
          {errors.routeId && <p className="text-sm text-red-500">{errors.routeId.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Asignación (Opcional)</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('assignmentId')}>
            <option value="">Sin asignación</option>
            {assignments.filter(a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED').map((a) => (
              <option key={a.id} value={a.id}>{a.officialName} - {a.destination}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="SCHEDULED">Programado</option>
            <option value="STARTED">Iniciado</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="PAUSED">Pausado</option>
            <option value="COMPLETED">Completado</option>
            <option value="NO_SHOW">No Presentó</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha *</Label>
          <Input type="date" {...register('date')} />
          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
        </div>
        <div>
          <Label>Hora Inicio *</Label>
          <Input type="datetime-local" {...register('startTime')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Latitud Inicial</Label>
          <Input type="number" step="any" {...register('startLatitude')} placeholder="-90 a 90" />
        </div>
        <div>
          <Label>Longitud Inicial</Label>
          <Input type="number" step="any" {...register('startLongitude')} placeholder="-180 a 180" />
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
