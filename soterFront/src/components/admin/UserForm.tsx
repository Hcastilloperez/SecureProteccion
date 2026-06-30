'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { userSchema, UserFormData } from '@/lib/schemas';

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      name: user?.name || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      role: (user?.role as any) || 'OPERADOR_CENTRO',
      password: undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Email *</Label>
        <Input type="email" {...register('email')} disabled={!!user} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      {!user && (
        <div>
          <Label>Contraseña *</Label>
          <Input type="password" {...register('password')} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
      )}
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
          <Label>Teléfono</Label>
          <Input {...register('phone')} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <Label>Rol *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('role')}>
            <option value="ADMIN">Administrador</option>
            <option value="GERENTE_SEGURIDAD">Gerente de Seguridad</option>
            <option value="OPERADOR_CENTRO">Operador Centro</option>
            <option value="COORDINADOR_FISICA">Coordinador Seguridad Física</option>
            <option value="COORDINADOR_ELECTRONICA">Coordinador Seguridad Electrónica</option>
            <option value="COORDINADOR_INVESTIGACIONES">Coordinador Investigaciones</option>
            <option value="COORDINADOR_ADMINISTRATIVO">Coordinador Administrativo</option>
            <option value="COORDINADOR_ACCIONES_LOCALITATIVAS">Coordinador Acciones Locativas</option>
            <option value="ESCOLTA">Escolta</option>
            <option value="VIGILANTE">Vigilante</option>
          </select>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
