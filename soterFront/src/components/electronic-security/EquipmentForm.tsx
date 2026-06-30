'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import api from '@/config/axios';
import { ArrowRight, HardDrive } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: string;
}

interface EquipmentFormProps {
  systemId: string;
  installationId: string;
  onAssigned: () => void;
  onCancel: () => void;
}

export function EquipmentForm({ systemId, installationId, onAssigned, onCancel }: EquipmentFormProps) {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/equipments?available=true');
      if (res.data.success) {
        setEquipments(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching equipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedId) return;
    try {
      await api.post('/electronic-security/equipments/assign', {
        equipmentId: selectedId,
        securitySystemId: systemId,
        installationId,
      });
      onAssigned();
    } catch (error) {
      console.error('Error assigning equipment:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" onClick={fetchAvailable} disabled={loading}>
        {loading ? 'Cargando...' : 'Cargar Equipos Disponibles'}
      </Button>

      {equipments.length === 0 && !loading && (
        <p className="text-center py-4 text-muted-foreground">
          No hay equipos disponibles en bodega
        </p>
      )}

      {equipments.length > 0 && (
        <div className="space-y-2">
          <Label>Seleccionar Equipo</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
            {equipments.map((equipment) => (
              <div
                key={equipment.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedId === equipment.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedId(equipment.id)}
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{equipment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {equipment.type} {equipment.brand && `• ${equipment.brand}`} {equipment.model && `• ${equipment.model}`}
                    </p>
                  </div>
                </div>
                {selectedId === equipment.id && (
                  <Badge className="bg-primary">Seleccionado</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleAssign} disabled={!selectedId}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Asignar Equipo
        </Button>
      </div>
    </div>
  );
}
