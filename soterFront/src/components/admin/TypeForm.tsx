'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IncidentType } from '@/types';
import { incidentTypeSchema, IncidentTypeFormData } from '@/lib/schemas';

interface TypeFormProps {
  type?: IncidentType;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function TypeForm({ type, onSubmit, onCancel }: TypeFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<IncidentTypeFormData>({
    resolver: zodResolver(incidentTypeSchema),
    defaultValues: {
      code: type?.code || '',
      name: type?.name || '',
      category: (type?.category as any) || 'SEGURIDAD',
      description: type?.description || '',
      slaHours: type?.slaHours || 24,
      coordinatorType: type?.coordinatorType || undefined,
      isActive: type?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input {...register('code')} disabled={!!type} />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Categoría</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('category')}>
            <option value="SEGURIDAD">Seguridad</option>
            <option value="EMERGENCIA">Emergencia</option>
            <option value="SALUD">Salud</option>
            <option value="CONDUCTA">Conducta</option>
            <option value="DAÑOS">Daños</option>
            <option value="OPERATIVO">Operativo</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="OTROS">Otros</option>
          </select>
        </div>
        <div>
          <Label>SLA (horas) *</Label>
          <Input type="number" {...register('slaHours')} />
          {errors.slaHours && <p className="text-sm text-red-500">{errors.slaHours.message}</p>}
        </div>
      </div>
      <div>
        <Label>Coordinador Asignado</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('coordinatorType')}>
          <option value="">Ninguno</option>
          <option value="COORDINADOR_FISICA">Coordinador Seguridad Física</option>
          <option value="COORDINADOR_ELECTRONICA">Coordinador Seguridad Electrónica</option>
          <option value="COORDINADOR_INVESTIGACIONES">Coordinador Investigaciones</option>
          <option value="COORDINADOR_ADMINISTRATIVO">Coordinador Administrativo</option>
          <option value="COORDINADOR_ACCIONES_LOCALITATIVAS">Coordinador Acciones Locativas</option>
          <option value="GERENTE_SEGURIDAD">Gerente de Seguridad</option>
        </select>
      </div>
      <div>
        <Label>Descripción</Label>
        <Input {...register('description')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
