import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Equipment, SecuritySystem, EquipmentType } from '@/types';
import { Search, Monitor, Check } from 'lucide-react';

interface EquipmentAssignmentFormProps {
  equipment?: Equipment;
  systems: SecuritySystem[];
  equipmentTypes: EquipmentType[];
  onSubmit: (data: { equipmentId: string; securitySystemId: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EquipmentAssignmentForm({
  equipment,
  systems,
  equipmentTypes,
  onSubmit,
  onCancel,
  isLoading,
}: EquipmentAssignmentFormProps) {
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(equipment?.id || '');
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);

  useEffect(() => {
    fetchAvailableEquipment();
  }, [filterType]);

  const fetchAvailableEquipment = async () => {
    setIsLoadingEquipment(true);
    try {
      const params: any = { installationId: 'available' };
      if (filterType) params.type = filterType;
      const response = await fetch(`/api/electronic-security/equipments?${new URLSearchParams(params)}`);
      const data = await response.json();
      if (data.success) {
        setAvailableEquipment(data.data || []);
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

  const handleSubmit = async () => {
    if (!selectedEquipmentId || !selectedSystemId) {
      alert('Seleccione un equipo y un sistema');
      return;
    }
    await onSubmit({
      equipmentId: selectedEquipmentId,
      securitySystemId: selectedSystemId,
    });
  };

  const selectedEquipment = availableEquipment.find((eq) => eq.id === selectedEquipmentId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Sistema *</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {equipmentTypes.filter(et => et.isActive).map((et) => (
              <option key={et.id} value={et.systemType}>{et.name} ({et.systemType})</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Buscar Equipo</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Nombre, marca, modelo, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Equipo a Asignar *</Label>
        <div className="border rounded-lg max-h-60 overflow-y-auto mt-1">
          {isLoadingEquipment ? (
            <div className="p-4 text-center text-muted-foreground">Cargando equipos...</div>
          ) : filteredEquipment.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No hay equipos disponibles. Cree equipos en el Inventario Global primero.
            </div>
          ) : (
            filteredEquipment.map((eq) => (
              <div
                key={eq.id}
                className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedEquipmentId === eq.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
                onClick={() => setSelectedEquipmentId(eq.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedEquipmentId === eq.id && <Check className="h-4 w-4 text-primary" />}
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{eq.name}</span>
                  </div>
                  <Badge variant="outline">{eq.type}</Badge>
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
        <div className="p-3 bg-muted rounded-lg">
          <Label>Equipo Seleccionado</Label>
          <p className="font-medium">{selectedEquipment.name}</p>
          <p className="text-sm text-muted-foreground">
            {selectedEquipment.brand} {selectedEquipment.model} | {selectedEquipment.type}
          </p>
        </div>
      )}

      <div>
        <Label>Sistema de Seguridad *</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedSystemId}
          onChange={(e) => setSelectedSystemId(e.target.value)}
        >
          <option value="">Seleccione un sistema</option>
          {systems.map((sys) => (
            <option key={sys.id} value={sys.id}>{sys.name} ({sys.type})</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !selectedEquipmentId || !selectedSystemId}
        >
          {isLoading ? 'Asignando...' : 'Asignar Equipo'}
        </Button>
      </div>
    </div>
  );
}
