'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { escortRouteSchema, EscortRouteFormData } from '@/lib/schemas';

interface Escort {
  id: string;
  name: string;
  lastName: string;
  isActive: boolean;
}

interface Installation {
  id: string;
  name: string;
}

interface EscortRoute {
  id: string;
  name: string;
  description?: string;
  escortId: string;
  installationId?: string;
  distance?: number;
  estimatedTime?: number;
  isActive: boolean;
}

interface RouteFormProps {
  route?: EscortRoute;
  escorts: Escort[];
  installations: Installation[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function RouteForm({ route, escorts, installations, onSubmit, onCancel }: RouteFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EscortRouteFormData>({
    resolver: zodResolver(escortRouteSchema),
    defaultValues: {
      name: route?.name || '',
      description: route?.description || '',
      escortId: route?.escortId || '',
      installationId: route?.installationId || '',
      distance: route?.distance || undefined,
      estimatedTime: route?.estimatedTime || undefined,
      isActive: route?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Nombre de la Ruta *</Label>
        <Input {...register('name')} placeholder="Ej: Ruta Norte - Centro" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea {...register('description')} rows={2} />
      </div>
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
          <Label>Instalación</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('installationId')}>
            <option value="">Ninguna</option>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Distancia (km)</Label>
          <Input type="number" step="0.1" {...register('distance')} />
        </div>
        <div>
          <Label>Tiempo Estimado (min)</Label>
          <Input type="number" {...register('estimatedTime')} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
