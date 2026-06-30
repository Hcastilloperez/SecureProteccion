'use client';

import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { installationService } from '@/services/installation.service';
import { EquipmentSelectorForm, EquipmentInstallationForm } from '@/components/forms/EquipmentInstallationForm';
import api from '@/config/axios';
import { Installation, EquipmentType } from '@/types';
import { 
  Cpu, ShieldAlert, Building2, Plus, 
  Pencil, Trash2, Server, HardDrive, Monitor
} from 'lucide-react';

const ElectronicSystemForm = lazy(() => import('@/components/installation/ElectronicSystemForm').then(m => ({ default: m.ElectronicSystemForm })));

function FormSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-10 bg-muted rounded animate-pulse" />
      <div className="h-20 bg-muted rounded animate-pulse" />
      <div className="h-20 bg-muted rounded animate-pulse" />
    </div>
  );
}

interface SecuritySystem {
  id: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  description?: string;
  isActive: boolean;
  installation?: { id: string; name: string };
  _count?: { equipments: number; maintenanceSchedules: number };
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: string;
  location?: string;
  securitySystem?: { id: string; name: string };
  installation?: { id: string; name: string };
}

interface Stats {
  totalSystems: number;
  activeSystems: number;
  totalEquipments: number;
  stats: {
    activeEquipments: number;
    inRepairEquipments: number;
    decommissionedEquipments: number;
  };
}

