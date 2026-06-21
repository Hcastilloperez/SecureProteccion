import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { incidentService } from '@/services/incident.service';
import { adminService } from '@/services/admin.service';
import { installationService } from '@/services/installation.service';
import { Incident, IncidentType, Status, Installation } from '@/types';
import { incidentSchema, IncidentFormData } from '@/lib/schemas';
import { formatDateTime, getPriorityColor, getStatusColor } from '@/lib/utils';
import { Plus, Search, AlertTriangle, Pencil, Trash2 } from 'lucide-react';

export default function IncidentsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, pagination.page]);

  useEffect(() => {
    if (user?.role && !statusFilter) {
      if (user.role === 'ADMIN' || user.role === 'GERENTE_SEGURIDAD') {
        setStatusFilter('');
      } else {
        setStatusFilter('IN_PROGRESS,ESCALATED');
      }
    }
  }, [user, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [incidentsRes, typesRes, statusesRes, installationsRes] = await Promise.all([
        incidentService.getAll({ page: pagination.page, limit: pagination.limit, search: search || undefined, status: statusFilter || undefined }),
        adminService.getIncidentTypes(),
        adminService.getStatuses('INCIDENT'),
        installationService.getAll({ limit: 100 }),
      ]);
      if (incidentsRes.success) {
        setIncidents(incidentsRes.data || []);
        setPagination(incidentsRes.pagination);
      }
      if (typesRes.success) setIncidentTypes(typesRes.data || []);
      if (statusesRes.success) setStatuses(statusesRes.data || []);
      if (installationsRes.success) setInstallations(installationsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingIncident) {
        const { installationId, ...updateData } = data;
        await incidentService.update(editingIncident.id, updateData);
      } else {
        await incidentService.create(data);
      }
      setDialogOpen(false);
      setEditingIncident(null);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este incidente?')) return;
    try {
      await incidentService.update(id, { statusId: statuses.find(s => s.code === 'CANCELLED')?.id } as any);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidentes</h1>
          <p className="text-muted-foreground">Gestión de incidentes de seguridad</p>
        </div>
        <Button onClick={() => { setEditingIncident(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Incidente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar incidentes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="IN_PROGRESS,ESCALATED">En Progreso y Escalados</option>
              <option value="IN_PROGRESS">En Investigación</option>
              <option value="ESCALATED">Escalados a Gerencia</option>
              <option value="CLOSED">Cerrados</option>
              {(user?.role === 'ADMIN' || user?.role === 'GERENTE_SEGURIDAD') && (
                <option value="OPEN,VERIFIED">Abiertos y Verificados</option>
              )}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay incidentes</h3>
              <p className="text-muted-foreground">Comienza creando un nuevo incidente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Link to={`/incidents/${incident.id}`} className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{incident.title}</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(incident.priority)}`}>{incident.priority}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{incident.incidentType.name} • {incident.installation.name}</p>
                        <p className="text-sm text-muted-foreground">Reportado por: {incident.reportedBy} • {formatDateTime(incident.createdAt)}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(incident.status.code)}`}>{incident.status.name}</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(incident)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(incident.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button variant="outline" onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}>Anterior</Button>
                  <span className="text-sm text-muted-foreground">Página {pagination.page} de {pagination.totalPages}</span>
                  <Button variant="outline" onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages}>Siguiente</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingIncident ? 'Editar' : 'Nuevo'} Incidente</DialogTitle>
            <DialogDescription>Complete todos los campos obligatorios para crear o actualizar un incidente.</DialogDescription>
          </DialogHeader>
          <IncidentForm
            incident={editingIncident}
            incidentTypes={incidentTypes}
            installations={installations}
            onSubmit={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IncidentForm({ incident, incidentTypes, installations, onSubmit, onCancel }: { incident?: Incident | null; incidentTypes: IncidentType[]; installations: Installation[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: incident?.title || '',
      description: incident?.description || '',
      incidentTypeId: incident?.incidentTypeId || incidentTypes[0]?.id || '',
      installationId: incident?.installationId || installations[0]?.id || '',
      priority: incident?.priority || 'MEDIUM',
      location: incident?.location || '',
      reportedBy: incident?.reportedBy || '',
      latitude: incident?.latitude || undefined,
      longitude: incident?.longitude || undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input id="title" {...register('title')} placeholder="Breve descripción del incidente" />
        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Descripción *</Label>
        <Textarea id="description" {...register('description')} placeholder="Detalle completo del incidente" rows={3} />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="incidentTypeId">Tipo de Incidente *</Label>
          <select id="incidentTypeId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('incidentTypeId')}>
            <option value="">Seleccionar</option>
            {incidentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {errors.incidentTypeId && <p className="text-sm text-red-500 mt-1">{errors.incidentTypeId.message}</p>}
        </div>
        <div>
          <Label htmlFor="installationId">Instalación *</Label>
          <select id="installationId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('installationId')}>
            <option value="">Seleccionar</option>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          {errors.installationId && <p className="text-sm text-red-500 mt-1">{errors.installationId.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="priority">Prioridad</Label>
          <select id="priority" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('priority')}>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
          {errors.priority && <p className="text-sm text-red-500 mt-1">{errors.priority.message}</p>}
        </div>
        <div>
          <Label htmlFor="reportedBy">Reportado Por *</Label>
          <Input id="reportedBy" {...register('reportedBy')} placeholder="Nombre de quien reporta" />
          {errors.reportedBy && <p className="text-sm text-red-500 mt-1">{errors.reportedBy.message}</p>}
        </div>
        <div>
          <Label htmlFor="location">Ubicación</Label>
          <Input id="location" {...register('location')} placeholder="Lugar específico" />
          {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitud</Label>
          <Input id="latitude" type="number" step="any" {...register('latitude')} placeholder="-90 a 90" />
          {errors.latitude && <p className="text-sm text-red-500 mt-1">{errors.latitude.message}</p>}
        </div>
        <div>
          <Label htmlFor="longitude">Longitud</Label>
          <Input id="longitude" type="number" step="any" {...register('longitude')} placeholder="-180 a 180" />
          {errors.longitude && <p className="text-sm text-red-500 mt-1">{errors.longitude.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{incident ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </form>
  );
}