import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface User { id: string; name: string; lastName: string; role: string }

interface EscalateFormProps {
  incidentType?: string;
  users: User[];
  onSubmit: (assignedToId: string, comment: string) => void;
  onCancel: () => void;
}

const COORDINATOR_GROUPS = [
  { value: 'COORDINADOR_FISICA', label: 'Coordinador Seguridad Física' },
  { value: 'COORDINADOR_ELECTRONICA', label: 'Coordinador Seguridad Electrónica' },
  { value: 'COORDINADOR_INVESTIGACIONES', label: 'Coordinador Investigaciones' },
  { value: 'COORDINADOR_ADMINISTRATIVO', label: 'Coordinador Administrativo' },
  { value: 'COORDINADOR_ACCIONES_LOCALITATIVAS', label: 'Coordinador Acciones Locativas' },
  { value: 'GERENTE_SEGURIDAD', label: 'Gerente de Seguridad' },
];

export function EscalateForm({ incidentType, users, onSubmit, onCancel }: EscalateFormProps) {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [comment, setComment] = useState('');

  const filteredGroup = useMemo(
    () => (incidentType ? COORDINATOR_GROUPS.find((g) => g.value.includes(incidentType)) : null),
    [incidentType]
  );
  const defaultGroup = filteredGroup?.value || '';

  const usersInGroup = useMemo(() => {
    if (selectedGroup) {
      return users.filter(
        (u) => u.role === selectedGroup || (selectedGroup === 'GERENTE_SEGURIDAD' && u.role === 'GERENTE_SEGURIDAD')
      );
    }
    return users.filter((u) => u.role.includes('COORDINADOR') || u.role === 'GERENTE_SEGURIDAD');
  }, [selectedGroup, users]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Grupo de Coordinador *</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedGroup || defaultGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          required
        >
          <option value="">Seleccionar grupo</option>
          {COORDINATOR_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>
      {usersInGroup.length > 0 && (
        <div>
          <Label>Coordinador Específico (opcional)</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="">
            <option value="">Cualquiera del grupo</option>
            {usersInGroup.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.lastName}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <Label>Comentario de Escalamiento</Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Agregue un comentario sobre el escalamiento..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSubmit(selectedGroup || defaultGroup, comment)} disabled={!selectedGroup && !defaultGroup}>
          Escalar
        </Button>
      </div>
    </div>
  );
}

export default EscalateForm;
