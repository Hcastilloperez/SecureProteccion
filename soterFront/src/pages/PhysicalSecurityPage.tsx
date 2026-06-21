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
import { securityGuardSchema, securityPostSchema, securityCompanySchema, SecurityGuardFormData, SecurityPostFormData, SecurityCompanyFormData } from '@/lib/schemas';
import { Plus, Shield, Building, Pencil, Trash2, MapPin } from 'lucide-react';
import api from '@/config/axios';

interface SecurityGuard {
  id: string;
  documentType: string;
  documentNumber: string;
  name: string;
  lastName: string;
  phone: string;
  email?: string;
  position: string;
  schedule?: string;
  isActive: boolean;
  installation?: { id: string; name: string };
  securityPost?: {
    id: string;
    name: string;
    company: { id: string; name: string };
    installation: { id: string; name: string };
  };
}

interface SecurityPost {
  id: string;
  name: string;
  description?: string;
  schedule?: string;
  guardsRequired: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  isAdditional: boolean;
  startDate?: string;
  endDate?: string;
  company: { id: string; name: string };
  installation: { id: string; name: string };
  guards: SecurityGuard[];
}

interface SecurityCompany {
  id: string;
  name: string;
  nit: string;
  legalRepresentative?: string;
  contractNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractAmount?: number;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
}

interface Installation {
  id: string;
  name: string;
}

