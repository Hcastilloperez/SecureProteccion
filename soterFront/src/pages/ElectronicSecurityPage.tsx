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
import { securitySystemSchema, equipmentSchema, maintenanceSchema, SecuritySystemFormData, EquipmentFormData, MaintenanceFormData } from '@/lib/schemas';
import { getStatusText } from '@/lib/utils';
import {
  Wrench, Plus, Pencil, Trash2, Server, Cpu
} from 'lucide-react';
import api from '@/config/axios';

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
  installationId: string;
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
  ipAddress?: string;
  macAddress?: string;
  specifications?: { cost?: number };
  securitySystemId: string;
  securitySystem?: { id: string; name: string };
}

interface MaintenanceSchedule {
  id: string;
  title: string;
  type: string;
  frequency: string;
  status: string;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  provider?: string;
  equipment?: { id: string; name: string };
  securitySystem?: { id: string; name: string };
}

interface Props {
  installationId?: string;
}

export default function ElectronicSecurityPage({ installationId }: Props) {
  const [systems, setSystems] = useState<SecuritySystem[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'system' | 'equipment' | 'maintenance'>('system');
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [installationId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = installationId ? { installationId } : {};
      const [systemsRes, equipmentRes, maintenanceRes] = await Promise.all([
        api.get('/electronic-security/systems', { params }),
        api.get('/electronic-security/equipments', { params }),
        api.get('/electronic-security/maintenance', { params }),
      ]);
      if (systemsRes.data.success) setSystems(systemsRes.data.data);
      if (equipmentRes.data.success) setEquipments(equipmentRes.data.data);
      if (maintenanceRes.data.success) setMaintenances(maintenanceRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (type: string, data: any) => {
    try {
      const endpoint = type === 'system' ? '/electronic-security/systems' : type === 'equipment' ? '/electronic-security/equipments' : '/electronic-security/maintenance';
      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, data);
      } else {
        await api.post(endpoint, data);
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
      const endpoint = type === 'system' ? '/electronic-security/systems' : '/electronic-security/equipments';
      await api.delete(`${endpoint}/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (type: 'system' | 'equipment' | 'maintenance', item: any) => {
    setEditingItem(item);
    setDialogType(type);
    setDialogOpen(true);
  };

  const openCreate = (type: 'system' | 'equipment' | 'maintenance') => {
    setEditingItem(null);
    setDialogType(type);
    setDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="systems" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="systems">Sistemas ({systems.length})</TabsTrigger>
          <TabsTrigger value="equipments">Equipos ({equipments.length})</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento ({maintenances.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sistemas de Seguridad</CardTitle>
                <Button onClick={() => openCreate('system')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />Nuevo Sistema
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {systems.map((system) => (
                  <div key={system.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Server className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{system.name}</h4>
                          <p className="text-sm text-muted-foreground">{system.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit('system', system)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete('system', system.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground space-y-1">
                      {system.brand && <p>Marca: {system.brand}</p>}
                      <p>Equipos: {system._count?.equipments || 0}</p>
                      <p>Mantenimientos: {system._count?.maintenanceSchedules || 0}</p>
                    </div>
                    <div className="mt-2">
                      <Badge className={system.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {system.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {systems.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    No hay sistemas registrados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Equipos</CardTitle>
                <Button onClick={() => openCreate('equipment')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />Nuevo Equipo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equipments.map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${equipment.status === 'ACTIVE' ? 'bg-green-100' : equipment.status === 'IN_REPAIR' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        <Cpu className={`h-5 w-5 ${equipment.status === 'ACTIVE' ? 'text-green-600' : equipment.status === 'IN_REPAIR' ? 'text-yellow-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{equipment.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {equipment.type} • {equipment.brand || 'N/A'} • {equipment.location || 'Sin ubicación'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          IP: {equipment.ipAddress || 'N/A'} • MAC: {equipment.macAddress || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {equipment.specifications?.cost && (
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(equipment.specifications.cost)}
                        </span>
                      )}
                      <Badge className={equipment.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : equipment.status === 'IN_REPAIR' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}>
                        {getStatusText(equipment.status)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit('equipment', equipment)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete('equipment', equipment.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {equipments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay equipos registrados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Programación de Mantenimiento</CardTitle>
                <Button onClick={() => openCreate('maintenance')} size="sm">
                  <Plus className="h-4 w-4 mr-2" />Nuevo Mantenimiento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {maintenances.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${m.status === 'COMPLETED' ? 'bg-green-100' : m.status === 'IN_PROGRESS' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                        <Wrench className={`h-5 w-5 ${m.status === 'COMPLETED' ? 'text-green-600' : m.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-orange-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{m.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {m.type} • {m.frequency} • {m.equipment?.name || m.securitySystem?.name || 'Sin equipo'}
                        </p>
                        {m.provider && <p className="text-xs text-muted-foreground">Proveedor: {m.provider}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {m.cost && <p className="text-sm font-medium text-blue-600">{formatCurrency(m.cost)}</p>}
                        <p className="text-xs text-muted-foreground">
                          {new Date(m.scheduledDate).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <Badge className={m.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : m.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                        {getStatusText(m.status)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit('maintenance', m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {maintenances.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay mantenimientos programados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar' : 'Nuevo'} {dialogType === 'system' ? 'Sistema' : dialogType === 'equipment' ? 'Equipo' : 'Mantenimiento'}
            </DialogTitle>
            <DialogDescription>
              Complete todos los campos requeridos para {dialogType === 'system' ? 'registrar un sistema de seguridad' : dialogType === 'equipment' ? 'registrar un equipo' : 'programar un mantenimiento'}.
            </DialogDescription>
          </DialogHeader>
          {dialogType === 'system' && <SystemForm system={editingItem} installationId={installationId} onSubmit={(d: any) => handleSave('system', d)} onCancel={() => setDialogOpen(false)} />}
          {dialogType === 'equipment' && <EquipmentForm equipment={editingItem} systems={systems} onSubmit={(d: any) => handleSave('equipment', d)} onCancel={() => setDialogOpen(false)} />}
          {dialogType === 'maintenance' && <MaintenanceForm maintenance={editingItem} systems={systems} onSubmit={(d: any) => handleSave('maintenance', d)} onCancel={() => setDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SystemForm({ system, installationId, onSubmit, onCancel }: { system?: any; installationId?: string; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecuritySystemFormData>({
    resolver: zodResolver(securitySystemSchema),
    defaultValues: {
      name: system?.name || '',
      type: system?.type || '',
      description: system?.description || '',
      installationDate: system?.installationDate ? new Date(system.installationDate).toISOString().split('T')[0] : '',
      isActive: system?.isActive ?? true,
      installationId: system?.installationId || installationId || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Tipo de Sistema *</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('type')}>
          <option value="">Seleccionar tipo</option>
          <option value="CCTV">CCTV - Circuito Cerrado de Televisión</option>
          <option value="CONTROL_ACCESO">Control de Acceso</option>
          <option value="INTRUSION">Intrusión / Alarmas</option>
          <option value="FIRE">Detección de Incendio</option>
          <option value="VIDEOWALL">Videowall</option>
          <option value="CITOFONIA">Citofonía</option>
          <option value="RONDAS">Rondas</option>
          <option value="OTRO">Otro</option>
        </select>
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre del Sistema</Label>
          <Input {...register('name')} placeholder="Ej: CCTV Principal" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Fecha de Instalación</Label>
          <Input type="date" {...register('installationDate')} />
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea {...register('description')} rows={3} placeholder="Descripción detallada del sistema..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function EquipmentForm({ equipment, systems, onSubmit, onCancel }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: equipment?.name || '',
      type: equipment?.type || '',
      brand: equipment?.brand || '',
      model: equipment?.model || '',
      serialNumber: equipment?.serialNumber || '',
      status: (equipment?.status as any) || 'ACTIVE',
      location: equipment?.location || '',
      ipAddress: equipment?.ipAddress || '',
      macAddress: equipment?.macAddress || '',
      specifications: { cost: equipment?.specifications?.cost },
      securitySystemId: equipment?.securitySystemId || systems[0]?.id || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Tipo *</Label>
          <Input {...register('type')} placeholder="Cámara, Sensor, Lector" />
          {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Marca</Label>
          <Input {...register('brand')} />
        </div>
        <div>
          <Label>Modelo</Label>
          <Input {...register('model')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Serial</Label>
          <Input {...register('serialNumber')} />
        </div>
        <div>
          <Label>Costo (COP)</Label>
          <Input type="number" {...register('specifications.cost')} placeholder="0" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>IP</Label>
          <Input {...register('ipAddress')} placeholder="192.168.1.100" />
          {errors.ipAddress && <p className="text-sm text-red-500">{errors.ipAddress.message}</p>}
        </div>
        <div>
          <Label>MAC</Label>
          <Input {...register('macAddress')} placeholder="00:00:00:00:00:00" />
          {errors.macAddress && <p className="text-sm text-red-500">{errors.macAddress.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="IN_REPAIR">En Reparación</option>
            <option value="DECOMMISSIONED">Dado de Baja</option>
          </select>
        </div>
        <div>
          <Label>Ubicación</Label>
          <Input {...register('location')} />
        </div>
      </div>
      <div>
        <Label>Sistema *</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('securitySystemId')}>
          <option value="">Seleccionar</option>
          {systems.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        {errors.securitySystemId && <p className="text-sm text-red-500">{errors.securitySystemId.message}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function MaintenanceForm({ maintenance, systems, onSubmit, onCancel }: any) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: maintenance?.title || '',
      type: maintenance?.type || '',
      frequency: maintenance?.frequency || '',
      status: (maintenance?.status as any) || 'SCHEDULED',
      scheduledDate: maintenance?.scheduledDate ? new Date(maintenance.scheduledDate).toISOString().split('T')[0] : '',
      completedDate: maintenance?.completedDate ? new Date(maintenance.completedDate).toISOString().split('T')[0] : '',
      cost: maintenance?.cost,
      provider: maintenance?.provider || '',
      notes: '',
      securitySystemId: maintenance?.securitySystem?.id || systems[0]?.id || '',
      equipmentId: undefined,
    },
  });

  const status = watch('status');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Título *</Label>
        <Input {...register('title')} />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo *</Label>
          <Input {...register('type')} placeholder="Preventivo, Correctivo" />
          {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
        </div>
        <div>
          <Label>Frecuencia *</Label>
          <Input {...register('frequency')} placeholder="Mensual, Trimestral" />
          {errors.frequency && <p className="text-sm text-red-500">{errors.frequency.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha Programada *</Label>
          <Input type="date" {...register('scheduledDate')} />
          {errors.scheduledDate && <p className="text-sm text-red-500">{errors.scheduledDate.message}</p>}
        </div>
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="SCHEDULED">Programado</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
      </div>
      {status === 'COMPLETED' && (
        <div>
          <Label>Fecha de Completado</Label>
          <Input type="date" {...register('completedDate')} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Costo (COP)</Label>
          <Input type="number" {...register('cost')} placeholder="0" />
        </div>
        <div>
          <Label>Proveedor</Label>
          <Input {...register('provider')} />
        </div>
      </div>
      <div>
        <Label>Sistema</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('securitySystemId')}>
          <option value="">Seleccionar</option>
          {systems.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}