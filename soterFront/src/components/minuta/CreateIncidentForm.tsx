import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface IncidentType { id: string; name: string }
interface Installation { id: string; name: string }

interface CreateIncidentFormProps {
  incidentTypes: IncidentType[];
  installations: Installation[];
  onSubmit: (data: {
    title: string;
    description: string;
    incidentTypeId: string;
    installationId: string;
    priority: string;
    location: string;
    reportedBy: string;
  }) => void;
  onCancel: () => void;
}

export function CreateIncidentForm({
  incidentTypes,
  installations,
  onSubmit,
  onCancel,
}: CreateIncidentFormProps) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    incidentTypeId: incidentTypes[0]?.id || '',
    installationId: installations[0]?.id || '',
    priority: 'MEDIUM',
    location: '',
    reportedBy: '',
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      <div>
        <Label>Título *</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          placeholder="Breve descripción del incidente"
        />
      </div>
      <div>
        <Label>Descripción Detallada *</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          rows={3}
          placeholder="Describa el incidente con detalle..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Incidente *</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.incidentTypeId}
            onChange={(e) => setForm({ ...form, incidentTypeId: e.target.value })}
            required
          >
            {incidentTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Instalación *</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.installationId}
            onChange={(e) => setForm({ ...form, installationId: e.target.value })}
            required
          >
            {installations.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Prioridad</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </div>
        <div>
          <Label>Reportado Por *</Label>
          <Input
            value={form.reportedBy}
            onChange={(e) => setForm({ ...form, reportedBy: e.target.value })}
            required
            placeholder="Nombre de quien reporta"
          />
        </div>
        <div>
          <Label>Ubicación</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Área o punto específico"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Incidente</Button>
      </div>
    </form>
  );
}

export default CreateIncidentForm;
