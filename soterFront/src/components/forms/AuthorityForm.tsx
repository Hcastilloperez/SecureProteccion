import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authoritySchema, AuthorityFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface AuthorityFormProps {
  defaultValues?: Partial<AuthorityFormData>;
  onSubmit: (data: AuthorityFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AUTHORITY_TYPES = [
  'Policía Nacional',
  'Ejército',
  'Bomberos',
  'Defensa Civil',
  'Cruz Roja',
  'Hospital/Clínica',
  'Protección Civil',
  'Grafica',
  'OTAN',
  'Otro',
];

export function AuthorityForm({ defaultValues, onSubmit, onCancel, isLoading }: AuthorityFormProps) {
  const form = useForm<AuthorityFormData>({
    resolver: zodResolver(authoritySchema),
    defaultValues: {
      name: '',
      type: '',
      phone: '',
      address: '',
      email: '',
      latitude: null,
      longitude: null,
      distance: null,
      responseTime: '',
      notes: '',
      isActive: true,
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre de la Autoridad *</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Ej: Estación de Policía Centro"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="type">Tipo de Autoridad *</Label>
        <Input
          id="type"
          list="authority-types"
          {...form.register('type')}
          placeholder="Ej: Policía Nacional"
        />
        <datalist id="authority-types">
          {AUTHORITY_TYPES.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
        {form.formState.errors.type && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.type.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Teléfono de Contacto *</Label>
        <Input
          id="phone"
          {...form.register('phone')}
          placeholder="Ej: 123"
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          {...form.register('address')}
          placeholder="Ej: Calle 10 #5-20"
        />
        {form.formState.errors.address && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          placeholder="Ej: estacion.centro@ policia.gov.co"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitud</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            {...form.register('latitude')}
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitud</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            {...form.register('longitude')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="distance">Distancia (km)</Label>
          <Input
            id="distance"
            type="number"
            step="0.1"
            {...form.register('distance')}
          />
        </div>
        <div>
          <Label htmlFor="responseTime">Tiempo de Respuesta</Label>
          <Input
            id="responseTime"
            {...form.register('responseTime')}
            placeholder="Ej: 10 min"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...form.register('notes')}
          placeholder="Información adicional..."
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isActive"
          checked={form.watch('isActive')}
          onCheckedChange={(checked: boolean) => form.setValue('isActive', checked)}
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Activo
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : defaultValues?.name ? 'Actualizar' : 'Agregar'}
        </Button>
      </div>
    </form>
  );
}