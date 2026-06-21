import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { installationService } from '@/services/installation.service';
import { contactService } from '@/services/contact.service';
import { authorityService } from '@/services/authority.service';
import { securityGuardService } from '@/services/security-guard.service';
import { securityStudyService } from '@/services/security-study.service';
import { adminService } from '@/services/admin.service';
import { Installation, Contact, Authority, SecurityGuard, SecurityStudy, EquipmentType, Equipment } from '@/types';
import { ContactFormData, AuthorityFormData, securityGuardSchema, SecurityGuardFormData, securityStudySchema, SecurityStudyFormData, securitySystemSchema, maintenanceSchema, SecuritySystemFormData, MaintenanceFormData } from '@/lib/schemas';
import { ContactForm } from '@/components/forms/ContactForm';
import { AuthorityForm } from '@/components/forms/AuthorityForm';
import { EquipmentInstallationForm, EquipmentSelectorForm } from '@/components/forms/EquipmentInstallationForm';
import { formatDateTime, getStatusText } from '@/lib/utils';
import { ArrowLeft, Building2, MapPin, Phone, Mail, AlertTriangle, Plus, Pencil, Trash2, FileText, Bot, ShieldCheck, Server, Cpu, Wrench, HardDrive, TrendingUp, Calendar } from 'lucide-react';
import api from '@/config/axios';

type TabValue = 'contacts' | 'authorities' | 'guards' | 'electronic' | 'studies';

interface SecuritySystem {
  id: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  installationId: string;
  _count?: { equipments: number; maintenanceSchedules: number };
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
  securitySystem?: { id: string; name: string };
}

