'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { escortSchema, EscortFormData } from '@/lib/schemas';

interface Escort {
  id: string;
  documentType: string;
  documentNumber: string;
  name: string;
  lastName: string;
  phone: string;
  email?: string;
  position: string;
  licenseType?: string;
  licenseNumber?: string;
  isActive: boolean;
  observations?: string;
}

interface EscortFormProps {
  escort?: Escort;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function EscortForm({ escort, onSubmit, onCancel }: EscortFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EscortFormData>({
    resolver: zodResolver(escortSchema),
    defaultValues: {
      documentType: (escort?.documentType as any) || 'CC',
      documentNumber: escort?.documentNumber || '',
      name: escort?.name || '',
      lastName: escort?.lastName || '',
      phone: escort?.phone || '',
      email: escort?.email || '',
      position: escort?.position || '',
      licenseType: escort?.licenseType || '',
      licenseNumber: escort?.licenseNumber || '',
      isActive: escort?.isActive ?? true,
      observations: escort?.observations || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo Documento</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('documentType')}>
            <option value="CC">Cédula</option>
            <option value="CE">Cédula Extranjería</option>
            <option value="PP">Pasaporte</option>
          </select>
        </div>
        <div>
          <Label>Número Documento *</Label>
          <Input {...register('documentNumber')} />
          {errors.documentNumber && <p className="text-sm text-red-500">{errors.documentNumber.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Apellido *</Label>
          <Input {...register('lastName')} />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Teléfono *</Label>
          <Input {...register('phone')} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cargo *</Label>
          <Input {...register('position')} />
          {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
        </div>
        <div>
          <Label>Tipo Licencia</Label>
          <Input {...register('licenseType')} placeholder="Ej: A1, B1" />
        </div>
      </div>
      <div>
        <Label>Número Licencia</Label>
        <Input {...register('licenseNumber')} />
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
