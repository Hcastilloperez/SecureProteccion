import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { installationSchema, InstallationFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InstallationFormProps {
  defaultValues?: Partial<InstallationFormData>;
  onSubmit: (data: InstallationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function InstallationForm({ defaultValues, onSubmit, onCancel, isLoading }: InstallationFormProps) {
  const form = useForm<InstallationFormData>({
    resolver: zodResolver(installationSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      department: '',
      latitude: null,
      longitude: null,
      description: '',
      status: 'ACTIVE',
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre de la Instalación *</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Ej: Edificio Corporativo Principal"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Dirección *</Label>
        <Input
          id="address"
          {...form.register('address')}
          placeholder="Ej: Av. Principal #123"
        />
        {form.formState.errors.address && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ciudad *</Label>
          <Input
            id="city"
            {...form.register('city')}
            placeholder="Ej: Bogotá"
          />
          {form.formState.errors.city && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="department">Departamento *</Label>
          <Input
            id="department"
            {...form.register('department')}
            placeholder="Ej: Cundinamarca"
          />
          {form.formState.errors.department && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.department.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitud</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            {...form.register('latitude')}
            placeholder="Ej: 4.7110"
          />
          {form.formState.errors.latitude && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.latitude.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="longitude">Longitud</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            {...form.register('longitude')}
            placeholder="Ej: -74.0721"
          />
          {form.formState.errors.longitude && (
            <p className="text-sm text-destructive mt-1">{form.formState.errors.longitude.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Descripción detallada de la instalación..."
          rows={3}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="status">Estado</Label>
        <Select
          value={form.watch('status')}
          onValueChange={(value) => form.setValue('status', value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Activa</SelectItem>
            <SelectItem value="INACTIVE">Inactiva</SelectItem>
            <SelectItem value="IN_MAINTENANCE">En Mantenimiento</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.status && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : defaultValues?.name ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}