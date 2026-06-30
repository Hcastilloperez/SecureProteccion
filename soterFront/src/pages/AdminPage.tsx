import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService } from '@/services/admin.service';
import api from '@/config/axios';
import { Status, IncidentType, Configuration, User, Role, EquipmentType, PermissionDefinition } from '@/types';
import { getStatusText } from '@/lib/utils';
import { Plus, Pencil, Trash2, Users, Key, Shield } from 'lucide-react';
import { StatusForm, TypeForm, ConfigForm, UserForm, CompanyForm, RoleForm, EquipmentTypeForm } from '@/components/admin';

const FormSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-10 bg-muted rounded"></div>
    <div className="h-10 bg-muted rounded"></div>
    <div className="h-10 bg-muted rounded"></div>
  </div>
);

export default function AdminPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [permissionDefinitions, setPermissionDefinitions] = useState<PermissionDefinition[]>([]);
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
      const [statusesRes, typesRes, configsRes, companiesRes, usersRes, rolesRes, equipmentTypesRes, permissionsRes] = await Promise.all([
        adminService.getStatuses(),
        adminService.getIncidentTypes(),
        adminService.getConfigurations(),
        api.get('/physical-security/companies'),
        adminService.getUsers({ limit: 100 }),
        adminService.getRoles(),
        adminService.getEquipmentTypes(),
        adminService.getPermissionDefinitions(),
      ]);
      if (statusesRes.success) setStatuses(statusesRes.data || []);
      if (typesRes.success) setIncidentTypes(typesRes.data || []);
      if (configsRes.success) setConfigurations(configsRes.data || []);
      if (companiesRes.data.success) setCompanies(companiesRes.data.data || []);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (rolesRes.success) setRoles(rolesRes.data || []);
      setEquipmentTypes(equipmentTypesRes || []);
      if (permissionsRes.success) setPermissionDefinitions(permissionsRes.data || []);
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('status', status)} aria-label="Editar estado"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('status', status.id)} aria-label="Eliminar estado"><Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" /></Button>
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('type', type)} aria-label="Editar tipo"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('type', type.id)} aria-label="Eliminar tipo"><Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" /></Button>
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('config', config)} aria-label="Editar configuración"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('config', config.id)} aria-label="Eliminar configuración"><Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" /></Button>
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('company', company)} aria-label="Editar empresa"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('company', company.id)} aria-label="Eliminar empresa"><Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" /></Button>
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('user', user)} aria-label="Editar usuario"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('user', user.id)} aria-label="Eliminar usuario"><Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" /></Button>
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
                        {Object.entries(role.permissions || {}).filter(([k, v]) => v === true && (k === 'all' || permissionDefinitions.some(p => p.key === k))).map(([k]) => {
                          const def = permissionDefinitions.find(p => p.key === k);
                          return <span key={k} className="px-2 py-0.5 text-xs bg-muted rounded-full">{def?.label || k}</span>;
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{role.isActive ? 'Activo' : 'Inactivo'}</span>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('role', role)} aria-label="Editar rol"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('role', role.id)} aria-label="Eliminar rol"><Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" /></Button>
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('equipmentType', eqType)} aria-label="Editar tipo de equipo"><Pencil className="h-4 w-4" aria-hidden="true" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('equipmentType', eqType.id)} aria-label="Eliminar tipo de equipo"><Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" /></Button>
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
          <Suspense fallback={<FormSkeleton />}>
            {dialogType === 'status' && <StatusForm status={editingItem} onSubmit={(d) => handleSave('status', d)} onCancel={() => setDialogOpen(false)} />}
            {dialogType === 'type' && <TypeForm type={editingItem} onSubmit={(d) => handleSave('type', d)} onCancel={() => setDialogOpen(false)} />}
            {dialogType === 'config' && <ConfigForm config={editingItem} onSubmit={(d) => handleSave('config', d)} onCancel={() => setDialogOpen(false)} />}
            {dialogType === 'company' && <CompanyForm company={editingItem} onSubmit={(d) => handleSave('company', d)} onCancel={() => setDialogOpen(false)} />}
            {dialogType === 'user' && <UserForm user={editingItem} onSubmit={(d) => handleSave('user', d)} onCancel={() => setDialogOpen(false)} />}
            {dialogType === 'role' && <RoleForm role={editingItem} permissionDefinitions={permissionDefinitions} onSubmit={(d) => handleSave('role', d)} onCancel={() => setDialogOpen(false)} />}
            {dialogType === 'equipmentType' && <EquipmentTypeForm equipmentType={editingItem} onSubmit={(d) => handleSave('equipmentType', d)} onCancel={() => setDialogOpen(false)} />}
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
}