export default function InstallationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [securityGuards, setSecurityGuards] = useState<SecurityGuard[]>([]);
  const [securityStudies, setSecurityStudies] = useState<SecurityStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('contacts');

  const [systems, setSystems] = useState<SecuritySystem[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceSchedule[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [electronicDialogOpen, setElectronicDialogOpen] = useState(false);
  const [electronicDialogType, setElectronicDialogType] = useState<'system' | 'equipment' | 'maintenance'>('system');
  const [editingElectronic, setEditingElectronic] = useState<any>(null);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);

  const [authorityDialogOpen, setAuthorityDialogOpen] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState<Authority | null>(null);
  const [isAuthoritySubmitting, setIsAuthoritySubmitting] = useState(false);

  const [guardDialogOpen, setGuardDialogOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<SecurityGuard | null>(null);
  const [isGuardSubmitting, setIsGuardSubmitting] = useState(false);

  const [studyDialogOpen, setStudyDialogOpen] = useState(false);
  const [editingStudy, setEditingStudy] = useState<SecurityStudy | null>(null);
  const [isStudySubmitting, setIsStudySubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [equipmentAssignmentStep, setEquipmentAssignmentStep] = useState<'select' | 'install'>('select');
  const [selectedEquipmentForInstall, setSelectedEquipmentForInstall] = useState<Equipment | null>(null);

  useEffect(() => {
    fetchInstallation();
  }, [id]);

  const fetchInstallation = async () => {
    try {
      setIsLoading(true);
      const [instRes, contactsRes, authoritiesRes, guardsRes, studiesRes, systemsRes, equipmentRes, maintenanceRes, equipmentTypesRes] = await Promise.all([
        installationService.getById(id!),
        contactService.getAll(id!),
        authorityService.getAll(id!),
        securityGuardService.getAll(id!),
        securityStudyService.getAll(id!),
        api.get('/electronic-security/systems', { params: { installationId: id } }),
        api.get('/electronic-security/equipments', { params: { installationId: id } }),
        api.get('/electronic-security/maintenance', { params: { installationId: id } }),
        adminService.getEquipmentTypes(),
      ]);
      if (instRes.success && instRes.data) {
        setInstallation(instRes.data);
        setContacts(contactsRes.data || []);
        setAuthorities(authoritiesRes.data || []);
        setSecurityGuards(guardsRes.data || []);
        setSecurityStudies(studiesRes.data || []);
        if (systemsRes.data.success) setSystems(systemsRes.data.data);
        if (equipmentRes.data.success) setEquipments(equipmentRes.data.data);
        if (maintenanceRes.data.success) setMaintenances(maintenanceRes.data.data);
        setEquipmentTypes(equipmentTypesRes || []);
      }
    } catch (error) {
      console.error('Error fetching installation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContact = async (data: ContactFormData) => {
    try {
      setIsContactSubmitting(true);
      if (editingContact) {
        await contactService.update(id!, editingContact.id, data);
      } else {
        await contactService.create(id!, data);
      }
      setContactDialogOpen(false);
      setEditingContact(null);
      const res = await contactService.getAll(id!);
      setContacts(res.data || []);
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('¿Está seguro de eliminar este contacto?')) return;
    try {
      await contactService.delete(id!, contactId);
      const res = await contactService.getAll(id!);
      setContacts(res.data || []);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleSaveAuthority = async (data: AuthorityFormData) => {
    try {
      setIsAuthoritySubmitting(true);
      if (editingAuthority) {
        await authorityService.update(id!, editingAuthority.id, data);
      } else {
        await authorityService.create(id!, data);
      }
      setAuthorityDialogOpen(false);
      setEditingAuthority(null);
      const res = await authorityService.getAll(id!);
      setAuthorities(res.data || []);
    } catch (error) {
      console.error('Error saving authority:', error);
    } finally {
      setIsAuthoritySubmitting(false);
    }
  };

  const handleDeleteAuthority = async (authorityId: string) => {
    if (!confirm('¿Está seguro de eliminar esta autoridad?')) return;
    try {
      await authorityService.delete(id!, authorityId);
      const res = await authorityService.getAll(id!);
      setAuthorities(res.data || []);
    } catch (error) {
      console.error('Error deleting authority:', error);
    }
  };

  const handleSaveGuard = async (data: SecurityGuardFormData) => {
    try {
      setIsGuardSubmitting(true);
      if (editingGuard) {
        await securityGuardService.update(id!, editingGuard.id, data);
      } else {
        await securityGuardService.create(id!, data);
      }
      setGuardDialogOpen(false);
      setEditingGuard(null);
      const res = await securityGuardService.getAll(id!);
      setSecurityGuards(res.data || []);
    } catch (error) {
      console.error('Error saving guard:', error);
    } finally {
      setIsGuardSubmitting(false);
    }
  };

  const handleDeleteGuard = async (guardId: string) => {
    if (!confirm('¿Está seguro de eliminar este vigilante?')) return;
    try {
      await securityGuardService.delete(id!, guardId);
      const res = await securityGuardService.getAll(id!);
      setSecurityGuards(res.data || []);
    } catch (error) {
      console.error('Error deleting guard:', error);
    }
  };

  const handleSaveStudy = async (data: SecurityStudyFormData) => {
    try {
      setIsStudySubmitting(true);
      if (editingStudy) {
        await securityStudyService.update(id!, editingStudy.id, data);
      } else {
        await securityStudyService.create(id!, data);
      }
      setStudyDialogOpen(false);
      setEditingStudy(null);
      const res = await securityStudyService.getAll(id!);
      setSecurityStudies(res.data || []);
    } catch (error) {
      console.error('Error saving study:', error);
    } finally {
      setIsStudySubmitting(false);
    }
  };

  const handleDeleteStudy = async (studyId: string) => {
    if (!confirm('¿Está seguro de eliminar este estudio?')) return;
    try {
      await securityStudyService.delete(id!, studyId);
      const res = await securityStudyService.getAll(id!);
      setSecurityStudies(res.data || []);
    } catch (error) {
      console.error('Error deleting study:', error);
    }
  };

  const handleGenerateAI = async (studyId: string) => {
    if (!confirm('¿Generar análisis con IA? Esto puede tardar algunos segundos.')) return;
    try {
      setIsGeneratingAI(true);
      await securityStudyService.generateWithAI(id!, studyId);
      const res = await securityStudyService.getAll(id!);
      setSecurityStudies(res.data || []);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      alert('Error al generar el análisis. Asegúrese de que Ollama esté funcionando.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveElectronic = async (type: string, data: any) => {
    try {
      const endpoint = type === 'system' ? '/electronic-security/systems' : type === 'equipment' ? '/electronic-security/equipments' : '/electronic-security/maintenance';
      if (editingElectronic) {
        await api.put(`${endpoint}/${editingElectronic.id}`, { ...data, installationId: id });
      } else {
        await api.post(endpoint, { ...data, installationId: id });
      }
      setElectronicDialogOpen(false);
      setEditingElectronic(null);
      const [systemsRes, equipmentRes, maintenanceRes] = await Promise.all([
        api.get('/electronic-security/systems', { params: { installationId: id } }),
        api.get('/electronic-security/equipments', { params: { installationId: id } }),
        api.get('/electronic-security/maintenance', { params: { installationId: id } }),
      ]);
      if (systemsRes.data.success) setSystems(systemsRes.data.data);
      if (equipmentRes.data.success) setEquipments(equipmentRes.data.data);
      if (maintenanceRes.data.success) setMaintenances(maintenanceRes.data.data);
    } catch (error) {
      console.error('Error saving electronic:', error);
    }
  };

  const handleSelectEquipment = async (data: { equipmentId: string; securitySystemId: string }) => {
    try {
      const response = await api.get(`/electronic-security/equipments?installationId=available`);
      if (response.data.success) {
        const equipment = response.data.data.find((eq: Equipment) => eq.id === data.equipmentId);
        if (equipment) {
          setSelectedEquipmentForInstall(equipment);
          setEquipmentAssignmentStep('install');
        }
      }
    } catch (error) {
      console.error('Error selecting equipment:', error);
    }
  };

  const handleInstallEquipment = async (data: any) => {
    try {
      await api.post('/electronic-security/equipments/assign', {
        equipmentId: selectedEquipmentForInstall?.id,
        installationId: id,
        ...data,
      });
      setElectronicDialogOpen(false);
      setEditingElectronic(null);
      setEquipmentAssignmentStep('select');
      setSelectedEquipmentForInstall(null);
      const [systemsRes, equipmentRes, maintenanceRes] = await Promise.all([
        api.get('/electronic-security/systems', { params: { installationId: id } }),
        api.get('/electronic-security/equipments', { params: { installationId: id } }),
        api.get('/electronic-security/maintenance', { params: { installationId: id } }),
      ]);
      if (systemsRes.data.success) setSystems(systemsRes.data.data);
      if (equipmentRes.data.success) setEquipments(equipmentRes.data.data);
      if (maintenanceRes.data.success) setMaintenances(maintenanceRes.data.data);
    } catch (error) {
      console.error('Error installing equipment:', error);
    }
  };

  const handleDeleteElectronic = async (type: string, electronicId: string) => {
    if (!confirm('¿Está seguro de eliminar?')) return;
    try {
      const endpoint = type === 'system' ? '/electronic-security/systems' : '/electronic-security/equipments';
      await api.delete(`${endpoint}/${electronicId}`);
      const [systemsRes, equipmentRes, maintenanceRes] = await Promise.all([
        api.get('/electronic-security/systems', { params: { installationId: id } }),
        api.get('/electronic-security/equipments', { params: { installationId: id } }),
        api.get('/electronic-security/maintenance', { params: { installationId: id } }),
      ]);
      if (systemsRes.data.success) setSystems(systemsRes.data.data);
      if (equipmentRes.data.success) setEquipments(equipmentRes.data.data);
      if (maintenanceRes.data.success) setMaintenances(maintenanceRes.data.data);
    } catch (error) {
      console.error('Error deleting electronic:', error);
    }
  };

  const openElectronicEdit = (type: 'system' | 'equipment' | 'maintenance', item: any) => {
    setEditingElectronic(item);
    setElectronicDialogType(type);
    setElectronicDialogOpen(true);
  };

  const openElectronicCreate = (type: 'system' | 'equipment' | 'maintenance') => {
    setEditingElectronic(null);
    setElectronicDialogType(type);
    setEquipmentAssignmentStep('select');
    setSelectedEquipmentForInstall(null);
    setElectronicDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!installation) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Instalación no encontrada</h3>
        <Button onClick={() => navigate('/installations')} className="mt-4">
          Volver a instalaciones
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/installations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{installation.name}</CardTitle>
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {installation.address}, {installation.city}, {installation.department}
                </div>
              </div>
            </div>
            <Badge
              variant={
                installation.status === 'ACTIVE'
                  ? 'default'
                  : installation.status === 'INACTIVE'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {installation.status === 'ACTIVE'
                ? 'Activa'
                : installation.status === 'INACTIVE'
                ? 'Inactiva'
                : 'En Mantenimiento'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {installation.description && (
            <p className="text-sm text-muted-foreground">{installation.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            Creada: {formatDateTime(installation.createdAt)}
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="contacts">Contactos ({contacts.length})</TabsTrigger>
          <TabsTrigger value="authorities">Autoridades ({authorities.length})</TabsTrigger>
          <TabsTrigger value="guards">Vigilantes ({securityGuards.length})</TabsTrigger>
          <TabsTrigger value="electronic">Seg. Electrónica ({systems.length})</TabsTrigger>
          <TabsTrigger value="studies">Estudios ({securityStudies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingContact(null); setContactDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Contacto
            </Button>
          </div>
          {contacts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No hay contactos registrados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{contact.name}</h4>
                          {contact.isEmergency && (
                            <Badge variant="destructive">Emergencia</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.position}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-1 mt-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingContact(contact); setContactDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="authorities" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingAuthority(null); setAuthorityDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Autoridad
            </Button>
          </div>
          {authorities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No hay autoridades registradas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {authorities.map((authority) => (
                <Card key={authority.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{authority.name}</h4>
                          <Badge variant="outline">{authority.type}</Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {authority.phone}
                        </div>
                        {authority.distance && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Distancia: {authority.distance} km
                          </p>
                        )}
                        {authority.responseTime && (
                          <p className="text-xs text-muted-foreground">
                            Tiempo respuesta: {authority.responseTime}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingAuthority(authority); setAuthorityDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAuthority(authority.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="guards" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingGuard(null); setGuardDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Vigilante
            </Button>
          </div>
          {securityGuards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No hay vigilantes registrados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {securityGuards.map((guard) => (
                <Card key={guard.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <ShieldCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{guard.name} {guard.lastName}</h4>
                          <p className="text-sm text-muted-foreground">{guard.position}</p>
                          <p className="text-xs text-muted-foreground">{guard.company}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingGuard(guard); setGuardDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGuard(guard.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Tel: {guard.phone}</p>
                      {guard.schedule && <p>Horario: {guard.schedule}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="electronic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipos</CardTitle>
                <HardDrive className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{equipments.length}</div>
                <p className="text-xs text-muted-foreground">{equipments.filter(e => e.status === 'ACTIVE').length} activos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Reparación</CardTitle>
                <Wrench className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{equipments.filter(e => e.status === 'IN_REPAIR').length}</div>
                <p className="text-xs text-muted-foreground">equipos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistemas</CardTitle>
                <Server className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systems.length}</div>
                <p className="text-xs text-muted-foreground">{systems.filter(s => s.isActive).length} activos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximos Mant.</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{maintenances.filter(m => m.status === 'SCHEDULED').length}</div>
                <p className="text-xs text-muted-foreground">programados</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Inversión Equipos</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(equipments.reduce((sum, e) => sum + (e.specifications?.cost || 0), 0))}
                </div>
                <p className="text-xs text-green-600">en equipos</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wrench className="h-4 w-4" /> Mantenimientos Realizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-700">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(maintenances.filter(m => m.status === 'COMPLETED').reduce((sum, m) => sum + (m.cost || 0), 0))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Mantenimientos Programados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-700">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(maintenances.filter(m => m.status === 'SCHEDULED').reduce((sum, m) => sum + (m.cost || 0), 0))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button size="sm" onClick={() => openElectronicCreate('system')}>
              <Plus className="mr-2 h-4 w-4" />Nuevo Sistema
            </Button>
            <Button size="sm" onClick={() => openElectronicCreate('equipment')}>
              <Plus className="mr-2 h-4 w-4" />Nuevo Equipo
            </Button>
            <Button size="sm" onClick={() => openElectronicCreate('maintenance')}>
              <Plus className="mr-2 h-4 w-4" />Nuevo Mantenimiento
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sistemas de Seguridad</CardTitle>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openElectronicEdit('system', system)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteElectronic('system', system.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground space-y-1">
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

          <Card>
            <CardHeader>
              <CardTitle>Equipos</CardTitle>
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
                          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(equipment.specifications.cost)}
                        </span>
                      )}
                      <Badge className={equipment.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : equipment.status === 'IN_REPAIR' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}>
                        {getStatusText(equipment.status)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openElectronicEdit('equipment', equipment)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteElectronic('equipment', equipment.id)}>
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

          <Card>
            <CardHeader>
              <CardTitle>Programación de Mantenimiento</CardTitle>
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
                          {m.type} • {m.frequency} • {m.securitySystem?.name || 'Sin sistema'}
                        </p>
                        {m.provider && <p className="text-xs text-muted-foreground">Proveedor: {m.provider}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {m.cost && <p className="text-sm font-medium text-blue-600">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(m.cost)}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(m.scheduledDate).toLocaleDateString('es-CO')}</p>
                      </div>
                      <Badge className={m.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : m.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                        {getStatusText(m.status)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openElectronicEdit('maintenance', m)}>
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

        <TabsContent value="studies" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingStudy(null); setStudyDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Estudio
            </Button>
          </div>
          {securityStudies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No hay estudios de seguridad</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {securityStudies.map((study) => (
                <Card key={study.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{study.title}</h4>
                          <Badge
                            variant={
                              study.status === 'APPROVED'
                                ? 'default'
                                : study.status === 'REJECTED'
                                ? 'destructive'
                                : study.status === 'IN_REVIEW'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {study.status === 'DRAFT'
                              ? 'Borrador'
                              : study.status === 'IN_REVIEW'
                              ? 'En Revisión'
                              : study.status === 'APPROVED'
                              ? 'Aprobado'
                              : 'Rechazado'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingStudy(study); setStudyDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleGenerateAI(study.id)} disabled={isGeneratingAI}>
                          <Bot className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStudy(study.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {study.description && (
                      <p className="text-sm text-muted-foreground mt-2">{study.description}</p>
                    )}
                    {study.riskLevel && (
                      <p className="text-sm font-medium mt-2">Nivel de Riesgo: {study.riskLevel}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Creado: {formatDateTime(study.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Editar' : 'Nuevo'} Contacto</DialogTitle>
          </DialogHeader>
          <ContactForm
            defaultValues={editingContact || undefined}
            onSubmit={handleSaveContact}
            onCancel={() => setContactDialogOpen(false)}
            isLoading={isContactSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={authorityDialogOpen} onOpenChange={setAuthorityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAuthority ? 'Editar' : 'Nueva'} Autoridad</DialogTitle>
          </DialogHeader>
          <AuthorityForm
            defaultValues={editingAuthority || undefined}
            onSubmit={handleSaveAuthority}
            onCancel={() => setAuthorityDialogOpen(false)}
            isLoading={isAuthoritySubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={guardDialogOpen} onOpenChange={setGuardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGuard ? 'Editar' : 'Nuevo'} Vigilante</DialogTitle>
          </DialogHeader>
          <SecurityGuardForm
            defaultValues={editingGuard as Partial<SecurityGuardFormData> | undefined}
            onSubmit={handleSaveGuard}
            onCancel={() => setGuardDialogOpen(false)}
            isLoading={isGuardSubmitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={electronicDialogOpen} onOpenChange={setElectronicDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingElectronic ? 'Editar' : equipmentAssignmentStep === 'install' ? 'Instalar' : 'Asignar'} {electronicDialogType === 'system' ? 'Sistema' : electronicDialogType === 'equipment' ? 'Equipo' : 'Mantenimiento'}
            </DialogTitle>
          </DialogHeader>
          {electronicDialogType === 'system' && (
            <ElectronicSystemForm system={editingElectronic} installationId={id} onSubmit={(d: any) => handleSaveElectronic('system', d)} onCancel={() => setElectronicDialogOpen(false)} />
          )}
          {electronicDialogType === 'equipment' && !editingElectronic && equipmentAssignmentStep === 'select' && (
            <EquipmentSelectorForm
              systems={systems as any}
              equipmentTypes={equipmentTypes}
              onSubmit={handleSelectEquipment}
              onCancel={() => setElectronicDialogOpen(false)}
            />
          )}
          {electronicDialogType === 'equipment' && !editingElectronic && equipmentAssignmentStep === 'install' && selectedEquipmentForInstall && (
            <EquipmentInstallationForm
              equipment={selectedEquipmentForInstall}
              systems={systems as any}
              equipmentTypes={equipmentTypes}
              onSubmit={handleInstallEquipment}
              onCancel={() => setEquipmentAssignmentStep('select')}
            />
          )}
          {electronicDialogType === 'equipment' && editingElectronic && (
            <EquipmentInstallationForm
              equipment={editingElectronic}
              systems={systems as any}
              equipmentTypes={equipmentTypes}
              onSubmit={handleInstallEquipment}
              onCancel={() => setElectronicDialogOpen(false)}
            />
          )}
          {electronicDialogType === 'maintenance' && (
            <ElectronicMaintenanceForm maintenance={editingElectronic} systems={systems} onSubmit={(d: any) => handleSaveElectronic('maintenance', d)} onCancel={() => setElectronicDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={studyDialogOpen} onOpenChange={setStudyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStudy ? 'Editar' : 'Nuevo'} Estudio de Seguridad</DialogTitle>
          </DialogHeader>
          <SecurityStudyForm
            defaultValues={editingStudy || undefined}
            onSubmit={handleSaveStudy}
            onCancel={() => setStudyDialogOpen(false)}
            isLoading={isStudySubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SecurityGuardForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues?: Partial<SecurityGuardFormData>;
  onSubmit: (data: SecurityGuardFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityGuardFormData>({
    resolver: zodResolver(securityGuardSchema),
    defaultValues: {
      documentType: 'CC',
      documentNumber: '',
      name: '',
      lastName: '',
      phone: '',
      email: '',
      position: '',
      companyId: '',
      securityPostId: '',
      schedule: '',
      isActive: true,
      installationId: '',
      observations: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Tipo Documento *</label>
          <select {...register('documentType')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
            <option value="CC">Cédula</option>
            <option value="CE">Cédula Extranjería</option>
            <option value="PP">Pasaporte</option>
            <option value="NIT">NIT</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Número Documento *</label>
          <input {...register('documentNumber')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
          {errors.documentNumber && <p className="text-xs text-red-500 mt-1">{errors.documentNumber.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Nombre *</label>
          <input {...register('name')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Apellido *</label>
          <input {...register('lastName')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
          {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Teléfono *</label>
          <input {...register('phone')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" {...register('email')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Cargo *</label>
        <input {...register('position')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
        {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Horario</label>
        <input {...register('schedule')} placeholder="Ej: 8x8" className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Observaciones</label>
        <textarea {...register('observations')} rows={2} className="w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : defaultValues?.name ? 'Actualizar' : 'Agregar'}
        </Button>
      </div>
    </form>
  );
}

function SecurityStudyForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues?: Partial<SecurityStudyFormData>;
  onSubmit: (data: SecurityStudyFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<SecurityStudyFormData>({
    resolver: zodResolver(securityStudySchema),
    defaultValues: {
      title: '',
      description: '',
      threatAnalysis: '',
      vulnerabilityAnalysis: '',
      recommendations: '',
      riskLevel: '',
      status: 'DRAFT',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Título *</label>
        <input {...register('title')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Descripción</label>
        <textarea {...register('description')} rows={2} className="w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Análisis de Amenazas</label>
        <textarea {...register('threatAnalysis')} rows={4} placeholder="Describa las principales amenazas de seguridad..." className="w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Análisis de Vulnerabilidades</label>
        <textarea {...register('vulnerabilityAnalysis')} rows={4} placeholder="Identifique las vulnerabilidades potenciales..." className="w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Recomendaciones</label>
        <textarea {...register('recommendations')} rows={4} placeholder="Proporcione recomendaciones específicas..." className="w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium">Nivel de Riesgo</label>
        <select {...register('riskLevel')} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="">Seleccionar</option>
          <option value="BAJO">Bajo</option>
          <option value="MEDIO">Medio</option>
          <option value="ALTO">Alto</option>
          <option value="CRÍTICO">Crítico</option>
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : defaultValues?.title ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

function ElectronicSystemForm({ system, installationId, onSubmit, onCancel }: { system?: any; installationId?: string; onSubmit: (data: any) => void; onCancel: () => void }) {
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

function ElectronicMaintenanceForm({ maintenance, systems, onSubmit, onCancel }: { maintenance?: any; systems: any[]; onSubmit: (data: any) => void; onCancel: () => void }) {
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
          {systems.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}