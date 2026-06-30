import { useEffect, useState, useCallback, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { incidentService } from '@/services/incident.service';
import { adminService } from '@/services/admin.service';
import { installationService } from '@/services/installation.service';
import { Incident, IncidentType, Status, Installation } from '@/types';
import { IncidentFormData } from '@/lib/schemas';
import { formatDateTime, getPriorityColor, getStatusColor } from '@/lib/utils';
import { Plus, Search, AlertTriangle, Pencil, Trash2 } from 'lucide-react';

const IncidentForm = lazy(() => import('@/components/incidents/IncidentForm').then(m => ({ default: m.IncidentForm })));

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

  const fetchData = useCallback(async () => {
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
  }, [pagination.page, pagination.limit, search, statusFilter]);

  const handleSave = useCallback(async (data: IncidentFormData) => {
    try {
      if (editingIncident) {
        const { installationId, ...updateData } = data;
        await incidentService.update(editingIncident.id, updateData as any);
      } else {
        await incidentService.create(data);
      }
      setDialogOpen(false);
      setEditingIncident(null);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
    }
  }, [editingIncident, fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este incidente?')) return;
    try {
      const cancelledStatus = statuses.find(s => s.code === 'CANCELLED');
      await incidentService.update(id, { statusId: cancelledStatus?.id } as any);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }, [statuses, fetchData]);

  const openEdit = useCallback((incident: Incident) => {
    setEditingIncident(incident);
    setDialogOpen(true);
  }, []);

  const openCreate = useCallback(() => {
    setEditingIncident(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingIncident(null);
  }, []);

  const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPagination(p => ({ ...p, page: p.page - 1 }));
  }, []);

  const goToNextPage = useCallback(() => {
    setPagination(p => ({ ...p, page: p.page + 1 }));
  }, []);

  const canShowOpenVerified = useMemo(() => {
    return user?.role === 'ADMIN' || user?.role === 'GERENTE_SEGURIDAD';
  }, [user?.role]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidentes</h1>
          <p className="text-muted-foreground">Gestión de incidentes de seguridad</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Incidente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar incidentes..." value={search} onChange={handleSearchChange} className="pl-9" />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="">Todos los estados</option>
              <option value="IN_PROGRESS,ESCALATED">En Progreso y Escalados</option>
              <option value="IN_PROGRESS">En Investigación</option>
              <option value="ESCALATED">Escalados a Gerencia</option>
              <option value="CLOSED">Cerrados</option>
              {canShowOpenVerified && (
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
                    <Button variant="ghost" size="icon" onClick={() => openEdit(incident)} aria-label="Editar incidente"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(incident.id)} aria-label="Eliminar incidente"><Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" /></Button>
                  </div>
                </div>
              ))}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button variant="outline" onClick={goToPreviousPage} disabled={pagination.page === 1}>Anterior</Button>
                  <span className="text-sm text-muted-foreground">Página {pagination.page} de {pagination.totalPages}</span>
                  <Button variant="outline" onClick={goToNextPage} disabled={pagination.page === pagination.totalPages}>Siguiente</Button>
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
          <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <IncidentForm
              incident={editingIncident}
              incidentTypes={incidentTypes}
              installations={installations}
              onSubmit={handleSave}
              onCancel={closeDialog}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
}
