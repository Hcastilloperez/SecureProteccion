import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { maintenanceSchema, MaintenanceFormData } from '@/lib/schemas';

interface SecuritySystem {
  id: string;
  name: string;
}

interface ElectronicMaintenanceFormProps {
  maintenance?: Partial<MaintenanceFormData & { id: string; securitySystem?: { id: string; name: string } }>;
  systems: SecuritySystem[];
  onSubmit: (data: MaintenanceFormData) => void;
  onCancel: () => void;
}

export function ElectronicMaintenanceForm({ maintenance, systems, onSubmit, onCancel }: ElectronicMaintenanceFormProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: maintenance?.title || '',
      type: maintenance?.type || '',
      frequency: maintenance?.frequency || '',
      status: (maintenance?.status as any) || 'SCHEDULED',
      scheduledDate: maintenance?.scheduledDate ? new Date(maintenance.scheduledDate).toISOString().split('T')[0] : '',
      completedDate: maintenance?.completedDate ? new Date(maintenance.completedDate).toISOString().split('T')[0] : '',
      cost: maintenance?.cost,
      provider: maintenance?.provider || '',
      notes: '',
      securitySystemId: maintenance?.securitySystem?.id || systems[0]?.id || '',
      equipmentId: undefined,
    },
  });

  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Título *</Label>
        <Input {...register('title')} />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo *</Label>
          <Input {...register('type')} placeholder="Preventivo, Correctivo" />
          {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
        </div>
        <div>
          <Label>Frecuencia *</Label>
          <Input {...register('frequency')} placeholder="Mensual, Trimestral" />
          {errors.frequency && <p className="text-sm text-red-500">{errors.frequency.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha Programada *</Label>
          <Input type="date" {...register('scheduledDate')} />
          {errors.scheduledDate && <p className="text-sm text-red-500">{errors.scheduledDate.message}</p>}
        </div>
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="SCHEDULED">Programado</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>
      {status === 'COMPLETED' && (
        <div>
          <Label>Fecha de Completado</Label>
          <Input type="date" {...register('completedDate')} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Costo (COP)</Label>
          <Input type="number" {...register('cost')} placeholder="0" />
        </div>
        <div>
          <Label>Proveedor</Label>
          <Input {...register('provider')} />
        </div>
      </div>
      <div>
        <Label>Sistema</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('securitySystemId')}>
          <option value="">Seleccionar</option>
          {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
