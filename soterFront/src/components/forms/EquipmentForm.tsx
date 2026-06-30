import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { equipmentSchema, EquipmentFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InvestmentContract, EquipmentType } from '@/types';

interface EquipmentFormProps {
  equipment?: any;
  onSubmit: (data: EquipmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  contracts?: InvestmentContract[];
  equipmentTypes?: EquipmentType[];
  showContract?: boolean;
  showAllFields?: boolean;
}

export function EquipmentForm({
  equipment,
  onSubmit,
  onCancel,
  isLoading,
  contracts = [],
  equipmentTypes = [],
  showContract = false,
  showAllFields = false,
}: EquipmentFormProps) {
  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: '',
      type: '',
      brand: '',
      model: '',
      serialNumber: '',
      status: 'STANDBY',
      location: '',
      latitude: undefined,
      longitude: undefined,
      ipAddress: '',
      macAddress: '',
      specifications: { cost: undefined },
      firmwareVersion: '',
      expirationDate: '',
      notes: '',
      purchaseDate: '',
      deliveryDate: '',
      investmentContractId: '',
      installationId: '',
      securitySystemId: '',
      equipmentTypeId: '',
      ...(equipment ? {
        name: equipment.name || '',
        type: equipment.type || '',
        brand: equipment.brand || '',
        model: equipment.model || '',
        serialNumber: equipment.serialNumber || '',
        status: equipment.status || 'STANDBY',
        location: equipment.location || '',
        latitude: equipment.latitude || undefined,
        longitude: equipment.longitude || undefined,
        ipAddress: equipment.ipAddress || '',
        macAddress: equipment.macAddress || '',
        specifications: { cost: equipment.specifications?.cost },
        firmwareVersion: equipment.firmwareVersion || '',
        expirationDate: equipment.expirationDate ? new Date(equipment.expirationDate).toISOString().split('T')[0] : '',
        notes: equipment.notes || '',
        purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().split('T')[0] : '',
        deliveryDate: equipment.deliveryDate ? new Date(equipment.deliveryDate).toISOString().split('T')[0] : '',
        investmentContractId: equipment.investmentContractId || '',
        installationId: equipment.installationId || '',
        securitySystemId: equipment.securitySystemId || '',
        equipmentTypeId: equipment.equipmentTypeId || '',
      } : {}),
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const selectedEquipmentTypeId = watch('equipmentTypeId');

  useEffect(() => {
    if (selectedEquipmentTypeId && equipmentTypes.length > 0) {
      const selectedType = equipmentTypes.find(et => et.id === selectedEquipmentTypeId);
      if (selectedType) {
        setValue('type', selectedType.systemType);
      }
    }
  }, [selectedEquipmentTypeId, equipmentTypes, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Formulario de equipo">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="equipment-name">Nombre del Equipo *</Label>
          <Input id="equipment-name" {...register('name')} placeholder="Ej: Cámara IP Principal" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'equipment-name-error' : undefined} />
          {errors.name && <p id="equipment-name-error" className="text-sm text-red-500" role="alert">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="equipment-type">Tipo de Equipo *</Label>
          {showAllFields && equipmentTypes.length > 0 ? (
            <select
              id="equipment-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('equipmentTypeId')}
              aria-invalid={!!errors.equipmentTypeId}
              aria-describedby={errors.equipmentTypeId ? 'equipment-type-error' : undefined}
            >
              <option value="">Seleccione un tipo de equipo</option>
              {equipmentTypes.filter(et => et.isActive).map((et) => (
                <option key={et.id} value={et.id}>{et.name} ({et.code})</option>
              ))}
            </select>
          ) : (
            <Input id="equipment-type" {...register('type')} placeholder="Ej: Cámara, DVR, Control de acceso" />
          )}
          {errors.equipmentTypeId && <p id="equipment-type-error" className="text-sm text-red-500" role="alert">{errors.equipmentTypeId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="equipment-brand">Marca</Label>
          <Input id="equipment-brand" {...register('brand')} />
        </div>
        <div>
          <Label htmlFor="equipment-model">Modelo</Label>
          <Input id="equipment-model" {...register('model')} />
        </div>
        <div>
          <Label htmlFor="equipment-serial">Serial</Label>
          <Input id="equipment-serial" {...register('serialNumber')} aria-invalid={!!errors.serialNumber} aria-describedby={errors.serialNumber ? 'equipment-serial-error' : undefined} />
          {errors.serialNumber && <p id="equipment-serial-error" className="text-sm text-red-500" role="alert">{errors.serialNumber.message}</p>}
        </div>
      </div>

      {(showContract || showAllFields) && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipment-contract">Contrato de Inversión</Label>
              <select
                id="equipment-contract"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register('investmentContractId')}
              >
                <option value="">Sin contrato</option>
                {contracts.filter(c => c.status === 'ACTIVE').map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="equipment-delivery">Fecha de Entrega</Label>
              <Input id="equipment-delivery" type="date" {...register('deliveryDate')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipment-purchase">Fecha de Compra</Label>
              <Input id="equipment-purchase" type="date" {...register('purchaseDate')} />
            </div>
            <div>
              <Label htmlFor="equipment-cost">Costo (COP)</Label>
              <Input id="equipment-cost" type="number" {...register('specifications.cost')} placeholder="0" />
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="equipment-status">Estado</Label>
          <select
            id="equipment-status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('status')}
          >
            <option value="STANDBY">Standby/Bodega</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="IN_REPAIR">En Reparación</option>
            <option value="DECOMMISSIONED">Dado de Baja</option>
          </select>
        </div>
        <div>
          <Label htmlFor="equipment-location">Ubicación (Texto)</Label>
          <Input id="equipment-location" {...register('location')} placeholder="Ej: Bodega Central" />
        </div>
      </div>

      {showAllFields && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipment-ip">IP</Label>
              <Input id="equipment-ip" {...register('ipAddress')} placeholder="192.168.1.100" aria-invalid={!!errors.ipAddress} aria-describedby={errors.ipAddress ? 'equipment-ip-error' : undefined} />
              {errors.ipAddress && <p id="equipment-ip-error" className="text-sm text-red-500" role="alert">{errors.ipAddress.message}</p>}
            </div>
            <div>
              <Label htmlFor="equipment-mac">MAC</Label>
              <Input id="equipment-mac" {...register('macAddress')} placeholder="00:00:00:00:00:00" aria-invalid={!!errors.macAddress} aria-describedby={errors.macAddress ? 'equipment-mac-error' : undefined} />
              {errors.macAddress && <p id="equipment-mac-error" className="text-sm text-red-500" role="alert">{errors.macAddress.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipment-firmware">Versión Firmware</Label>
              <Input id="equipment-firmware" {...register('firmwareVersion')} placeholder="Ej: v2.1.0" />
            </div>
            <div>
              <Label htmlFor="equipment-expiration">Fecha Vencimiento</Label>
              <Input id="equipment-expiration" type="date" {...register('expirationDate')} />
            </div>
          </div>
          <div>
            <Label htmlFor="equipment-notes">Notas</Label>
            <Textarea id="equipment-notes" {...register('notes')} rows={3} placeholder="Notas adicionales..." />
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : equipment?.id ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