export default function PhysicalSecurityPage() {
  const [guards, setGuards] = useState<SecurityGuard[]>([]);
  const [posts, setPosts] = useState<SecurityPost[]>([]);
  const [companies, setCompanies] = useState<SecurityCompany[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'guard' | 'post' | 'company'>('company');
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [guardsRes, postsRes, companiesRes, installationsRes] = await Promise.all([
        api.get('/physical-security/guards'),
        api.get('/physical-security/posts'),
        api.get('/physical-security/companies'),
        api.get('/installations'),
      ]);
      if (guardsRes.data.success) setGuards(guardsRes.data.data);
      if (postsRes.data.success) setPosts(postsRes.data.data);
      if (companiesRes.data.success) setCompanies(companiesRes.data.data);
      if (installationsRes.data.success) setInstallations(installationsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (type: string, data: any) => {
    try {
      if (type === 'company') {
        if (editingItem?.id) {
          await api.put(`/physical-security/companies/${editingItem.id}`, data);
        } else {
          await api.post('/physical-security/companies', data);
        }
      } else if (type === 'post') {
        if (editingItem?.id) {
          await api.put(`/physical-security/posts/${editingItem.id}`, data);
        } else {
          await api.post('/physical-security/posts', data);
        }
      } else if (type === 'guard') {
        if (editingItem?.id) {
          await api.put(`/physical-security/guards/${editingItem.id}`, data);
        } else {
          await api.post('/physical-security/guards', data);
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
      if (type === 'company') {
        await api.delete(`/physical-security/companies/${id}`);
      } else if (type === 'post') {
        await api.delete(`/physical-security/posts/${id}`);
      } else if (type === 'guard') {
        await api.delete(`/physical-security/guards/${id}`);
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (type: 'guard' | 'post' | 'company', item: any) => {
    setEditingItem(item);
    setDialogType(type);
    setDialogOpen(true);
  };

  const openCreate = (type: 'guard' | 'post' | 'company') => {
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
        <h1 className="text-3xl font-bold tracking-tight">Seguridad Física</h1>
        <p className="text-muted-foreground">Gestión de empresas, puestos y vigilantes</p>
      </div>

      <Tabs defaultValue="companies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies">Empresas ({companies.length})</TabsTrigger>
          <TabsTrigger value="posts">Puestos ({posts.length})</TabsTrigger>
          <TabsTrigger value="guards">Vigilantes ({guards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Empresas de Vigilancia</CardTitle>
              <Button size="sm" onClick={() => openCreate('company')}>
                <Plus className="h-4 w-4 mr-2" />Nueva Empresa
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">NIT: {company.nit}</p>
                        {company.contractNumber && (
                          <p className="text-xs text-muted-foreground">
                            Contrato: {company.contractNumber} | Valor: {company.contractAmount ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(company.contractAmount) : 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={company.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {company.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('company', company)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('company', company.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Puestos de Vigilancia</CardTitle>
              <Button size="sm" onClick={() => openCreate('post')}>
                <Plus className="h-4 w-4 mr-2" />Nuevo Puesto
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${post.status === 'ACTIVE' ? 'bg-green-100' : post.status === 'PENDING' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                        <MapPin className={`h-5 w-5 ${post.status === 'ACTIVE' ? 'text-green-600' : post.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {post.name}
                          {post.isAdditional && <Badge variant="outline">Adicional</Badge>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {post.company.name} • {post.installation.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {post.guards.length}/{post.guardsRequired} vigilantes | {post.schedule || 'Sin horario'}
                          {post.startDate && ` | Desde: ${new Date(post.startDate).toLocaleDateString('es-CO')}`}
                          {post.endDate && ` | Hasta: ${new Date(post.endDate).toLocaleDateString('es-CO')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        post.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        post.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {post.status === 'ACTIVE' ? 'Activo' :
                         post.status === 'PENDING' ? 'Pendiente' :
                         post.status === 'SUSPENDED' ? 'Suspendido' : 'Inactivo'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('post', post)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('post', post.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay puestos registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guards" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vigilantes</CardTitle>
              <Button size="sm" onClick={() => openCreate('guard')}>
                <Plus className="h-4 w-4 mr-2" />Nuevo Vigilante
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guards.map((guard) => (
                  <div key={guard.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{guard.name} {guard.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {guard.position} • {guard.securityPost?.name || 'Sin puesto'} • {guard.securityPost?.company?.name || ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {guard.documentType} {guard.documentNumber} • {guard.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={guard.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {guard.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEdit('guard', guard)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('guard', guard.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {guards.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No hay vigilantes registrados</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar' : 'Nuevo'} {dialogType === 'company' ? 'Empresa de Vigilancia' : dialogType === 'post' ? 'Puesto de Vigilancia' : 'Vigilante'}
            </DialogTitle>
            <DialogDescription>Complete todos los campos requeridos.</DialogDescription>
          </DialogHeader>
          {dialogType === 'company' && (
            <CompanyForm
              company={editingItem}
              onSubmit={(d) => handleSave('company', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
          {dialogType === 'post' && (
            <PostForm
              post={editingItem}
              companies={companies}
              installations={installations}
              onSubmit={(d) => handleSave('post', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
          {dialogType === 'guard' && (
            <GuardForm
              guard={editingItem}
              posts={posts}
              installations={installations}
              onSubmit={(d) => handleSave('guard', d)}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompanyForm({ company, onSubmit, onCancel }: { company?: SecurityCompany; onSubmit: (data: any) => void; onCancel: () => void }) {
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
          <Label>Nombre *</Label>
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

function PostForm({ post, companies, installations, onSubmit, onCancel }: { post?: SecurityPost; companies: SecurityCompany[]; installations: Installation[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityPostFormData>({
    resolver: zodResolver(securityPostSchema),
    defaultValues: {
      name: post?.name || '',
      description: post?.description || '',
      schedule: post?.schedule || '',
      guardsRequired: post?.guardsRequired || 1,
      status: (post?.status as any) || 'PENDING',
      companyId: post?.company?.id || '',
      installationId: post?.installation?.id || '',
      startDate: post?.startDate ? new Date(post.startDate).toISOString().split('T')[0] : '',
      endDate: post?.endDate ? new Date(post.endDate).toISOString().split('T')[0] : '',
      isAdditional: post?.isAdditional ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre del Puesto *</Label>
          <Input {...register('name')} placeholder="Ej: Entrada Principal" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label>Vigilantes Requeridos *</Label>
          <Input type="number" {...register('guardsRequired')} />
          {errors.guardsRequired && <p className="text-sm text-red-500">{errors.guardsRequired.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Empresa *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('companyId')}>
            <option value="">Seleccionar empresa</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.companyId && <p className="text-sm text-red-500">{errors.companyId.message}</p>}
        </div>
        <div>
          <Label>Instalación *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('installationId')}>
            <option value="">Seleccionar instalación</option>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          {errors.installationId && <p className="text-sm text-red-500">{errors.installationId.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Horario</Label>
          <Input {...register('schedule')} placeholder="Ej: 8x8, 12x12" />
        </div>
        <div>
          <Label>Estado</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
            <option value="PENDING">Pendiente</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="SUSPENDED">Suspendido</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fecha Inicio</Label>
          <Input type="date" {...register('startDate')} />
        </div>
        <div>
          <Label>Fecha Fin Tentativa</Label>
          <Input type="date" {...register('endDate')} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register('isAdditional')} className="w-4 h-4" />
        <Label>Puesto adicional al contrato</Label>
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea {...register('description')} rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function GuardForm({ guard, posts, installations, onSubmit, onCancel }: { guard?: SecurityGuard; posts: SecurityPost[]; installations: Installation[]; onSubmit: (data: any) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityGuardFormData>({
    resolver: zodResolver(securityGuardSchema),
    defaultValues: {
      documentType: (guard?.documentType as any) || 'CC',
      documentNumber: guard?.documentNumber || '',
      name: guard?.name || '',
      lastName: guard?.lastName || '',
      phone: guard?.phone || '',
      email: guard?.email || '',
      position: guard?.position || '',
      securityPostId: guard?.securityPost?.id || '',
      schedule: guard?.schedule || '',
      installationId: guard?.installation?.id || '',
      isActive: guard?.isActive ?? true,
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
            <option value="NIT">NIT</option>
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
      <div>
        <Label>Cargo *</Label>
        <Input {...register('position')} placeholder="Ej: Vigilante, Supervisor" />
        {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Puesto de Vigilancia</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('securityPostId')}>
            <option value="">Sin puesto asignado</option>
            {posts.filter(p => p.status === 'ACTIVE').map((p) => (
              <option key={p.id} value={p.id}>{p.name} - {p.company.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Instalación *</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('installationId')}>
            <option value="">Seleccionar instalación</option>
            {installations.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          {errors.installationId && <p className="text-sm text-red-500">{errors.installationId.message}</p>}
        </div>
      </div>
      <div>
        <Label>Horario</Label>
        <Input {...register('schedule')} placeholder="Ej: 8x8, Turno A" />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
