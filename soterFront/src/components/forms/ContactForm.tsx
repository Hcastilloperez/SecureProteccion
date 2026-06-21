import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface ContactFormProps {
  defaultValues?: Partial<ContactFormData>;
  onSubmit: (data: ContactFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ContactForm({ defaultValues, onSubmit, onCancel, isLoading }: ContactFormProps) {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      position: '',
      phone: '',
      email: '',
      isEmergency: false,
      notes: '',
      ...defaultValues,
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre Completo *</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Ej: Juan Pérez"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="position">Cargo *</Label>
        <Input
          id="position"
          {...form.register('position')}
          placeholder="Ej: Gerente de Seguridad"
        />
        {form.formState.errors.position && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.position.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          {...form.register('phone')}
          placeholder="Ej: +57 300 123 4567"
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          placeholder="Ej: jperez@empresa.com"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isEmergency"
          checked={form.watch('isEmergency')}
          onCheckedChange={(checked: boolean) => form.setValue('isEmergency', checked)}
        />
        <Label htmlFor="isEmergency" className="cursor-pointer">
          Contacto de Emergencia
        </Label>
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...form.register('notes')}
          placeholder="Información adicional..."
          rows={2}
        />
        {form.formState.errors.notes && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.notes.message}</p>
        )}
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