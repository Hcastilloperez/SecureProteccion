'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { securityGuardSchema, SecurityGuardFormData } from '@/lib/schemas';

interface Installation {
  id: string;
  name: string;
}

interface SecurityPost {
  id: string;
  name: string;
  status: string;
  company: { id: string; name: string };
}

interface SecurityGuard {
  id: string;
  documentType: string;
  documentNumber: string;
  name: string;
  lastName: string;
  phone: string;
  email?: string;
  position: string;
  schedule?: string;
  isActive: boolean;
  installation?: { id: string };
  securityPost?: { id: string };
}

interface GuardFormProps {
  guard?: SecurityGuard;
  posts: SecurityPost[];
  installations: Installation[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function GuardForm({ guard, posts, installations, onSubmit, onCancel }: GuardFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityGuardFormData>({
    resolver: zodResolver(securityGuardSchema),
    defaultValues: {
      documentType: (guard?.documentType as any) || 'CC',
      documentNumber: guard?.documentNumber || '',
      name: guard?.name || '',
      lastName: guard?.lastName || '',
      phone: guard?.phone || '',
      email: guard?.email || '',
      position: guard?.position || '',
      securityPostId: guard?.securityPost?.id || '',
      schedule: guard?.schedule || '',
      installationId: guard?.installation?.id || '',
      isActive: guard?.isActive ?? true,
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
            <option value="NIT">NIT</option>
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
      <div>
        <Label>Cargo *</Label>
        <Input {...register('position')} placeholder="Ej: Vigilante, Supervisor" />
        {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Puesto de Vigilancia</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('securityPostId')}>
            <option value="">Sin puesto asignado</option>
            {posts.filter(p => p.status === 'ACTIVE').map((p) => (
              <option key={p.id} value={p.id}>{p.name} - {p.company.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Instalación *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('installationId')}>
            <option value="">Seleccionar instalación</option>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          {errors.installationId && <p className="text-sm text-red-500">{errors.installationId.message}</p>}
        </div>
      </div>
      <div>
        <Label>Horario</Label>
        <Input {...register('schedule')} placeholder="Ej: 8x8, Turno A" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
