'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { securityCompanySchema, SecurityCompanyFormData } from '@/lib/schemas';

interface CompanyFormProps {
  company?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function CompanyForm({ company, onSubmit, onCancel }: CompanyFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityCompanyFormData>({
    resolver: zodResolver(securityCompanySchema),
    defaultValues: {
      name: company?.name || '',
      nit: company?.nit || '',
      legalRepresentative: company?.legalRepresentative || '',
      contractNumber: company?.contractNumber || '',
      contractStartDate: company?.contractStartDate ? new Date(company.contractStartDate).toISOString().split('T')[0] : '',
      contractEndDate: company?.contractEndDate ? new Date(company.contractEndDate).toISOString().split('T')[0] : '',
      contractAmount: company?.contractAmount || undefined,
      phone: company?.phone || '',
      email: company?.email || '',
      address: company?.address || '',
      isActive: company?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre de la Empresa *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>NIT *</Label>
          <Input {...register('nit')} />
          {errors.nit && <p className="text-sm text-red-500">{errors.nit.message}</p>}
        </div>
      </div>
      <div>
        <Label>Representante Legal</Label>
        <Input {...register('legalRepresentative')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Número de Contrato</Label>
          <Input {...register('contractNumber')} />
        </div>
        <div>
          <Label>Valor del Contrato (COP)</Label>
          <Input type="number" {...register('contractAmount')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha Inicio Contrato</Label>
          <Input type="date" {...register('contractStartDate')} />
        </div>
        <div>
          <Label>Fecha Fin Contrato</Label>
          <Input type="date" {...register('contractEndDate')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Teléfono</Label>
          <Input {...register('phone')} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} />
        </div>
      </div>
      <div>
        <Label>Dirección</Label>
        <Input {...register('address')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
