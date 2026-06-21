import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { escortSchema, escortRouteSchema, escortMovementSchema, escortAssignmentSchema, EscortFormData, EscortRouteFormData, EscortMovementFormData, EscortAssignmentFormData } from '@/lib/schemas';
import { Escort, EscortRoute, EscortMovement, EscortAssignment, Installation } from '@/types';
import { getStatusText } from '@/lib/utils';
import {
  Users, Route, Pencil, Trash2, Plus, ArrowRight,
  Play, Pause, CheckCircle, XCircle, History
} from 'lucide-react';
import api from '@/config/axios';

export default function EscortsPage() {
  const [escorts, setEscorts] = useState<Escort[]>([]);
  const [routes, setRoutes] = useState<EscortRoute[]>([]);
  const [movements, setMovements] = useState<EscortMovement[]>([]);
  const [assignments, setAssignments] = useState<EscortAssignment[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'escort' | 'route' | 'movement' | 'assignment'>('escort');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedEscort, setSelectedEscort] = useState<Escort | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [escortsRes, routesRes, movementsRes, assignmentsRes, installationsRes] = await Promise.all([
        api.get('/escorts/escorts'),
        api.get('/escorts/routes'),
        api.get('/escorts/movements'),
        api.get('/escorts/assignments'),
        api.get('/installations'),
      ]);
      if (escortsRes.data.success) setEscorts(escortsRes.data.data);
      if (routesRes.data.success) setRoutes(routesRes.data.data);
      if (movementsRes.data.success) setMovements(movementsRes.data.data);
      if (assignmentsRes.data.success) setAssignments(assignmentsRes.data.data);
      if (installationsRes.data.success) setInstallations(installationsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (type: string, data: any) => {
    try {
      if (type === 'escort') {
        if (editingItem) {
          await api.put(`/escorts/escorts/${editingItem.id}`, data);
        } else {
          await api.post('/escorts/escorts', data);
        }
      } else if (type === 'route') {
        if (editingItem) {
          await api.put(`/escorts/routes/${editingItem.id}`, data);
        } else {
          await api.post('/escorts/routes', data);
        }
      } else if (type === 'assignment') {
        if (editingItem) {
          await api.put(`/escorts/assignments/${editingItem.id}`, data);
        } else {
          await api.post('/escorts/assignments', data);
        }
      } else if (type === 'movement') {
        if (editingItem) {
          await api.put(`/escorts/movements/${editingItem.id}`, data);
        } else {
          await api.post('/escorts/movements', data);
        }
      }
      setDialogOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('¿Está seguro de eliminar?')) return;
    try {
      if (type === 'escort') {
        await api.delete(`/escorts/escorts/${id}`);
      } else if (type === 'route') {
        await api.delete(`/escorts/routes/${id}`);
      } else if (type === 'assignment') {
        await api.put(`/escorts/assignments/${id}`, { status: 'CANCELLED' });
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (type: 'escort' | 'route' | 'movement' | 'assignment', item: any) => {
    setEditingItem(item);
    setDialogType(type);
    setDialogOpen(true);
  };

  const openCreate = (type: 'escort' | 'route' | 'movement' | 'assignment') => {
    setEditingItem(null);
    setDialogType(type);
    setDialogOpen(true);
  };

  const openHistory = (escort: Escort) => {
    setSelectedEscort(escort);
    setHistoryDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const getIcon = (s: string) => {
      switch (s) {
        case 'ACTIVE':
        case 'CONFIRMED':
        case 'COMPLETED':
          return <CheckCircle className="h-3 w-3 mr-1" />;
        case 'PENDING':
        case 'SCHEDULED':
        case 'STARTED':
        case 'IN_PROGRESS':
          return <Play className="h-3 w-3 mr-1" />;
        case 'PAUSED':
          return <Pause className="h-3 w-3 mr-1" />;
        case 'CANCELLED':
        case 'NO_SHOW':
          return <XCircle className="h-3 w-3 mr-1" />;
        default:
          return null;
      }
    };
    const getColors = (s: string) => {
      switch (s) {
        case 'ACTIVE':
        case 'CONFIRMED':
        case 'COMPLETED':
          return 'bg-green-100 text-green-700';
        case 'PENDING':
        case 'SCHEDULED':
        case 'STARTED':
        case 'IN_PROGRESS':
          return 'bg-blue-100 text-blue-700';
        case 'PAUSED':
          return 'bg-yellow-100 text-yellow-700';
        case 'CANCELLED':
        case 'NO_SHOW':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    };
    return <Badge className={getColors(status)}>{getIcon(status)}{getStatusText(status)}</Badge>;
  };

  const getEscortHistory = (escortId: string) => {
    const escortMovements = movements.filter(m => m.escortId === escortId);
    const escortAssignments = assignments.filter(a => a.escortId === escortId);
    return { movements: escortMovements, assignments: escortAssignments };
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Escoltas y Movilidad</h1>
          <p className="text-muted-foreground">Gestión de escoltas, rutas, asignaciones y movimientos</p>
        </div>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
          <TabsTrigger value="escorts">Escoltas</TabsTrigger>
          <TabsTrigger value="routes">Rutas</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Asignaciones de Funcionarios</CardTitle>
              <Button size="sm" onClick={() => openCreate('assignment')}>
                <Plus className="h-4 w-4 mr-2" />Nueva Asignación
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{assignment.officialName}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.officialPosition || 'Sin cargo'} • Doc: {assignment.officialDocument}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Destino: {assignment.destination} • Escolta: {assignment.escort?.name} {assignment.escort?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(assignment.startDate).toLocaleDateString('es-CO')} {assignment.endDate && ` - ${new Date(assignment.endDate).toLocaleDateString('es-CO')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(assignment.status)}
                      <Button variant="ghost" size="icon" onClick={() => openEdit('assignment', assignment)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('assignment', assignment.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay asignaciones registradas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escorts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Escoltas</CardTitle>
              <Button size="sm" onClick={() => openCreate('escort')}>
                <Plus className="h-4 w-4 mr-2" />Nuevo Escolta
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {escorts.map((escort) => (
                  <div key={escort.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{escort.name} {escort.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {escort.position} • {escort.phone}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {escort.documentType} {escort.documentNumber}
                          {escort.licenseType && ` • Lic: ${escort.licenseType} ${escort.licenseNumber || ''}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openHistory(escort)} title="Ver historial">
                        <History className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('escort', escort)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('escort', escort.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {escorts.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay escoltas registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rutas</CardTitle>
              <Button size="sm" onClick={() => openCreate('route')}>
                <Plus className="h-4 w-4 mr-2" />Nueva Ruta
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {routes.map((route) => (
                  <div key={route.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Route className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {route.escort?.name} {route.escort?.lastName}
                          {route.installation && ` • ${route.installation.name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {route.distance && `${route.distance} km`}
                          {route.estimatedTime && ` • ${route.estimatedTime} min`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit('route', route)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('route', route.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {routes.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay rutas registradas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Movimientos</CardTitle>
              <Button size="sm" onClick={() => openCreate('movement')}>
                <Plus className="h-4 w-4 mr-2" />Nuevo Movimiento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {movements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <ArrowRight className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {movement.escort?.name} {movement.escort?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {movement.route?.name || 'Ruta sin nombre'}
                          {movement.user && ` • Funcionario: ${movement.user.name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString('es-CO')} {new Date(movement.startTime).toLocaleTimeString('es-CO')}
                          {movement.startLatitude && movement.startLongitude && (
                            ` • GPS: ${movement.startLatitude.toFixed(4)}, ${movement.startLongitude.toFixed(4)}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(movement.status)}
                      <Button variant="ghost" size="icon" onClick={() => openEdit('movement', movement)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {movements.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay movimientos registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline de Escoltas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escorts.map((escort) => {
                  const history = getEscortHistory(escort.id);
                  const allItems = [
                    ...history.movements.map(m => ({ type: 'movement' as const, data: m, date: new Date(m.date) })),
                    ...history.assignments.map(a => ({ type: 'assignment' as const, data: a, date: new Date(a.startDate) })),
                  ].sort((a, b) => b.date.getTime() - a.date.getTime());

                  return (
                    <div key={escort.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{escort.name} {escort.lastName}</span>
                        <span className="text-sm text-muted-foreground">{escort.position}</span>
                      </div>
                      <div className="space-y-3 pl-8 border-l-2 border-gray-200">
                        {allItems.length > 0 ? allItems.slice(0, 5).map((item) => (
                          <div key={item.type === 'movement' ? `m-${item.data.id}` : `a-${item.data.id}`} className="relative">
                            <div className={`absolute -left-[21px] w-3 h-3 rounded-full ${item.type === 'movement' ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
                            <div className="p-2 bg-gray-50 rounded">
                              <p className="text-sm font-medium">
                                {item.type === 'movement' ? `Movimiento: ${(item.data as EscortMovement).route?.name || 'Sin ruta'}` : `Asignación: ${(item.data as EscortAssignment).officialName}`}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.date.toLocaleDateString('es-CO')} {item.date.toLocaleTimeString('es-CO')}
                              </p>
                              {item.type === 'movement' && (
                                <p className="text-xs">Estado: {getStatusBadge((item.data as EscortMovement).status)}</p>
                              )}
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">Sin actividad registrada</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar' : 'Nueva'} {dialogType === 'escort' ? 'Escolta' : dialogType === 'route' ? 'Ruta' : dialogType === 'assignment' ? 'Asignación' : 'Movimiento'}
            </DialogTitle>
            <DialogDescription>Complete todos los campos requeridos.</DialogDescription>
          </DialogHeader>
          {dialogType === 'escort' && (
            <EscortForm
              escort={editingItem}
              onSubmit={(d) => handleSave('escort', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
          {dialogType === 'route' && (
            <RouteForm
              route={editingItem}
              escorts={escorts}
              installations={installations}
              onSubmit={(d) => handleSave('route', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
          {dialogType === 'assignment' && (
            <AssignmentForm
              assignment={editingItem}
              escorts={escorts}
              routes={routes}
              onSubmit={(d) => handleSave('assignment', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
          {dialogType === 'movement' && (
            <MovementForm
              movement={editingItem}
              escorts={escorts}
              routes={routes}
              assignments={assignments}
              onSubmit={(d) => handleSave('movement', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historial Completo</DialogTitle>
            <DialogDescription>
              {selectedEscort?.name} {selectedEscort?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedEscort && (() => {
              const history = getEscortHistory(selectedEscort.id);
              const allItems = [
                ...history.movements.map(m => ({ type: 'movement' as const, data: m, date: new Date(m.date) })),
                ...history.assignments.map(a => ({ type: 'assignment' as const, data: a, date: new Date(a.startDate) })),
              ].sort((a, b) => b.date.getTime() - a.date.getTime());

              return allItems.length > 0 ? allItems.map((item, idx) => (
                <div key={item.type === 'movement' ? `m-${item.data.id}` : `a-${item.data.id}`} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.type === 'movement' ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
                    {idx < allItems.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {item.type === 'movement' ? 'Movimiento' : 'Asignación'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.date.toLocaleDateString('es-CO')} {item.date.toLocaleTimeString('es-CO')}
                      </p>
                    </div>
                    {item.type === 'movement' ? (
                      <>
                        <p className="text-sm">Ruta: {(item.data as EscortMovement).route?.name || 'Sin ruta'}</p>
                        <p className="text-sm">Estado: {getStatusBadge((item.data as EscortMovement).status)}</p>
                        {(item.data as EscortMovement).startLatitude && (
                          <p className="text-xs text-muted-foreground">
                            GPS: {(item.data as EscortMovement).startLatitude?.toFixed(4)}, {(item.data as EscortMovement).startLongitude?.toFixed(4)}
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm">Funcionario: {(item.data as EscortAssignment).officialName}</p>
                        <p className="text-sm">Destino: {(item.data as EscortAssignment).destination}</p>
                        <p className="text-sm">Estado: {getStatusBadge((item.data as EscortAssignment).status)}</p>
                      </>
                    )}
                    {(item.data as EscortMovement).observations && (
                      <p className="text-xs text-muted-foreground mt-1">Obs: {(item.data as EscortMovement).observations}</p>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-center py-8 text-muted-foreground">Sin actividad registrada</p>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EscortForm({ escort, onSubmit, onCancel }: { escort?: Escort; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EscortFormData>({
    resolver: zodResolver(escortSchema),
    defaultValues: {
      documentType: (escort?.documentType as any) || 'CC',
      documentNumber: escort?.documentNumber || '',
      name: escort?.name || '',
      lastName: escort?.lastName || '',
      phone: escort?.phone || '',
      email: escort?.email || '',
      position: escort?.position || '',
      licenseType: escort?.licenseType || '',
      licenseNumber: escort?.licenseNumber || '',
      isActive: escort?.isActive ?? true,
      observations: escort?.observations || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo Documento</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('documentType')}>
            <option value="CC">Cédula</option>
            <option value="CE">Cédula Extranjería</option>
            <option value="PP">Pasaporte</option>
          </select>
        </div>
        <div>
          <Label>Número Documento *</Label>
          <Input {...register('documentNumber')} />
          {errors.documentNumber && <p className="text-sm text-red-500">{errors.documentNumber.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Apellido *</Label>
          <Input {...register('lastName')} />
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Teléfono *</Label>
          <Input {...register('phone')} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cargo *</Label>
          <Input {...register('position')} />
          {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
        </div>
        <div>
          <Label>Tipo Licencia</Label>
          <Input {...register('licenseType')} placeholder="Ej: A1, B1" />
        </div>
      </div>
      <div>
        <Label>Número Licencia</Label>
        <Input {...register('licenseNumber')} />
      </div>
      <div>
        <Label>Notas</Label>
        <Textarea {...register('observations')} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function RouteForm({ route, escorts, installations, onSubmit, onCancel }: { route?: EscortRoute; escorts: Escort[]; installations: Installation[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EscortRouteFormData>({
    resolver: zodResolver(escortRouteSchema),
    defaultValues: {
      name: route?.name || '',
      description: route?.description || '',
      escortId: route?.escortId || '',
      installationId: route?.installationId || '',
      distance: route?.distance || undefined,
      estimatedTime: route?.estimatedTime || undefined,
      isActive: route?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Nombre de la Ruta *</Label>
        <Input {...register('name')} placeholder="Ej: Ruta Norte - Centro" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea {...register('description')} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Escolta *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('escortId')}>
            <option value="">Seleccionar escolta</option>
            {escorts.filter(e => e.isActive).map((e) => (
              <option key={e.id} value={e.id}>{e.name} {e.lastName}</option>
            ))}
          </select>
          {errors.escortId && <p className="text-sm text-red-500">{errors.escortId.message}</p>}
        </div>
        <div>
          <Label>Instalación</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('installationId')}>
            <option value="">Ninguna</option>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Distancia (km)</Label>
          <Input type="number" step="0.1" {...register('distance')} />
        </div>
        <div>
          <Label>Tiempo Estimado (min)</Label>
          <Input type="number" {...register('estimatedTime')} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function AssignmentForm({ assignment, escorts, routes, onSubmit, onCancel }: { assignment?: EscortAssignment; escorts: Escort[]; routes: EscortRoute[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EscortAssignmentFormData>({
    resolver: zodResolver(escortAssignmentSchema),
    defaultValues: {
      escortId: assignment?.escortId || '',
      routeId: assignment?.routeId || '',
      officialName: assignment?.officialName || '',
      officialDocument: assignment?.officialDocument || '',
      officialPhone: assignment?.officialPhone || '',
      officialPosition: assignment?.officialPosition || '',
      destination: assignment?.destination || '',
      startDate: assignment?.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : '',
      endDate: assignment?.endDate ? new Date(assignment.endDate).toISOString().split('T')[0] : '',
      status: (assignment?.status as any) || 'PENDING',
      observations: assignment?.observations || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Escolta *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('escortId')}>
            <option value="">Seleccionar escolta</option>
            {escorts.filter(e => e.isActive).map((e) => (
              <option key={e.id} value={e.id}>{e.name} {e.lastName}</option>
            ))}
          </select>
          {errors.escortId && <p className="text-sm text-red-500">{errors.escortId.message}</p>}
        </div>
        <div>
          <Label>Ruta</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('routeId')}>
            <option value="">Sin ruta específica</option>
            {routes.filter(r => r.isActive).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre del Funcionario *</Label>
          <Input {...register('officialName')} placeholder="Nombre completo" />
          {errors.officialName && <p className="text-sm text-red-500">{errors.officialName.message}</p>}
        </div>
        <div>
          <Label>Documento del Funcionario *</Label>
          <Input {...register('officialDocument')} placeholder="Número de documento" />
          {errors.officialDocument && <p className="text-sm text-red-500">{errors.officialDocument.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Teléfono del Funcionario</Label>
          <Input {...register('officialPhone')} />
        </div>
        <div>
          <Label>Cargo del Funcionario</Label>
          <Input {...register('officialPosition')} />
        </div>
      </div>
      <div>
        <Label>Destino *</Label>
        <Input {...register('destination')} placeholder="Dirección o lugar de destino" />
        {errors.destination && <p className="text-sm text-red-500">{errors.destination.message}</p>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Fecha/Hora Inicio *</Label>
          <Input type="datetime-local" {...register('startDate')} />
          {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
        </div>
        <div>
          <Label>Fecha/Hora Fin</Label>
          <Input type="datetime-local" {...register('endDate')} />
        </div>
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Notas</Label>
        <Textarea {...register('observations')} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function MovementForm({ movement, escorts, routes, assignments, onSubmit, onCancel }: { movement?: EscortMovement; escorts: Escort[]; routes: EscortRoute[]; assignments: EscortAssignment[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EscortMovementFormData>({
    resolver: zodResolver(escortMovementSchema),
    defaultValues: {
      assignmentId: movement?.assignmentId || '',
      routeId: movement?.routeId || '',
      escortId: movement?.escortId || '',
      date: movement?.date ? new Date(movement.date).toISOString().split('T')[0] : '',
      startTime: movement?.startTime ? new Date(movement.startTime).toISOString().slice(0, 16) : '',
      startLatitude: movement?.startLatitude || undefined,
      startLongitude: movement?.startLongitude || undefined,
      status: (movement?.status as any) || 'SCHEDULED',
      observations: movement?.observations || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Escolta *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('escortId')}>
            <option value="">Seleccionar escolta</option>
            {escorts.filter(e => e.isActive).map((e) => (
              <option key={e.id} value={e.id}>{e.name} {e.lastName}</option>
            ))}
          </select>
          {errors.escortId && <p className="text-sm text-red-500">{errors.escortId.message}</p>}
        </div>
        <div>
          <Label>Ruta *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('routeId')}>
            <option value="">Seleccionar ruta</option>
            {routes.filter(r => r.isActive).map((r) => (
              <option key={r.id} value={r.id}>{r.name} - {r.escort?.name} {r.escort?.lastName}</option>
            ))}
          </select>
          {errors.routeId && <p className="text-sm text-red-500">{errors.routeId.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Asignación (Opcional)</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('assignmentId')}>
            <option value="">Sin asignación</option>
            {assignments.filter(a => a.status !== 'CANCELLED' && a.status !== 'COMPLETED').map((a) => (
              <option key={a.id} value={a.id}>{a.officialName} - {a.destination}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="SCHEDULED">Programado</option>
            <option value="STARTED">Iniciado</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="PAUSED">Pausado</option>
            <option value="COMPLETED">Completado</option>
            <option value="NO_SHOW">No Presentó</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha *</Label>
          <Input type="date" {...register('date')} />
          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
        </div>
        <div>
          <Label>Hora Inicio *</Label>
          <Input type="datetime-local" {...register('startTime')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Latitud Inicial</Label>
          <Input type="number" step="any" {...register('startLatitude')} placeholder="-90 a 90" />
        </div>
        <div>
          <Label>Longitud Inicial</Label>
          <Input type="number" step="any" {...register('startLongitude')} placeholder="-180 a 180" />
        </div>
      </div>
      <div>
        <Label>Notas</Label>
        <Textarea {...register('observations')} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
