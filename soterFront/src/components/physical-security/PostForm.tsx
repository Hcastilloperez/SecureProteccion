'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { securityPostSchema, SecurityPostFormData } from '@/lib/schemas';

interface Installation {
  id: string;
  name: string;
}

interface SecurityCompany {
  id: string;
  name: string;
}

interface SecurityPost {
  id: string;
  name: string;
  description?: string;
  schedule?: string;
  guardsRequired: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  isAdditional: boolean;
  startDate?: string;
  endDate?: string;
  company: { id: string; name: string };
  installation: { id: string; name: string };
}

interface PostFormProps {
  post?: SecurityPost;
  companies: SecurityCompany[];
  installations: Installation[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PostForm({ post, companies, installations, onSubmit, onCancel }: PostFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityPostFormData>({
    resolver: zodResolver(securityPostSchema),
    defaultValues: {
      name: post?.name || '',
      description: post?.description || '',
      schedule: post?.schedule || '',
      guardsRequired: post?.guardsRequired || 1,
      status: (post?.status as any) || 'PENDING',
      companyId: post?.company?.id || '',
      installationId: post?.installation?.id || '',
      startDate: post?.startDate ? new Date(post.startDate).toISOString().split('T')[0] : '',
      endDate: post?.endDate ? new Date(post.endDate).toISOString().split('T')[0] : '',
      isAdditional: post?.isAdditional ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre del Puesto *</Label>
          <Input {...register('name')} placeholder="Ej: Entrada Principal" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Vigilantes Requeridos *</Label>
          <Input type="number" {...register('guardsRequired')} />
          {errors.guardsRequired && <p className="text-sm text-red-500">{errors.guardsRequired.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Empresa *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('companyId')}>
            <option value="">Seleccionar empresa</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.companyId && <p className="text-sm text-red-500">{errors.companyId.message}</p>}
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Horario</Label>
          <Input {...register('schedule')} placeholder="Ej: 8x8, 12x12" />
        </div>
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="PENDING">Pendiente</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="SUSPENDED">Suspendido</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha Inicio</Label>
          <Input type="date" {...register('startDate')} />
        </div>
        <div>
          <Label>Fecha Fin Tentativa</Label>
          <Input type="date" {...register('endDate')} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register('isAdditional')} className="w-4 h-4" />
        <Label>Puesto adicional al contrato</Label>
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea {...register('description')} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
