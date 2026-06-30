import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { securitySystemSchema, SecuritySystemFormData } from '@/lib/schemas';

interface ElectronicSystemFormProps {
  system?: Partial<SecuritySystemFormData & { id: string }>;
  installationId?: string;
  onSubmit: (data: SecuritySystemFormData) => void;
  onCancel: () => void;
}

export function ElectronicSystemForm({ system, installationId, onSubmit, onCancel }: ElectronicSystemFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecuritySystemFormData>({
    resolver: zodResolver(securitySystemSchema),
    defaultValues: {
      name: system?.name || '',
      type: system?.type || '',
      description: system?.description || '',
      installationDate: system?.installationDate ? new Date(system.installationDate).toISOString().split('T')[0] : '',
      isActive: system?.isActive ?? true,
      installationId: system?.installationId || installationId || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Tipo de Sistema *</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('type')}>
          <option value="">Seleccionar tipo</option>
          <option value="CCTV">CCTV - Circuito Cerrado de Televisión</option>
          <option value="CONTROL_ACCESO">Control de Acceso</option>
          <option value="INTRUSION">Intrusión / Alarmas</option>
          <option value="FIRE">Detección de Incendio</option>
          <option value="VIDEOWALL">Videowall</option>
          <option value="CITOFONIA">Citofonía</option>
          <option value="RONDAS">Rondas</option>
          <option value="OTRO">Otro</option>
        </select>
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre del Sistema</Label>
          <Input {...register('name')} placeholder="Ej: CCTV Principal" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Fecha de Instalación</Label>
          <Input type="date" {...register('installationDate')} />
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea {...register('description')} rows={3} placeholder="Descripción detallada del sistema..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
