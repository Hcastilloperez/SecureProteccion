'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Incident, IncidentType, Installation } from '@/types';
import { incidentSchema, IncidentFormData } from '@/lib/schemas';

interface IncidentFormProps {
  incident?: Incident | null;
  incidentTypes: IncidentType[];
  installations: Installation[];
  onSubmit: (data: IncidentFormData) => void;
  onCancel: () => void;
}

export function IncidentForm({ incident, incidentTypes, installations, onSubmit, onCancel }: IncidentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: incident?.title || '',
      description: incident?.description || '',
      incidentTypeId: incident?.incidentTypeId || incidentTypes[0]?.id || '',
      installationId: incident?.installationId || installations[0]?.id || '',
      priority: incident?.priority || 'MEDIUM',
      location: incident?.location || '',
      reportedBy: incident?.reportedBy || '',
      latitude: incident?.latitude || undefined,
      longitude: incident?.longitude || undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input id="title" {...register('title')} placeholder="Breve descripción del incidente" />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Descripción *</Label>
        <Textarea id="description" {...register('description')} placeholder="Detalle completo del incidente" rows={3} />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="incidentTypeId">Tipo de Incidente *</Label>
          <select id="incidentTypeId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('incidentTypeId')}>
            <option value="">Seleccionar</option>
            {incidentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {errors.incidentTypeId && <p className="text-sm text-red-500 mt-1">{errors.incidentTypeId.message}</p>}
        </div>
        <div>
          <Label htmlFor="installationId">Instalación *</Label>
          <select id="installationId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('installationId')}>
            <option value="">Seleccionar</option>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          {errors.installationId && <p className="text-sm text-red-500 mt-1">{errors.installationId.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="priority">Prioridad</Label>
          <select id="priority" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('priority')}>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
          {errors.priority && <p className="text-sm text-red-500 mt-1">{errors.priority.message}</p>}
        </div>
        <div>
          <Label htmlFor="reportedBy">Reportado Por *</Label>
          <Input id="reportedBy" {...register('reportedBy')} placeholder="Nombre de quien reporta" />
          {errors.reportedBy && <p className="text-sm text-red-500 mt-1">{errors.reportedBy.message}</p>}
        </div>
        <div>
          <Label htmlFor="location">Ubicación</Label>
          <Input id="location" {...register('location')} placeholder="Lugar específico" />
          {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitud</Label>
          <Input id="latitude" type="number" step="any" {...register('latitude')} placeholder="-90 a 90" />
          {errors.latitude && <p className="text-sm text-red-500 mt-1">{errors.latitude.message}</p>}
        </div>
        <div>
          <Label htmlFor="longitude">Longitud</Label>
          <Input id="longitude" type="number" step="any" {...register('longitude')} placeholder="-180 a 180" />
          {errors.longitude && <p className="text-sm text-red-500 mt-1">{errors.longitude.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{incident ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </form>
  );
}
