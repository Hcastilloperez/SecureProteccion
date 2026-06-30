'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Configuration } from '@/types';
import { configurationSchema, ConfigurationFormData } from '@/lib/schemas';

interface ConfigFormProps {
  config?: Configuration;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ConfigForm({ config, onSubmit, onCancel }: ConfigFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ConfigurationFormData>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      key: config?.key || '',
      value: config?.value || '',
      type: (config?.type as any) || 'string',
      description: config?.description || '',
      category: config?.category || 'general',
      isPublic: config?.isPublic ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Key *</Label>
        <Input {...register('key')} disabled={!!config} />
        {errors.key && <p className="text-sm text-red-500">{errors.key.message}</p>}
      </div>
      <div>
        <Label>Valor *</Label>
        <Input {...register('value')} />
        {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('type')}>
            <option value="string">Texto</option>
            <option value="number">Número</option>
            <option value="boolean">Booleano</option>
          </select>
        </div>
        <div>
          <Label>Categoría</Label>
          <Input {...register('category')} />
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Input {...register('description')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
