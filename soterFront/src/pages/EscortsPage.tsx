'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EscortForm, RouteForm, AssignmentForm, MovementForm } from '@/components/escorts';
import { Escort, EscortRoute, EscortMovement, EscortAssignment, Installation } from '@/types';
import { getStatusText } from '@/lib/utils';
import {
  Users, Route, Pencil, Trash2, Plus, ArrowRight,
  Play, Pause, CheckCircle, XCircle, History
} from 'lucide-react';
import api from '@/config/axios';

function FormSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('assignment', assignment)} aria-label="Editar asignación">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('assignment', assignment.id)} aria-label="Eliminar asignación">
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
                      <Button variant="ghost" size="icon" onClick={() => openHistory(escort)} aria-label="Ver historial del escolta">
                        <History className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('escort', escort)} aria-label="Editar escolta">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('escort', escort.id)} aria-label="Eliminar escolta">
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('route', route)} aria-label="Editar ruta">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('route', route.id)} aria-label="Eliminar ruta">
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('movement', movement)} aria-label="Editar movimiento">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
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
          <Suspense fallback={<FormSkeleton />}>
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
          </Suspense>
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
