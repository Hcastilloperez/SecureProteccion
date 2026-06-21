import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { incidentService } from '@/services/incident.service';
import { adminService } from '@/services/admin.service';
import { installationService } from '@/services/installation.service';
import { formatDateTime, getPriorityColor, getStatusColor } from '@/lib/utils';
import {
  Plus, Search, Clock, AlertTriangle, Send, ArrowUpRight,
  MapPin, User, MessageSquare, CheckCircle, XCircle, ShieldCheck
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  incidentType: { id: string; name: string; coordinatorType?: string };
  installation: { id: string; name: string };
  status: { id: string; code: string; name: string };
  priority: string;
  reportedBy: string;
  location?: string;
  createdAt: string;
  timelines?: TimelineEntry[];
  attachments?: { id: string; fileName: string; mimeType: string }[];
}

interface TimelineEntry {
  id: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
  user: { name: string; lastName: string; role: string };
}

interface IncidentType { id: string; name: string; coordinatorType?: string }
interface Installation { id: string; name: string }
interface Status { id: string; code: string; name: string }
interface User { id: string; name: string; lastName: string; role: string }

export default function MinutaPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyComment, setVerifyComment] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    installationId: '',
    incidentTypeId: '',
    statusCode: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [typesRes, installationsRes, statusesRes, usersRes] = await Promise.all([
        adminService.getIncidentTypes(),
        installationService.getAll({ limit: 100 }),
        adminService.getStatuses('INCIDENT'),
        adminService.getUsers({ limit: 100 }),
      ]);
      if (typesRes.success) setIncidentTypes(typesRes.data || []);
      if (installationsRes.success) setInstallations(installationsRes.data || []);
      if (statusesRes.success) setStatuses(statusesRes.data || []);
      if (usersRes.success) setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await incidentService.getAll({ limit: 50 });
      if (response.success) {
        let filtered = response.data || [];

        if (filters.search) {
          filtered = filtered.filter(i =>
            i.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            i.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            i.reportedBy.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        if (filters.installationId) {
          filtered = filtered.filter(i => i.installation.id === filters.installationId);
        }
        if (filters.incidentTypeId) {
          filtered = filtered.filter(i => i.incidentType.id === filters.incidentTypeId);
        }
        if (filters.statusCode) {
          filtered = filtered.filter(i => i.status.code === filters.statusCode);
        }

        setIncidents(filtered);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIncidentDetail = async (id: string) => {
    try {
      const response = await incidentService.getById(id);
      if (response.success && response.data) {
        setSelectedIncident(response.data);
        setDetailDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching incident detail:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedIncident) return;
    try {
      await incidentService.addTimeline(selectedIncident.id, {
        comment: newComment,
        isInternal,
      });
      setNewComment('');
      setIsInternal(false);
      fetchIncidentDetail(selectedIncident.id);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEscalate = async (assignedToId: string, comment: string) => {
    if (!selectedIncident) return;
    try {
      await incidentService.escalate(selectedIncident.id, { assignedToId, comment });
      setEscalateDialogOpen(false);
      fetchIncidentDetail(selectedIncident.id);
      fetchIncidents();
    } catch (error) {
      console.error('Error escalating:', error);
    }
  };

  const handleCreateIncident = async (data: any) => {
    try {
      await incidentService.create(data);
      setCreateDialogOpen(false);
      fetchIncidents();
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  const handleVerify = async (isValid: boolean) => {
    if (!selectedIncident) return;
    try {
      await incidentService.verify(selectedIncident.id, { isValid, comment: verifyComment });
      setVerifyDialogOpen(false);
      setVerifyComment('');
      fetchIncidentDetail(selectedIncident.id);
      fetchIncidents();
    } catch (error) {
      console.error('Error verifying incident:', error);
    }
  };

  const openIncidents = incidents.filter(i => ['OPEN'].includes(i.status.code));
  const closedIncidents = incidents.filter(i => ['CLOSED', 'CANCELLED'].includes(i.status.code));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Módulo de Minuta
          </h1>
          <p className="text-muted-foreground">
            Centro de Seguridad - Registro y seguimiento de incidentes
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Incidente</DialogTitle>
              <DialogDescription>
                Complete el formulario para registrar un nuevo incidente en el sistema.
              </DialogDescription>
            </DialogHeader>
            <CreateIncidentForm
              incidentTypes={incidentTypes}
              installations={installations}
              onSubmit={handleCreateIncident}
              onCancel={() => setCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-sm font-medium text-orange-700">Abiertos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{openIncidents.filter(i => i.status.code === 'OPEN').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-sm font-medium text-green-700">Verificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{openIncidents.filter(i => i.status.code === 'VERIFIED').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle className="text-sm font-medium text-blue-700">Cerrados</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{closedIncidents.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descripción o reportado por..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.installationId}
              onChange={(e) => setFilters({ ...filters, installationId: e.target.value })}
            >
              <option value="">Todas las instalaciones</option>
              {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.incidentTypeId}
              onChange={(e) => setFilters({ ...filters, incidentTypeId: e.target.value })}
            >
              <option value="">Todos los tipos</option>
              {incidentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filters.statusCode}
              onChange={(e) => setFilters({ ...filters, statusCode: e.target.value })}
            >
              <option value="">Todos los estados</option>
              {statuses.map((s) => <option key={s.id} value={s.code}>{s.name}</option>)}
            </select>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open">
            Incidentes Abiertos ({openIncidents.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Incidentes Cerrados ({closedIncidents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {openIncidents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">No hay incidentes abiertos</h3>
                <p className="text-muted-foreground">Todos los incidentes han sido resueltos</p>
              </CardContent>
            </Card>
          ) : (
            openIncidents.map((incident) => (
              <Card key={incident.id} className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => fetchIncidentDetail(incident.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${getPriorityColor(incident.priority)}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{incident.title}</h3>
                          <Badge className={getStatusColor(incident.status.code)}>
                            {incident.status.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {incident.incidentType.name} • {incident.installation.name}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {incident.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {incident.reportedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(incident.createdAt)}
                          </span>
                          {incident.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {incident.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(incident.priority)}>
                        {incident.priority}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {closedIncidents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold">No hay incidentes cerrados</h3>
              </CardContent>
            </Card>
          ) : (
            closedIncidents.slice(0, 20).map((incident) => (
              <Card key={incident.id} className="cursor-pointer hover:border-primary transition-colors opacity-75"
                onClick={() => fetchIncidentDetail(incident.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${getStatusColor(incident.status.code)}`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{incident.title}</h3>
                          <Badge variant="secondary">{incident.status.name}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {incident.incidentType.name} • {incident.installation.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {incident.reportedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(incident.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Detalle del Incidente
              {selectedIncident && (
                <>
                  <Badge className={getStatusColor(selectedIncident.status.code)}>
                    {selectedIncident.status.name}
                  </Badge>
                  <Badge className={getPriorityColor(selectedIncident.priority)}>
                    {selectedIncident.priority}
                  </Badge>
                </>
              )}
</DialogTitle>
              <DialogDescription>
                Información detallada del incidente seleccionado.
              </DialogDescription>
            </DialogHeader>
          {selectedIncident && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Título</Label>
                  <p className="font-medium">{selectedIncident.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="font-medium">{selectedIncident.incidentType.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Instalación</Label>
                  <p className="font-medium">{selectedIncident.installation.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Reportado Por</Label>
                  <p className="font-medium">{selectedIncident.reportedBy}</p>
                </div>
                {selectedIncident.location && (
                  <div>
                    <Label className="text-muted-foreground">Ubicación</Label>
                    <p className="font-medium">{selectedIncident.location}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Fecha de Creación</Label>
                  <p className="font-medium">{formatDateTime(selectedIncident.createdAt)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Descripción</Label>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedIncident.description}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Bitácora / Timeline
                  </h3>
                  {selectedIncident.status.code === 'OPEN' && (
                    <Button variant="outline" size="sm" onClick={() => setVerifyDialogOpen(true)}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Verificar Incidente
                    </Button>
                  )}
                  {selectedIncident.status.code === 'VERIFIED' && (
                    <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          Escalar a Coordinador
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Escalar Incidente - {selectedIncident.incidentType.name}</DialogTitle>
                          <DialogDescription>
                            Seleccione el grupo de coordinación al cual asignar el incidente.
                          </DialogDescription>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground mb-4">
                          Este tipo de incidente es atendido por: <strong>{selectedIncident.incidentType.coordinatorType || 'Coordinador General'}</strong>
                        </p>
                        <EscalateForm
                          incidentType={selectedIncident.incidentType.coordinatorType}
                          users={users}
                          onSubmit={handleEscalate}
                          onCancel={() => setEscalateDialogOpen(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedIncident.timelines && selectedIncident.timelines.length > 0 ? (
                    selectedIncident.timelines.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-lg ${entry.isInternal ? 'bg-gray-100 border-l-4 border-gray-400' : 'bg-blue-50 border-l-4 border-blue-500'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {entry.user.name} {entry.user.lastName}
                            <span className="text-muted-foreground ml-2">({entry.user.role})</span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(entry.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{entry.comment}</p>
                        {entry.isInternal && (
                          <span className="text-xs text-muted-foreground">🕵️ Interno</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Sin comentarios en la bitácora</p>
                  )}
                </div>

                {selectedIncident.status.code !== 'CLOSED' && selectedIncident.status.code !== 'CANCELLED' && (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Agregar comentario a la bitácora..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                        />
                        Marcar como interno
                      </label>
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        <Send className="mr-2 h-4 w-4" />
                        Agregar a Bitácora
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {selectedIncident.attachments && selectedIncident.attachments.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Archivos Adjuntos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedIncident.attachments.map((att) => (
                      <div key={att.id} className="p-2 border rounded-md">
                        <p className="text-sm font-medium truncate">{att.fileName}</p>
                        <p className="text-xs text-muted-foreground">{att.mimeType}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar Incidente</DialogTitle>
            <DialogDescription>
              Confirme si el incidente reportado es verídico y requiere atención.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿El incidente reportado es verídico y requiere atención del equipo de seguridad?
            </p>
            <div>
              <Label>Comentario de Verificación (opcional)</Label>
              <Textarea
                value={verifyComment}
                onChange={(e) => setVerifyComment(e.target.value)}
                placeholder="Agregue observaciones sobre la verificación..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="destructive" className="flex-1" onClick={() => handleVerify(false)}>
                <XCircle className="mr-2 h-4 w-4" />
                Invalidar
              </Button>
              <Button className="flex-1" onClick={() => handleVerify(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verificar y Preparar para Escalar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateIncidentForm({ incidentTypes, installations, onSubmit, onCancel }: {
  incidentTypes: IncidentType[];
  installations: Installation[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
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
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <Label>Título *</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Breve descripción del incidente" />
      </div>
      <div>
        <Label>Descripción Detallada *</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} placeholder="Describa el incidente con detalle..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Incidente *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.incidentTypeId} onChange={(e) => setForm({ ...form, incidentTypeId: e.target.value })} required>
            {incidentTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Instalación *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.installationId} onChange={(e) => setForm({ ...form, installationId: e.target.value })} required>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Prioridad</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </div>
        <div>
          <Label>Reportado Por *</Label>
          <Input value={form.reportedBy} onChange={(e) => setForm({ ...form, reportedBy: e.target.value })} required placeholder="Nombre de quien reporta" />
        </div>
        <div>
          <Label>Ubicación</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Área o punto específico" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Crear Incidente</Button>
      </div>
    </form>
  );
}

function EscalateForm({ incidentType, users, onSubmit, onCancel }: { incidentType?: string; users: User[]; onSubmit: (assignedToId: string, comment: string) => void; onCancel: () => void }) {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [comment, setComment] = useState('');

  const coordinatorGroups = [
    { value: 'COORDINADOR_FISICA', label: 'Coordinador Seguridad Física' },
    { value: 'COORDINADOR_ELECTRONICA', label: 'Coordinador Seguridad Electrónica' },
    { value: 'COORDINADOR_INVESTIGACIONES', label: 'Coordinador Investigaciones' },
    { value: 'COORDINADOR_ADMINISTRATIVO', label: 'Coordinador Administrativo' },
    { value: 'COORDINADOR_ACCIONES_LOCALITATIVAS', label: 'Coordinador Acciones Locativas' },
    { value: 'GERENTE_SEGURIDAD', label: 'Gerente de Seguridad' },
  ];

  const filteredGroup = incidentType ? coordinatorGroups.find(g => g.value.includes(incidentType)) : null;
  const defaultGroup = filteredGroup?.value || '';

  const usersInGroup = selectedGroup
    ? users.filter(u => u.role === selectedGroup || (selectedGroup === 'GERENTE_SEGURIDAD' && u.role === 'GERENTE_SEGURIDAD'))
    : users.filter(u => u.role.includes('COORDINADOR') || u.role === 'GERENTE_SEGURIDAD');

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
          {coordinatorGroups.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>
      {usersInGroup.length > 0 && (
        <div>
          <Label>Coordinador Específico (opcional)</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">Cualquiera del grupo</option>
            {usersInGroup.map((u) => (
              <option key={u.id} value={u.id}>{u.name} {u.lastName}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <Label>Comentario de Escalamiento</Label>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Agregue un comentario sobre el escalamiento..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSubmit(selectedGroup || defaultGroup, comment)} disabled={!selectedGroup && !defaultGroup}>Escalar</Button>
      </div>
    </div>
  );
}