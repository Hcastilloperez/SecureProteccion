import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService } from '@/services/admin.service';
import api from '@/config/axios';
import { Status, IncidentType, Configuration, User, Role, EquipmentType } from '@/types';
import { statusSchema, incidentTypeSchema, configurationSchema, userSchema, securityCompanySchema, roleSchema, StatusFormData, IncidentTypeFormData, ConfigurationFormData, UserFormData, SecurityCompanyFormData, RoleFormData } from '@/lib/schemas';
import { getStatusText } from '@/lib/utils';
import { Plus, Pencil, Trash2, Users, Key, Shield } from 'lucide-react';

export default function AdminPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'status' | 'type' | 'config' | 'company' | 'user' | 'role' | 'equipmentType'>('status');
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statusesRes, typesRes, configsRes, companiesRes, usersRes, rolesRes, equipmentTypesRes] = await Promise.all([
        adminService.getStatuses(),
        adminService.getIncidentTypes(),
        adminService.getConfigurations(),
        api.get('/physical-security/companies'),
        adminService.getUsers({ limit: 100 }),
        adminService.getRoles(),
        adminService.getEquipmentTypes(),
      ]);
      if (statusesRes.success) setStatuses(statusesRes.data || []);
      if (typesRes.success) setIncidentTypes(typesRes.data || []);
      if (configsRes.success) setConfigurations(configsRes.data || []);
      if (companiesRes.data.success) setCompanies(companiesRes.data.data || []);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (rolesRes.success) setRoles(rolesRes.data || []);
      setEquipmentTypes(equipmentTypesRes || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (type: string, data: any) => {
    try {
      let id = editingItem?.id;
      if (type === 'status') {
        if (id) {
          await adminService.updateStatus(id, data);
        } else {
          await adminService.createStatus(data);
        }
      } else if (type === 'type') {
        if (id) {
          await adminService.updateIncidentType(id, data);
        } else {
          await adminService.createIncidentType(data);
        }
      } else if (type === 'config') {
        if (id) {
          await adminService.updateConfiguration(id, data);
        } else {
          await adminService.createConfiguration(data);
        }
      } else if (type === 'company') {
        if (id) {
          await api.put(`/physical-security/companies/${id}`, data);
        } else {
          await api.post('/physical-security/companies', data);
        }
      } else if (type === 'user') {
        if (id) {
          await adminService.updateUser(id, data);
        } else {
          await adminService.createUser(data);
        }
      } else if (type === 'role') {
        if (id) {
          await adminService.updateRole(id, data);
        } else {
          await adminService.createRole(data);
        }
      } else if (type === 'equipmentType') {
        if (id) {
          await adminService.updateEquipmentType(id, data);
        } else {
          await adminService.createEquipmentType(data);
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
      if (type === 'status') await adminService.deleteStatus(id);
      else if (type === 'type') await adminService.deleteIncidentType(id);
      else if (type === 'config') await adminService.deleteConfiguration(id);
      else if (type === 'company') await api.delete(`/physical-security/companies/${id}`);
      else if (type === 'user') await adminService.updateUser(id, { status: 'INACTIVE' } as any);
      else if (type === 'role') await adminService.deleteRole(id);
      else if (type === 'equipmentType') await adminService.deleteEquipmentType(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (type: 'status' | 'type' | 'config' | 'company' | 'user' | 'role' | 'equipmentType', item: any) => {
    setEditingItem(item);
    setDialogType(type);
    setDialogOpen(true);
  };

  const openCreate = (type: 'status' | 'type' | 'config' | 'company' | 'user' | 'role' | 'equipmentType') => {
    setEditingItem(null);
    setDialogType(type);
    setDialogOpen(true);
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
        <h1 className="text-3xl font-bold tracking-tight">Administración</h1>
        <p className="text-muted-foreground">Configuración del sistema</p>
      </div>

      <Tabs defaultValue="statuses" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="statuses">Estados</TabsTrigger>
          <TabsTrigger value="types">Tipos Incidente</TabsTrigger>
          <TabsTrigger value="config">Configuraciones</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="equipmentTypes">Tipos Equipos</TabsTrigger>
        </TabsList>

        <TabsContent value="statuses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Estados de Incidentes</CardTitle>
              <Button size="sm" onClick={() => openCreate('status')}><Plus className="h-4 w-4 mr-2" />Nuevo Estado</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statuses.filter(s => s.type === 'INCIDENT').map((status) => (
                  <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{status.name}</p>
                      <p className="text-sm text-muted-foreground">Código: {status.code} • {status.description || 'Sin descripción'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit('status', status)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('status', status.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tipos de Incidente</CardTitle>
              <Button size="sm" onClick={() => openCreate('type')}><Plus className="h-4 w-4 mr-2" />Nuevo Tipo</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incidentTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{type.name}</p>
                      <p className="text-sm text-muted-foreground">{type.category} • SLA: {type.slaHours}h • {type.description || 'Sin descripción'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit('type', type)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('type', type.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Configuraciones</CardTitle>
              <Button size="sm" onClick={() => openCreate('config')}><Plus className="h-4 w-4 mr-2" />Nueva Configuración</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {configurations.map((config) => (
                  <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium flex items-center gap-2"><Key className="h-4 w-4" />{config.key}</p>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                      <p className="text-xs text-muted-foreground">Valor: {config.value} • Tipo: {config.type} • Categoría: {config.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit('config', config)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('config', config.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Empresas de Vigilancia</CardTitle>
              <Button size="sm" onClick={() => openCreate('company')}><Plus className="h-4 w-4 mr-2" />Nueva Empresa</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">NIT: {company.nit}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.contractNumber ? `Contrato: ${company.contractNumber}` : ''}
                        {company.contractEndDate ? ` | Vence: ${new Date(company.contractEndDate).toLocaleDateString('es-CO')}` : ''}
                        {company.contractAmount ? ` | Valor: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(company.contractAmount)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${company.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{company.isActive ? 'Activo' : 'Inactivo'}</span>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('company', company)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('company', company.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
                {companies.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay empresas registradas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Usuarios</CardTitle>
              <Button size="sm" onClick={() => openCreate('user')}><Plus className="h-4 w-4 mr-2" />Nuevo Usuario</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium flex items-center gap-2"><Users className="h-4 w-4" />{user.name} {user.lastName}</p>
                      <p className="text-sm text-muted-foreground">{user.email} • {user.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{getStatusText(user.status)}</span>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('user', user)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('user', user.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Roles y Permisos</CardTitle>
              <Button size="sm" onClick={() => openCreate('role')}><Plus className="h-4 w-4 mr-2" />Nuevo Rol</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium flex items-center gap-2"><Shield className="h-4 w-4" />{role.name}</p>
                      <p className="text-sm text-muted-foreground">{role.description || 'Sin descripción'}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(role.permissions || {}).filter(([_, v]) => v === true).map(([k]) => (
                          <span key={k} className="px-2 py-0.5 text-xs bg-muted rounded-full">{k}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{role.isActive ? 'Activo' : 'Inactivo'}</span>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('role', role)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('role', role.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
                {roles.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay roles registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipmentTypes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tipos de Equipos de Seguridad Electrónica</CardTitle>
              <Button size="sm" onClick={() => openCreate('equipmentType')}><Plus className="h-4 w-4 mr-2" />Nuevo Tipo</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equipmentTypes.map((eqType) => (
                  <div key={eqType.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{eqType.name}</p>
                      <p className="text-sm text-muted-foreground">Código: {eqType.code} • Categoría: {eqType.category} • Sistema: {eqType.systemType}</p>
                      {eqType.description && <p className="text-sm text-muted-foreground">{eqType.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${eqType.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{eqType.isActive ? 'Activo' : 'Inactivo'}</span>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('equipmentType', eqType)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('equipmentType', eqType.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
                {equipmentTypes.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay tipos de equipos registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar' : 'Nuevo'} {dialogType === 'status' ? 'Estado' : dialogType === 'type' ? 'Tipo de Incidente' : dialogType === 'config' ? 'Configuración' : dialogType === 'company' ? 'Empresa de Vigilancia' : dialogType === 'user' ? 'Usuario' : dialogType === 'role' ? 'Rol' : 'Tipo de Equipo'}</DialogTitle>
            <DialogDescription>Complete todos los campos requeridos.</DialogDescription>
          </DialogHeader>
          {dialogType === 'status' && <StatusForm status={editingItem} onSubmit={(d) => handleSave('status', d)} onCancel={() => setDialogOpen(false)} />}
          {dialogType === 'type' && <TypeForm type={editingItem} onSubmit={(d) => handleSave('type', d)} onCancel={() => setDialogOpen(false)} />}
          {dialogType === 'config' && <ConfigForm config={editingItem} onSubmit={(d) => handleSave('config', d)} onCancel={() => setDialogOpen(false)} />}
          {dialogType === 'company' && <CompanyForm company={editingItem} onSubmit={(d) => handleSave('company', d)} onCancel={() => setDialogOpen(false)} />}
          {dialogType === 'user' && <UserForm user={editingItem} onSubmit={(d) => handleSave('user', d)} onCancel={() => setDialogOpen(false)} />}
          {dialogType === 'role' && <RoleForm role={editingItem} onSubmit={(d) => handleSave('role', d)} onCancel={() => setDialogOpen(false)} />}
          {dialogType === 'equipmentType' && <EquipmentTypeForm equipmentType={editingItem} onSubmit={(d) => handleSave('equipmentType', d)} onCancel={() => setDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusForm({ status, onSubmit, onCancel }: { status?: Status; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      code: status?.code || '',
      name: status?.name || '',
      type: 'INCIDENT',
      description: status?.description || '',
      isActive: status?.isActive ?? true,
      order: status?.order || 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input {...register('code')} disabled={!!status} />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Input {...register('description')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function TypeForm({ type, onSubmit, onCancel }: { type?: IncidentType; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<IncidentTypeFormData>({
    resolver: zodResolver(incidentTypeSchema),
    defaultValues: {
      code: type?.code || '',
      name: type?.name || '',
      category: (type?.category as any) || 'SEGURIDAD',
      description: type?.description || '',
      slaHours: type?.slaHours || 24,
      coordinatorType: type?.coordinatorType || undefined,
      isActive: type?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código</Label>
          <Input {...register('code')} disabled={!!type} />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Categoría</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('category')}>
            <option value="SEGURIDAD">Seguridad</option>
            <option value="EMERGENCIA">Emergencia</option>
            <option value="SALUD">Salud</option>
            <option value="CONDUCTA">Conducta</option>
            <option value="DAÑOS">Daños</option>
            <option value="OPERATIVO">Operativo</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
            <option value="OTROS">Otros</option>
          </select>
        </div>
        <div>
          <Label>SLA (horas) *</Label>
          <Input type="number" {...register('slaHours')} />
          {errors.slaHours && <p className="text-sm text-red-500">{errors.slaHours.message}</p>}
        </div>
      </div>
      <div>
        <Label>Coordinador Asignado</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('coordinatorType')}>
          <option value="">Ninguno</option>
          <option value="COORDINADOR_FISICA">Coordinador Seguridad Física</option>
          <option value="COORDINADOR_ELECTRONICA">Coordinador Seguridad Electrónica</option>
          <option value="COORDINADOR_INVESTIGACIONES">Coordinador Investigaciones</option>
          <option value="COORDINADOR_ADMINISTRATIVO">Coordinador Administrativo</option>
          <option value="COORDINADOR_ACCIONES_LOCALITATIVAS">Coordinador Acciones Locativas</option>
          <option value="GERENTE_SEGURIDAD">Gerente de Seguridad</option>
        </select>
      </div>
      <div>
        <Label>Descripción</Label>
        <Input {...register('description')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function ConfigForm({ config, onSubmit, onCancel }: { config?: Configuration; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ConfigurationFormData>({
    resolver: zodResolver(configurationSchema),
    defaultValues: {
      key: config?.key || '',
      value: config?.value || '',
      type: (config?.type as any) || 'string',
      description: config?.description || '',
      category: config?.category || 'general',
      isPublic: config?.isPublic ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Key *</Label>
        <Input {...register('key')} disabled={!!config} />
        {errors.key && <p className="text-sm text-red-500">{errors.key.message}</p>}
      </div>
      <div>
        <Label>Valor *</Label>
        <Input {...register('value')} />
        {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('type')}>
            <option value="string">Texto</option>
            <option value="number">Número</option>
            <option value="boolean">Booleano</option>
          </select>
        </div>
        <div>
          <Label>Categoría</Label>
          <Input {...register('category')} />
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Input {...register('description')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function UserForm({ user, onSubmit, onCancel }: { user?: User; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      name: user?.name || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      role: (user?.role as any) || 'OPERADOR_CENTRO',
      password: undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Email *</Label>
        <Input type="email" {...register('email')} disabled={!!user} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      {!user && (
        <div>
          <Label>Contraseña *</Label>
          <Input type="password" {...register('password')} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
      )}
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
          <Label>Teléfono</Label>
          <Input {...register('phone')} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <Label>Rol *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('role')}>
            <option value="ADMIN">Administrador</option>
            <option value="GERENTE_SEGURIDAD">Gerente de Seguridad</option>
            <option value="OPERADOR_CENTRO">Operador Centro</option>
            <option value="COORDINADOR_FISICA">Coordinador Seguridad Física</option>
            <option value="COORDINADOR_ELECTRONICA">Coordinador Seguridad Electrónica</option>
            <option value="COORDINADOR_INVESTIGACIONES">Coordinador Investigaciones</option>
            <option value="COORDINADOR_ADMINISTRATIVO">Coordinador Administrativo</option>
            <option value="COORDINADOR_ACCIONES_LOCALITATIVAS">Coordinador Acciones Locativas</option>
            <option value="ESCOLTA">Escolta</option>
            <option value="VIGILANTE">Vigilante</option>
          </select>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function CompanyForm({ company, onSubmit, onCancel }: { company?: any; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityCompanyFormData>({
    resolver: zodResolver(securityCompanySchema),
    defaultValues: {
      name: company?.name || '',
      nit: company?.nit || '',
      legalRepresentative: company?.legalRepresentative || '',
      contractNumber: company?.contractNumber || '',
      contractStartDate: company?.contractStartDate ? new Date(company.contractStartDate).toISOString().split('T')[0] : '',
      contractEndDate: company?.contractEndDate ? new Date(company.contractEndDate).toISOString().split('T')[0] : '',
      contractAmount: company?.contractAmount || undefined,
      phone: company?.phone || '',
      email: company?.email || '',
      address: company?.address || '',
      isActive: company?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre de la Empresa *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>NIT *</Label>
          <Input {...register('nit')} />
          {errors.nit && <p className="text-sm text-red-500">{errors.nit.message}</p>}
        </div>
      </div>
      <div>
        <Label>Representante Legal</Label>
        <Input {...register('legalRepresentative')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Número de Contrato</Label>
          <Input {...register('contractNumber')} />
        </div>
        <div>
          <Label>Valor del Contrato (COP)</Label>
          <Input type="number" {...register('contractAmount')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha Inicio Contrato</Label>
          <Input type="date" {...register('contractStartDate')} />
        </div>
        <div>
          <Label>Fecha Fin Contrato</Label>
          <Input type="date" {...register('contractEndDate')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Teléfono</Label>
          <Input {...register('phone')} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} />
        </div>
      </div>
      <div>
        <Label>Dirección</Label>
        <Input {...register('address')} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function RoleForm({ role, onSubmit, onCancel }: { role?: Role; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions || {},
    },
  });

  const permissionKeys = [
    { key: 'all', label: 'Todos los permisos' },
    { key: 'incidents', label: 'Incidentes' },
    { key: 'reports', label: 'Reportes' },
    { key: 'users', label: 'Usuarios' },
    { key: 'physicalSecurity', label: 'Seguridad Física' },
    { key: 'electronicSecurity', label: 'Seguridad Electrónica' },
    { key: 'investigations', label: 'Investigaciones' },
    { key: 'administrative', label: 'Administrativo' },
    { key: 'actionsLocalitatives', label: 'Acciones Locativas' },
    { key: 'movements', label: 'Movimientos' },
    { key: 'escort', label: 'Escoltas' },
    { key: 'minuta', label: 'Minuta' },
    { key: 'inventory', label: 'Inventario' },
    { key: 'installations', label: 'Instalaciones' },
    { key: 'configurations', label: 'Configuraciones' },
    { key: 'auditLogs', label: 'Auditoría' },
    { key: 'securityStudies', label: 'Estudios de Seguridad' },
    { key: 'maintenance', label: 'Mantenimiento' },
  ] as const;

  type PermissionKey = typeof permissionKeys[number]['key'];
  const permissions = watch('permissions') as Record<string, boolean>;

  const togglePermission = (key: PermissionKey, checked: boolean) => {
    if (key === 'all') {
      const newPerms = checked ? Object.fromEntries(permissionKeys.slice(1).map(o => [o.key, true])) : {};
      setValue('permissions', newPerms as any);
      return;
    }
    const current = { ...permissions };
    if (checked) {
      current[key] = true;
    } else {
      delete current[key];
    }
    setValue('permissions', current as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Nombre del Rol *</Label>
        <Input {...register('name')} placeholder="Ej: Coordinador de Seguridad" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <Label>Descripción</Label>
        <Input {...register('description')} placeholder="Descripción breve del rol" />
      </div>
      <div>
        <Label className="block mb-2">Permisos</Label>
        <div className="grid grid-cols-2 gap-2 border rounded-lg p-4 max-h-80 overflow-y-auto">
          {permissionKeys.map((option) => (
            <label key={option.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={option.key === 'all' ? permissions?.all === true : (permissions?.[option.key] ?? false)}
                onChange={(e) => togglePermission(option.key, e.target.checked)}
                className="rounded border-input"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function EquipmentTypeForm({ equipmentType, onSubmit, onCancel }: { equipmentType?: EquipmentType; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      code: equipmentType?.code || '',
      name: equipmentType?.name || '',
      description: equipmentType?.description || '',
      category: equipmentType?.category || 'GENERAL',
      systemType: equipmentType?.systemType || 'CCTV',
    },
  });

  const categories = [
    { value: 'GENERAL', label: 'General' },
    { value: 'CCTV', label: 'CCTV' },
    { value: 'ACCESS_CONTROL', label: 'Control de Acceso' },
    { value: 'INTRUSION', label: 'Intrusión' },
    { value: 'FIRE', label: 'Contra Incendio' },
    { value: 'NETWORK', label: 'Redes' },
  ];

  const systemTypes = [
    { value: 'CCTV', label: 'CCTV - Circuito Cerrado de Televisión' },
    { value: 'ACCESS_CONTROL', label: 'Control de Acceso' },
    { value: 'INTRUSION', label: 'Sistemas de Intrusión' },
    { value: 'FIRE_DETECTION', label: 'Detección de Incendio' },
    { value: 'PERIMETER', label: 'Perímetro' },
    { value: 'VIDEO_ANALYTICS', label: 'Analítica de Video' },
    { value: 'INTERCOM', label: 'Intercomunicación' },
    { value: 'NETWORK', label: 'Redes y Conectividad' },
    { value: 'GENERAL', label: 'General/Otro' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Código *</Label>
          <Input {...register('code')} placeholder="Ej: CAM-IP, DVR, CONT-AC" disabled={!!equipmentType} />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>
        <div>
          <Label>Nombre *</Label>
          <Input {...register('name')} placeholder="Ej: Cámara IP, DVR, Lector QR" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Categoría *</Label>
          <select {...register('category')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Tipo de Sistema *</Label>
          <select {...register('systemType')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {systemTypes.map((sys) => (
              <option key={sys.value} value={sys.value}>{sys.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label>Descripción</Label>
        <Input {...register('description')} placeholder="Descripción detallada del tipo de equipo" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}