export default function ElectronicSecurityPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [systems, setSystems] = useState<SecuritySystem[]>([]);
  const [availableEquipments, setAvailableEquipments] = useState<Equipment[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);
  const [systemDialogOpen, setSystemDialogOpen] = useState(false);
  const [systemDialogType, setSystemDialogType] = useState<'create' | 'edit'>('create');
  const [editingSystem, setEditingSystem] = useState<SecuritySystem | null>(null);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<SecuritySystem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [equipmentAssignmentStep, setEquipmentAssignmentStep] = useState<'select' | 'install'>('select');
  const [selectedEquipmentForInstall, setSelectedEquipmentForInstall] = useState<Equipment | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [installationsRes, systemsRes, equipmentsRes, statsRes, typesRes] = await Promise.all([
        installationService.getAll(),
        api.get('/electronic-security/systems'),
        api.get('/inventory/equipments?available=true'),
        api.get('/electronic-security/stats'),
        api.get('/admin/equipment-types'),
      ]);
      
      if (installationsRes.success) setInstallations(installationsRes.data || []);
      if (systemsRes.data.success) setSystems(systemsRes.data.data || []);
      if (equipmentsRes.data.success) setAvailableEquipments(equipmentsRes.data.data || []);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (typesRes.data.success) setEquipmentTypes(typesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statsMemo = useMemo(() => ({
    cctv: systems.filter(s => s.type === 'CCTV').length,
    accessControl: systems.filter(s => s.type === 'ACCESS_CONTROL').length,
    intrusion: systems.filter(s => s.type === 'INTRUSION').length,
    fire: systems.filter(s => s.type === 'FIRE' || s.type === 'FIRE_DETECTION').length,
    other: systems.filter(s => !['CCTV', 'ACCESS_CONTROL', 'INTRUSION', 'FIRE', 'FIRE_DETECTION'].includes(s.type)).length,
  }), [systems]);

  const systemsByInstallation = useMemo(() => {
    const grouped: Record<string, SecuritySystem[]> = {};
    systems.forEach(system => {
      const instId = system.installation?.id || 'unassigned';
      if (!grouped[instId]) grouped[instId] = [];
      grouped[instId].push(system);
    });
    return grouped;
  }, [systems]);

  const handleSaveSystem = useCallback(async (data: any) => {
    try {
      if (systemDialogType === 'create') {
        await api.post('/electronic-security/systems', {
          ...data,
          installationId: selectedInstallation?.id,
        });
      } else {
        await api.put(`/electronic-security/systems/${editingSystem?.id}`, data);
      }
      setSystemDialogOpen(false);
      setEditingSystem(null);
      fetchData();
    } catch (error) {
      console.error('Error saving system:', error);
    }
  }, [systemDialogType, selectedInstallation, editingSystem, fetchData]);

  const handleDeleteSystem = useCallback(async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este sistema?')) return;
    try {
      await api.delete(`/electronic-security/systems/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting system:', error);
    }
  }, [fetchData]);

  const handleSelectEquipment = useCallback(async (data: { equipmentId: string; securitySystemId: string }) => {
    const equipment = availableEquipments.find(e => e.id === data.equipmentId);
    if (!equipment) return;
    setSelectedEquipmentForInstall(equipment);
    setSelectedSystem(systems.find(s => s.id === data.securitySystemId) || null);
    setEquipmentAssignmentStep('install');
  }, [availableEquipments, systems]);

  const handleInstallEquipment = useCallback(async (data: any) => {
    if (!selectedSystem || !selectedEquipmentForInstall) return;
    try {
      await api.post('/electronic-security/equipments/assign', {
        equipmentId: selectedEquipmentForInstall.id,
        securitySystemId: selectedSystem.id,
        installationId: selectedSystem.installation?.id,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        ipAddress: data.ipAddress,
        macAddress: data.macAddress,
        firmwareVersion: data.firmwareVersion,
        notes: data.notes,
      });
      setEquipmentDialogOpen(false);
      setSelectedSystem(null);
      setSelectedEquipmentForInstall(null);
      fetchData();
    } catch (error) {
      console.error('Error installing equipment:', error);
    }
  }, [selectedSystem, selectedEquipmentForInstall, fetchData]);

  const openCreateSystem = useCallback((installation: Installation) => {
    setSelectedInstallation(installation);
    setSystemDialogType('create');
    setEditingSystem(null);
    setSystemDialogOpen(true);
  }, []);

  const openEditSystem = useCallback((system: SecuritySystem) => {
    setEditingSystem(system);
    setSystemDialogType('edit');
    setSystemDialogOpen(true);
  }, []);

  const openEquipmentDialog = useCallback((system: SecuritySystem) => {
    setSelectedSystem(system);
    setEquipmentAssignmentStep('select');
    setSelectedEquipmentForInstall(null);
    setEquipmentDialogOpen(true);
  }, []);

  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'CCTV': return <Monitor className="h-5 w-5" />;
      case 'ACCESS_CONTROL': return <ShieldAlert className="h-5 w-5" />;
      case 'INTRUSION': return <Cpu className="h-5 w-5" />;
      default: return <Server className="h-5 w-5" />;
    }
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seguridad Electrónica</h1>
        <p className="text-muted-foreground">Gestión de sistemas de seguridad electrónica por instalación</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sistemas</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSystems || 0}</div>
            <p className="text-xs text-muted-foreground">sistemas registrados</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">CCTV</CardTitle>
            <Monitor className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{statsMemo.cctv}</div>
            <p className="text-xs text-blue-600">cámaras</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Control Acceso</CardTitle>
            <ShieldAlert className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{statsMemo.accessControl}</div>
            <p className="text-xs text-green-600">control acceso</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Intrusión</CardTitle>
            <Cpu className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{statsMemo.intrusion}</div>
            <p className="text-xs text-orange-600">paneles</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Equipos</CardTitle>
            <HardDrive className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats?.stats?.activeEquipments || 0}</div>
            <p className="text-xs text-red-600">equipos activos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Resumen por Instalación</TabsTrigger>
          <TabsTrigger value="systems">Todos los Sistemas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {installations.map((installation) => {
            const instSystems = systemsByInstallation[installation.id] || [];
            return (
              <Card key={installation.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{installation.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{installation.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{instSystems.length} sistemas</Badge>
                    <Button size="sm" onClick={() => openCreateSystem(installation)}>
                      <Plus className="h-4 w-4 mr-2" />Agregar Sistema
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {instSystems.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">
                      No hay sistemas de seguridad electrónica en esta instalación
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {instSystems.map((system) => (
                        <div key={system.id} className="border rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded ${system.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {getSystemIcon(system.type)}
                              </div>
                              <div>
                                <p className="font-medium">{system.name}</p>
                                <p className="text-xs text-muted-foreground">{system.type}</p>
                              </div>
                            </div>
                            <Badge className={system.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {system.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {system._count?.equipments || 0} equipos
                            </span>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEquipmentDialog(system)} aria-label="Asignar equipos al sistema">
                                <HardDrive className="h-3 w-3" aria-hidden="true" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditSystem(system)} aria-label="Editar sistema">
                                <Pencil className="h-3 w-3" aria-hidden="true" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteSystem(system.id)} aria-label="Eliminar sistema">
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="systems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Sistemas de Seguridad Electrónica</CardTitle>
            </CardHeader>
            <CardContent>
              {systems.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No hay sistemas registrados</p>
              ) : (
                <div className="space-y-3">
                  {systems.map((system) => (
                    <div key={system.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${system.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {getSystemIcon(system.type)}
                        </div>
                        <div>
                          <p className="font-medium">{system.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {system.type} • {system.installation?.name || 'Sin instalación'}
                            {system.location && ` • ${system.location}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{system._count?.equipments || 0} equipos</Badge>
                        <Badge className={system.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {system.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={systemDialogOpen} onOpenChange={setSystemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {systemDialogType === 'create' ? 'Nuevo Sistema' : 'Editar Sistema'}
            </DialogTitle>
            <DialogDescription>
              {systemDialogType === 'create' && selectedInstallation && (
                <span>Agregar sistema a {selectedInstallation.name}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <Suspense fallback={<FormSkeleton />}>
            <ElectronicSystemForm
              system={editingSystem as any}
              installationId={systemDialogType === 'create' ? selectedInstallation?.id : editingSystem?.installation?.id}
              onSubmit={handleSaveSystem}
              onCancel={() => setSystemDialogOpen(false)}
            />
          </Suspense>
        </DialogContent>
      </Dialog>

      <Dialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {equipmentAssignmentStep === 'select' ? 'Seleccionar Equipo' : 'Configurar Instalación'}
            </DialogTitle>
            <DialogDescription>
              {selectedSystem && (
                <span>
                  {equipmentAssignmentStep === 'select' 
                    ? `Equipos disponibles para ${selectedSystem.name}` 
                    : `Configurando equipo para ${selectedSystem.name}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {equipmentAssignmentStep === 'select' ? (
            <EquipmentSelectorForm
              systems={systems as any}
              equipmentTypes={equipmentTypes}
              onSubmit={handleSelectEquipment}
              onCancel={() => setEquipmentDialogOpen(false)}
              preselectedSystemId={selectedSystem?.id}
            />
          ) : (
            selectedEquipmentForInstall && (
              <EquipmentInstallationForm
                equipment={selectedEquipmentForInstall as any}
                systems={systems as any}
                equipmentTypes={equipmentTypes}
                onSubmit={handleInstallEquipment}
                onCancel={() => setEquipmentAssignmentStep('select')}
                preselectedSystemId={selectedSystem?.id}
              />
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
