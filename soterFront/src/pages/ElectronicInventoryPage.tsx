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
import { investmentContractSchema, equipmentMovementSchema, InvestmentContractFormData, EquipmentMovementFormData } from '@/lib/schemas';
import { InvestmentContract, Equipment, EquipmentMovement, SecuritySystem, Installation, EquipmentType } from '@/types';
import { EquipmentForm } from '@/components/forms/EquipmentForm';
import { getStatusText } from '@/lib/utils';
import {
  Plus, Pencil, Trash2, ArrowRight, Clock, HardDrive, FileText, Monitor,
  TrendingUp
} from 'lucide-react';
import api from '@/config/axios';

interface EquipmentWithRelations extends Equipment {
  investmentContract?: InvestmentContract;
  installation?: Installation;
  securitySystem?: SecuritySystem;
  movements?: EquipmentMovement[];
}

interface InventoryStats {
  totalEquipments: number;
  activeEquipments: number;
  inRepairEquipments: number;
  inactiveEquipments: number;
  decommissionedEquipments: number;
  standbyEquipments: number;
  totalContracts: number;
  activeContracts: number;
  totalInvestment: number;
}

export default function ElectronicInventoryPage() {
  const [contracts, setContracts] = useState<InvestmentContract[]>([]);
  const [equipments, setEquipments] = useState<EquipmentWithRelations[]>([]);
  const [securitySystems, setSecuritySystems] = useState<SecuritySystem[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'contract' | 'equipment' | 'movement'>('contract');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentWithRelations | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [contractsRes, equipmentRes, systemsRes, installationsRes, statsRes, equipmentTypesRes] = await Promise.all([
        api.get('/inventory/contracts'),
        api.get('/inventory/equipments'),
        api.get('/electronic-security/systems'),
        api.get('/installations'),
        api.get('/inventory/stats'),
        api.get('/admin/equipment-types'),
      ]);
      if (contractsRes.data.success) setContracts(contractsRes.data.data);
      if (equipmentRes.data.success) setEquipments(equipmentRes.data.data);
      if (systemsRes.data.success) setSecuritySystems(systemsRes.data.data);
      if (installationsRes.data.success) setInstallations(installationsRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (equipmentTypesRes.data) setEquipmentTypes(equipmentTypesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (type: string, data: any) => {
    try {
      if (type === 'contract') {
        if (editingItem?.id) {
          await api.put(`/inventory/contracts/${editingItem.id}`, data);
        } else {
          await api.post('/inventory/contracts', data);
        }
      } else if (type === 'equipment') {
        if (editingItem?.id) {
          await api.put(`/inventory/equipments/${editingItem.id}`, data);
        } else {
          await api.post('/inventory/equipments', data);
        }
      } else if (type === 'movement') {
        await api.post('/inventory/movements', data);
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
      if (type === 'contract') {
        await api.delete(`/inventory/contracts/${id}`);
      } else if (type === 'equipment') {
        await api.put(`/inventory/equipments/${id}`, { status: 'DECOMMISSIONED' });
      } else if (type === 'movement') {
        await api.delete(`/inventory/movements/${id}`);
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (type: 'contract' | 'equipment' | 'movement', item: any) => {
    setEditingItem(item);
    setDialogType(type);
    setDialogOpen(true);
  };

  const openCreate = (type: 'contract' | 'equipment' | 'movement') => {
    setEditingItem(null);
    setDialogType(type);
    setDialogOpen(true);
  };

  const openHistory = (equipment: EquipmentWithRelations) => {
    setSelectedEquipment(equipment);
    setHistoryDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const getColors = (s: string) => {
      switch (s) {
        case 'ACTIVE':
        case 'INSTALLED':
        case 'COMPLETED':
          return 'bg-green-100 text-green-700';
        case 'INACTIVE':
        case 'IN_STORAGE':
        case 'EXPIRED':
          return 'bg-yellow-100 text-yellow-700';
        case 'IN_REPAIR':
          return 'bg-orange-100 text-orange-700';
        case 'DECOMMISSIONED':
          return 'bg-red-100 text-red-700';
        case 'MOVED':
          return 'bg-blue-100 text-blue-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    };
    return <Badge className={getColors(status)}>{getStatusText(status)}</Badge>;
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
        <h1 className="text-3xl font-bold tracking-tight">Inventario de Equipos</h1>
        <p className="text-muted-foreground">Gestión de equipos de seguridad electrónica</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEquipments || 0}</div>
            <p className="text-xs text-muted-foreground">en inventario</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Disponibles</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{stats?.standbyEquipments || 0}</div>
            <p className="text-xs text-amber-600">standby/bodega</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Instalados</CardTitle>
            <Monitor className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats?.activeEquipments || 0}</div>
            <p className="text-xs text-green-600">activos</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">En Reparación</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats?.inRepairEquipments || 0}</div>
            <p className="text-xs text-red-600">equipos</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Contratos</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats?.activeContracts || 0}</div>
            <p className="text-xs text-purple-600">activos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="equipments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contracts">Contratos ({contracts.length})</TabsTrigger>
          <TabsTrigger value="equipments">Equipos ({equipments.length})</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Contratos de Inversión</CardTitle>
              <Button size="sm" onClick={() => openCreate('contract')}>
                <Plus className="h-4 w-4 mr-2" />Nuevo Contrato
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{contract.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contract.code} {contract.orderNumber && `• Orden: ${contract.orderNumber}`}
                        </p>
                        {contract.totalAmount && (
                          <p className="text-xs text-muted-foreground">
                            Valor: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(contract.totalAmount)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(contract.status)}
                      <Button variant="ghost" size="icon" onClick={() => openEdit('contract', contract)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('contract', contract.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {contracts.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay contratos registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Inventario de Equipos</CardTitle>
              <Button size="sm" onClick={() => openCreate('equipment')}>
                <Plus className="h-4 w-4 mr-2" />Nuevo Equipo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equipments.map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <HardDrive className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {equipment.name}
                          {equipment.serialNumber && <span className="text-xs text-muted-foreground">S/N: {equipment.serialNumber}</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {equipment.type} {equipment.brand && `• ${equipment.brand}`} {equipment.model && `• ${equipment.model}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {equipment.installation?.name || 'Sin instalación'} {equipment.securitySystem?.name && `• ${equipment.securitySystem.name}`}
                        </p>
                        {equipment.purchaseDate && (
                          <p className="text-xs text-muted-foreground">
                            Comprado: {new Date(equipment.purchaseDate).toLocaleDateString('es-CO')}
                            {equipment.installationDate && ` • Instalado: ${new Date(equipment.installationDate).toLocaleDateString('es-CO')}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(equipment.status)}
                      <Button variant="ghost" size="icon" onClick={() => openHistory(equipment)} title="Ver historial">
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('equipment', equipment)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('equipment', equipment.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {equipments.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay equipos registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registro de Movimientos</CardTitle>
              <Button size="sm" onClick={() => openCreate('movement')}>
                <Plus className="h-4 w-4 mr-2" />Nuevo Movimiento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equipments.flatMap(e => e.movements || []).sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()).map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <ArrowRight className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{movement.equipment?.name || 'Equipo desconocido'}</p>
                        <p className="text-sm text-muted-foreground">
                          {movement.fromInstallation?.name || 'N/A'} → {movement.toInstallation?.name}
                        </p>
                        {movement.reason && <p className="text-xs text-muted-foreground">Razón: {movement.reason}</p>}
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.movementDate).toLocaleDateString('es-CO')} {new Date(movement.movementDate).toLocaleTimeString('es-CO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(movement.status)}
                    </div>
                  </div>
                ))}
                {equipments.flatMap(e => e.movements || []).length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay movimientos registrados</p>
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
              {editingItem ? 'Editar' : 'Nuevo'} {dialogType === 'contract' ? 'Contrato de Inversión' : dialogType === 'equipment' ? 'Equipo' : 'Movimiento'}
            </DialogTitle>
            <DialogDescription>Complete todos los campos requeridos.</DialogDescription>
          </DialogHeader>
          {dialogType === 'contract' && (
            <ContractForm
              contract={editingItem}
              onSubmit={(d) => handleSave('contract', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
          {dialogType === 'equipment' && (
            <EquipmentForm
              equipment={editingItem}
              contracts={contracts}
              equipmentTypes={equipmentTypes}
              showAllFields={true}
              onSubmit={(d) => handleSave('equipment', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
          {dialogType === 'movement' && (
            <MovementForm
              movement={editingItem}
              equipments={equipments}
              installations={installations}
              systems={securitySystems}
              onSubmit={(d) => handleSave('movement', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historial del Equipo</DialogTitle>
            <DialogDescription>
              {selectedEquipment?.name} - {selectedEquipment?.serialNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedEquipment?.movements && selectedEquipment.movements.length > 0 ? (
              selectedEquipment.movements.sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()).map((m, idx) => (
                <div key={m.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    {idx < (selectedEquipment.movements?.length || 0) - 1 && <div className="w-0.5 h-full bg-gray-200 mt-1"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{m.status === 'INSTALLED' ? 'Instalación inicial' : m.status === 'MOVED' ? 'Movimiento' : m.status}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(m.movementDate).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {m.fromInstallation?.name || 'N/A'} → {m.toInstallation?.name}
                    </p>
                    {m.toSecuritySystem && <p className="text-sm text-muted-foreground">Sistema: {m.toSecuritySystem.name}</p>}
                    {m.reason && <p className="text-sm mt-1">Razón: {m.reason}</p>}
                    {m.notes && <p className="text-sm text-muted-foreground mt-1">Notas: {m.notes}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">Sin movimientos registrados</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContractForm({ contract, onSubmit, onCancel }: { contract?: InvestmentContract; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<InvestmentContractFormData>({
    resolver: zodResolver(investmentContractSchema),
    defaultValues: {
      code: contract?.code || '',
      name: contract?.name || '',
      description: contract?.description || '',
      provider: contract?.provider || '',
      contractNumber: contract?.contractNumber || '',
      orderNumber: contract?.orderNumber || '',
      investmentType: contract?.investmentType || 'PURCHASE',
      totalAmount: contract?.totalAmount || undefined,
      startDate: contract?.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
      endDate: contract?.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
      status: (contract?.status as any) || 'ACTIVE',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código *</Label>
          <Input {...register('code')} placeholder="Ej: INV-2024-001" />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} placeholder="Nombre del contrato" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea {...register('description')} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Proveedor</Label>
          <Input {...register('provider')} />
        </div>
        <div>
          <Label>Tipo de Inversión</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('investmentType')}>
            <option value="PURCHASE">Compra</option>
            <option value="LEASE">Arrendamiento</option>
            <option value="DONATION">Donación</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Número de Contrato</Label>
          <Input {...register('contractNumber')} />
        </div>
        <div>
          <Label>Número de Orden</Label>
          <Input {...register('orderNumber')} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Valor Total</Label>
          <Input type="number" {...register('totalAmount')} />
        </div>
        <div>
          <Label>Fecha Inicio</Label>
          <Input type="date" {...register('startDate')} />
        </div>
        <div>
          <Label>Fecha Fin</Label>
          <Input type="date" {...register('endDate')} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function MovementForm({ movement, equipments, installations, systems, onSubmit, onCancel }: {
  movement?: EquipmentMovement;
  equipments: EquipmentWithRelations[];
  installations: Installation[];
  systems: SecuritySystem[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<EquipmentMovementFormData>({
    resolver: zodResolver(equipmentMovementSchema),
    defaultValues: {
      equipmentId: movement?.equipmentId || '',
      fromInstallationId: movement?.fromInstallationId || '',
      toInstallationId: movement?.toInstallationId || '',
      fromSecuritySystemId: movement?.fromSecuritySystemId || '',
      toSecuritySystemId: movement?.toSecuritySystemId || '',
      movementDate: movement?.movementDate ? new Date(movement.movementDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: (movement?.status as any) || 'MOVED',
      reason: movement?.reason || '',
      notes: movement?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Equipo *</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('equipmentId')}>
          <option value="">Seleccionar equipo</option>
          {equipments.filter(e => e.status !== 'DECOMMISSIONED').map((e) => (
            <option key={e.id} value={e.id}>{e.name} - {e.serialNumber || 'Sin serial'}</option>
          ))}
        </select>
        {errors.equipmentId && <p className="text-sm text-red-500">{errors.equipmentId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Desde Instalación</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('fromInstallationId')}>
            <option value="">Ninguna</option>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Hacia Instalación *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('toInstallationId')}>
            <option value="">Seleccionar instalación</option>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          {errors.toInstallationId && <p className="text-sm text-red-500">{errors.toInstallationId.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Desde Sistema</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('fromSecuritySystemId')}>
            <option value="">Ninguno</option>
            {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Hacia Sistema</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('toSecuritySystemId')}>
            <option value="">Ninguno</option>
            {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Fecha de Movimiento *</Label>
          <Input type="date" {...register('movementDate')} />
          {errors.movementDate && <p className="text-sm text-red-500">{errors.movementDate.message}</p>}
        </div>
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="INSTALLED">Instalado</option>
            <option value="MOVED">Movido</option>
            <option value="IN_STORAGE">En Almacén</option>
            <option value="IN_REPAIR">En Reparación</option>
            <option value="DECOMMISSIONED">Dado de Baja</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Razón del Movimiento</Label>
        <Input {...register('reason')} placeholder="Ej: Reubicación por obra, mantenimiento" />
      </div>
      <div>
        <Label>Notas</Label>
        <Textarea {...register('notes')} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Registrar Movimiento</Button>
      </div>
    </form>
  );
}
