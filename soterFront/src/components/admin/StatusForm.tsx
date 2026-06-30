'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Status } from '@/types';
import { statusSchema, StatusFormData } from '@/lib/schemas';

interface StatusFormProps {
  status?: Status;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function StatusForm({ status, onSubmit, onCancel }: StatusFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      code: status?.code || '',
      name: status?.name || '',
      type: 'INCIDENT',
      description: status?.description || '',
      isActive: status?.isActive ?? true,
      order: status?.order || 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input {...register('code')} disabled={!!status} />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
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
