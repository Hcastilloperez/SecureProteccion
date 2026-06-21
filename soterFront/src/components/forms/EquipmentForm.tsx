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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre del Equipo *</Label>
          <Input {...register('name')} placeholder="Ej: Cámara IP Principal" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Tipo de Equipo *</Label>
          {showAllFields && equipmentTypes.length > 0 ? (
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('equipmentTypeId')}
            >
              <option value="">Seleccione un tipo de equipo</option>
              {equipmentTypes.filter(et => et.isActive).map((et) => (
                <option key={et.id} value={et.id}>{et.name} ({et.code})</option>
              ))}
            </select>
          ) : (
            <Input {...register('type')} placeholder="Ej: Cámara, DVR, Control de acceso" />
          )}
          {errors.equipmentTypeId && <p className="text-sm text-red-500">{errors.equipmentTypeId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Marca</Label>
          <Input {...register('brand')} />
        </div>
        <div>
          <Label>Modelo</Label>
          <Input {...register('model')} />
        </div>
        <div>
          <Label>Serial</Label>
          <Input {...register('serialNumber')} />
        </div>
      </div>

      {(showContract || showAllFields) && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contrato de Inversión</Label>
              <select
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
              <Label>Fecha de Entrega</Label>
              <Input type="date" {...register('deliveryDate')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de Compra</Label>
              <Input type="date" {...register('purchaseDate')} />
            </div>
            <div>
              <Label>Costo (COP)</Label>
              <Input type="number" {...register('specifications.cost')} placeholder="0" />
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Estado</Label>
          <select
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
          <Label>Ubicación (Texto)</Label>
          <Input {...register('location')} placeholder="Ej: Bodega Central" />
        </div>
      </div>

      {showAllFields && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>IP</Label>
              <Input {...register('ipAddress')} placeholder="192.168.1.100" />
            </div>
            <div>
              <Label>MAC</Label>
              <Input {...register('macAddress')} placeholder="00:00:00:00:00:00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Versión Firmware</Label>
              <Input {...register('firmwareVersion')} placeholder="Ej: v2.1.0" />
            </div>
            <div>
              <Label>Fecha Vencimiento</Label>
              <Input type="date" {...register('expirationDate')} />
            </div>
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea {...register('notes')} rows={3} placeholder="Notas adicionales..." />
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
