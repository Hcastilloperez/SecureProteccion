'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CompanyForm, PostForm, GuardForm } from '@/components/physical-security';
import { Shield, Building, Pencil, Trash2, MapPin, Plus } from 'lucide-react';
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('company', company)} aria-label="Editar empresa">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('company', company.id)} aria-label="Eliminar empresa">
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
                       <Button variant="ghost" size="icon" onClick={() => openEdit('post', post)} aria-label="Editar puesto">
                         <Pencil className="h-4 w-4" aria-hidden="true" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete('post', post.id)} aria-label="Eliminar puesto">
                         <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
                      <Button variant="ghost" size="icon" onClick={() => openEdit('guard', guard)} aria-label="Editar vigilante">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete('guard', guard.id)} aria-label="Eliminar vigilante">
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
          <Suspense fallback={<FormSkeleton />}>
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
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
}
