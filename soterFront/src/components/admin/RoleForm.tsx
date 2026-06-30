'use client';

import { useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Role, PermissionDefinition } from '@/types';
import { roleSchema, RoleFormData } from '@/lib/schemas';

interface RoleFormProps {
  role?: Role;
  permissionDefinitions: PermissionDefinition[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function RoleForm({ role, permissionDefinitions, onSubmit, onCancel }: RoleFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions || {},
    },
  });

  const permissionKeys = useMemo(() => [
    { key: 'all', label: 'Todos los permisos' },
    ...permissionDefinitions.map(p => ({ key: p.key, label: p.label })),
  ], [permissionDefinitions]);

  const permissions = watch('permissions') as Record<string, boolean>;

  const togglePermission = useCallback((key: string, checked: boolean) => {
    if (key === 'all') {
      const newPerms = checked ? Object.fromEntries(permissionDefinitions.map(p => [p.key, true])) : {};
      setValue('permissions', newPerms as any);
      return;
    }
    const current = { ...permissions };
    if (current.all === true) {
      delete current.all;
    }
    if (checked) {
      current[key] = true;
    } else {
      delete current[key];
    }
    setValue('permissions', current as any);
  }, [permissions, permissionDefinitions, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Nombre del Rol *</Label>
        <Input {...register('name')} placeholder="Ej: Coordinador de Seguridad" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <Label>Descripción</Label>
        <Input {...register('description')} placeholder="Descripción breve del rol" />
      </div>
      <div>
        <Label className="block mb-2">Permisos</Label>
        <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 max-h-80 overflow-y-auto">
          {permissionKeys.map((option) => (
            <label key={option.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  option.key === 'all'
                    ? permissions?.all === true
                    : (permissions?.all === true || (permissions?.[option.key] ?? false))
                }
                onChange={(e) => togglePermission(option.key, e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
