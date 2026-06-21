import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { installationService } from '@/services/installation.service';
import { Installation } from '@/types';
import { InstallationFormData } from '@/lib/schemas';
import { InstallationForm } from '@/components/forms/InstallationForm';
import { Plus, Search, Building2, MapPin, Pencil, Trash2 } from 'lucide-react';

export default function InstallationsPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInstallations();
  }, [search]);

  const fetchInstallations = async () => {
    try {
      setIsLoading(true);
      const response = await installationService.getAll({ search: search || undefined });
      if (response.success) {
        setInstallations(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching installations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: InstallationFormData) => {
    try {
      setIsSubmitting(true);
      const submitData = {
        ...data,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
      };
      if (editingInstallation) {
        await installationService.update(editingInstallation.id, submitData);
      } else {
        await installationService.create(submitData);
      }
      setDialogOpen(false);
      setEditingInstallation(null);
      fetchInstallations();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta instalación?')) return;
    try {
      await installationService.delete(id);
      fetchInstallations();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const openEdit = (installation: Installation) => {
    setEditingInstallation(installation);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instalaciones</h1>
          <p className="text-muted-foreground">Gestión de instalaciones protegidas</p>
        </div>
        <Button onClick={() => { setEditingInstallation(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Instalación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar instalaciones..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : installations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay instalaciones</h3>
              <p className="text-muted-foreground">Comienza agregando una nueva instalación</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {installations.map((installation) => (
                <div key={installation.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <Link to={`/installations/${installation.id}`}>
                          <h3 className="font-semibold hover:text-blue-600">{installation.name}</h3>
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {installation.address}, {installation.city}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            installation.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            installation.status === 'INACTIVE' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {installation.status === 'ACTIVE' ? 'Activa' : installation.status === 'INACTIVE' ? 'Inactiva' : 'En Mantenimiento'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(installation)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(installation.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInstallation ? 'Editar' : 'Nueva'} Instalación</DialogTitle>
          </DialogHeader>
          <InstallationForm
            defaultValues={editingInstallation || undefined}
            onSubmit={handleSave}
            onCancel={() => setDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}