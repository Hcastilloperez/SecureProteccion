'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EquipmentType } from '@/types';

interface EquipmentTypeFormProps {
  equipmentType?: EquipmentType;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const categories = [
  { value: 'GENERAL', label: 'General' },
  { value: 'CCTV', label: 'CCTV' },
  { value: 'ACCESS_CONTROL', label: 'Control de Acceso' },
  { value: 'INTRUSION', label: 'Intrusión' },
  { value: 'FIRE', label: 'Contra Incendio' },
  { value: 'NETWORK', label: 'Redes' },
];

const systemTypes = [
  { value: 'CCTV', label: 'CCTV - Circuito Cerrado de Televisión' },
  { value: 'ACCESS_CONTROL', label: 'Control de Acceso' },
  { value: 'INTRUSION', label: 'Sistemas de Intrusión' },
  { value: 'FIRE_DETECTION', label: 'Detección de Incendio' },
  { value: 'PERIMETER', label: 'Perímetro' },
  { value: 'VIDEO_ANALYTICS', label: 'Analítica de Video' },
  { value: 'INTERCOM', label: 'Intercomunicación' },
  { value: 'NETWORK', label: 'Redes y Conectividad' },
  { value: 'GENERAL', label: 'General/Otro' },
];

export function EquipmentTypeForm({ equipmentType, onSubmit, onCancel }: EquipmentTypeFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      code: equipmentType?.code || '',
      name: equipmentType?.name || '',
      description: equipmentType?.description || '',
      category: equipmentType?.category || 'GENERAL',
      systemType: equipmentType?.systemType || 'CCTV',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código *</Label>
          <Input {...register('code')} placeholder="Ej: CAM-IP, DVR, CONT-AC" disabled={!!equipmentType} />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} placeholder="Ej: Cámara IP, DVR, Lector QR" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Categoría *</Label>
          <select {...register('category')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Tipo de Sistema *</Label>
          <select {...register('systemType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {systemTypes.map((sys) => (
              <option key={sys.value} value={sys.value}>{sys.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Input {...register('description')} placeholder="Descripción detallada del tipo de equipo" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
