import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Equipment, SecuritySystem, EquipmentType } from '@/types';
import { Search, Monitor, Check, Wifi, Hash, Cpu } from 'lucide-react';
import api from '@/config/axios';

const equipmentAssignmentSchema = z.object({
  securitySystemId: z.string().min(1, 'Seleccione un subsistema'),
  location: z.string().min(1, 'La ubicación es requerida'),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  ipAddress: z.string().ip('Dirección IP inválida').optional().or(z.literal('')),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/, 'MAC inválida (formato: 00:00:00:00:00:00)').optional().or(z.literal('')),
  firmwareVersion: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

type EquipmentAssignmentFormData = z.infer<typeof equipmentAssignmentSchema>;

interface EquipmentInstallationFormProps {
  equipment: Equipment;
  systems: SecuritySystem[];
  equipmentTypes: EquipmentType[];
  onSubmit: (data: EquipmentAssignmentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  preselectedSystemId?: string;
}

export function EquipmentInstallationForm({
  equipment,
  systems,
  equipmentTypes,
  onSubmit,
  onCancel,
  isLoading,
  preselectedSystemId,
}: EquipmentInstallationFormProps) {
  const form = useForm<EquipmentAssignmentFormData>({
    resolver: zodResolver(equipmentAssignmentSchema),
    defaultValues: {
      securitySystemId: preselectedSystemId || equipment.securitySystemId || '',
      location: equipment.location || '',
      latitude: equipment.latitude || undefined,
      longitude: equipment.longitude || undefined,
      ipAddress: equipment.ipAddress || '',
      macAddress: equipment.macAddress || '',
      firmwareVersion: equipment.firmwareVersion || '',
      notes: equipment.notes || '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const equipmentType = equipment.equipmentTypeId
    ? equipmentTypes.find(et => et.id === equipment.equipmentTypeId)
    : equipmentTypes.find(et => et.systemType === equipment.type);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Formulario de instalación de equipo">
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Monitor className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="font-medium">{equipment.name}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>{equipmentType?.name || equipment.type} | {equipment.brand} {equipment.model}</p>
          {equipment.serialNumber && <p>Serial: {equipment.serialNumber}</p>}
        </div>
      </div>

      {preselectedSystemId ? (
        <div className="p-3 bg-muted rounded-lg" role="status">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            <span className="font-medium">Sistema Destino:</span>
          </div>
          <p className="font-medium">{systems.find(s => s.id === preselectedSystemId)?.name}</p>
          <p className="text-sm text-muted-foreground">
            {systems.find(s => s.id === preselectedSystemId)?.type}
          </p>
        </div>
      ) : (
        <div>
          <Label htmlFor="install-security-system">Subsistema de Seguridad *</Label>
          <select
            id="install-security-system"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            {...register('securitySystemId')}
            aria-invalid={!!errors.securitySystemId}
            aria-describedby={errors.securitySystemId ? 'install-security-system-error' : undefined}
          >
            <option value="">Seleccione un subsistema</option>
            {systems.map((sys) => (
              <option key={sys.id} value={sys.id}>{sys.name} ({sys.type})</option>
            ))}
          </select>
          {errors.securitySystemId && <p id="install-security-system-error" className="text-sm text-red-500" role="alert">{errors.securitySystemId.message}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="install-location">Ubicación en Instalación *</Label>
        <Input id="install-location" {...register('location')} placeholder="Ej: Entrada Principal - Lado Derecho" aria-invalid={!!errors.location} aria-describedby={errors.location ? 'install-location-error' : undefined} />
        {errors.location && <p id="install-location-error" className="text-sm text-red-500" role="alert">{errors.location.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="install-latitude">Latitud</Label>
          <Input id="install-latitude" type="number" step="any" {...register('latitude')} placeholder="4.7110" />
        </div>
        <div>
          <Label htmlFor="install-longitude">Longitud</Label>
          <Input id="install-longitude" type="number" step="any" {...register('longitude')} placeholder="-74.0721" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="install-ip">
            <span className="flex items-center gap-1">
              <Wifi className="h-4 w-4" aria-hidden="true" /> IP
            </span>
          </Label>
          <Input id="install-ip" {...register('ipAddress')} placeholder="192.168.1.100" aria-invalid={!!errors.ipAddress} aria-describedby={errors.ipAddress ? 'install-ip-error' : undefined} />
          {errors.ipAddress && <p id="install-ip-error" className="text-sm text-red-500" role="alert">{errors.ipAddress.message}</p>}
        </div>
        <div>
          <Label htmlFor="install-mac">
            <span className="flex items-center gap-1">
              <Hash className="h-4 w-4" aria-hidden="true" /> MAC
            </span>
          </Label>
          <Input id="install-mac" {...register('macAddress')} placeholder="00:00:00:00:00:00" aria-invalid={!!errors.macAddress} aria-describedby={errors.macAddress ? 'install-mac-error' : undefined} />
          {errors.macAddress && <p id="install-mac-error" className="text-sm text-red-500" role="alert">{errors.macAddress.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="install-firmware">
          <span className="flex items-center gap-1">
            <Cpu className="h-4 w-4" aria-hidden="true" /> Versión Firmware
          </span>
        </Label>
        <Input id="install-firmware" {...register('firmwareVersion')} placeholder="Ej: v2.1.0" />
      </div>

      <div>
        <Label htmlFor="install-notes">Notas de Instalación</Label>
        <Textarea id="install-notes" {...register('notes')} rows={3} placeholder="Notas sobre la instalación..." />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Instalar Equipo'}
        </Button>
      </div>
    </form>
  );
}

interface EquipmentSelectorFormProps {
  systems: SecuritySystem[];
  equipmentTypes: EquipmentType[];
  onSubmit: (data: { equipmentId: string; securitySystemId: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  preselectedSystemId?: string;
}

export function EquipmentSelectorForm({
  systems,
  equipmentTypes,
  onSubmit,
  onCancel,
  isLoading,
  preselectedSystemId,
}: EquipmentSelectorFormProps) {
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [selectedSystemId, setSelectedSystemId] = useState<string>(preselectedSystemId || '');
  const [filterEquipmentType, setFilterEquipmentType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);

  useEffect(() => {
    fetchAvailableEquipment();
  }, [filterEquipmentType]);

  const fetchAvailableEquipment = async () => {
    setIsLoadingEquipment(true);
    try {
      const params: any = { installationId: 'available' };
      if (filterEquipmentType) params.equipmentTypeId = filterEquipmentType;
      const response = await api.get('/electronic-security/equipments', { params });
      if (response.data.success) {
        setAvailableEquipment(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching available equipment:', error);
    } finally {
      setIsLoadingEquipment(false);
    }
  };

  const filteredEquipment = availableEquipment.filter((eq) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      eq.name.toLowerCase().includes(query) ||
      eq.type.toLowerCase().includes(query) ||
      (eq.brand && eq.brand.toLowerCase().includes(query)) ||
      (eq.model && eq.model.toLowerCase().includes(query)) ||
      (eq.serialNumber && eq.serialNumber.toLowerCase().includes(query))
    );
  });

  const selectedEquipment = availableEquipment.find((eq) => eq.id === selectedEquipmentId);

  const handleSubmit = async () => {
    if (!selectedEquipmentId || !selectedSystemId) {
      alert('Seleccione un equipo y un subsistema');
      return;
    }
    await onSubmit({
      equipmentId: selectedEquipmentId,
      securitySystemId: selectedSystemId,
    });
  };

  return (
    <div className="space-y-4" role="form" aria-label="Selector de equipo">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="selector-filter-type">Filtrar por Tipo de Equipo</Label>
          <select
            id="selector-filter-type"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterEquipmentType}
            onChange={(e) => setFilterEquipmentType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {equipmentTypes.filter(et => et.isActive).map((et) => (
              <option key={et.id} value={et.id}>{et.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="selector-search">Buscar Equipo</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="selector-search"
              className="pl-9"
              placeholder="Nombre, marca, modelo, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium mb-1">Equipo Disponible (Standby/Bodega)</span>
        <div 
          className="border rounded-lg max-h-60 overflow-y-auto mt-1" 
          role="listbox" 
          aria-label="Lista de equipos disponibles"
          aria-multiselectable="false"
        >
          {isLoadingEquipment ? (
            <div className="p-4 text-center text-muted-foreground">Cargando equipos...</div>
          ) : filteredEquipment.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No hay equipos en standby. Cree equipos en el Inventario primero.
            </div>
          ) : (
            filteredEquipment.map((eq) => (
              <div
                key={eq.id}
                className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedEquipmentId === eq.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => setSelectedEquipmentId(eq.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedEquipmentId(eq.id);
                  }
                }}
                role="option"
                aria-selected={selectedEquipmentId === eq.id}
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedEquipmentId === eq.id && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
                    <Monitor className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium">{eq.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{eq.status}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1 pl-6">
                  {eq.brand && ` ${eq.brand}`}{eq.model && ` - ${eq.model}`}{eq.serialNumber && ` | S/N: ${eq.serialNumber}`}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedEquipment && (
        <div className="p-3 bg-muted rounded-lg" role="status">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            <span className="font-medium">Equipo Seleccionado:</span>
          </div>
          <p className="font-medium">{selectedEquipment.name}</p>
          <p className="text-sm text-muted-foreground">
            {selectedEquipment.brand} {selectedEquipment.model} | {selectedEquipment.type}
          </p>
          {selectedEquipment.serialNumber && <p className="text-sm text-muted-foreground">Serial: {selectedEquipment.serialNumber}</p>}
        </div>
      )}

      {preselectedSystemId ? (
        <div className="p-3 bg-muted rounded-lg" role="status">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
            <span className="font-medium">Sistema Destino:</span>
          </div>
          <p className="font-medium">{systems.find(s => s.id === preselectedSystemId)?.name}</p>
          <p className="text-sm text-muted-foreground">
            {systems.find(s => s.id === preselectedSystemId)?.type}
          </p>
        </div>
      ) : (
        <div>
          <Label htmlFor="selector-system">Subsistema de Seguridad *</Label>
          <select
            id="selector-system"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedSystemId}
            onChange={(e) => setSelectedSystemId(e.target.value)}
          >
            <option value="">Seleccione un subsistema</option>
            {systems.map((sys) => (
              <option key={sys.id} value={sys.id}>{sys.name} ({sys.type})</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || !selectedEquipmentId || !selectedSystemId}>
          Continuar con Instalación
        </Button>
      </div>
    </div>
  );
}
