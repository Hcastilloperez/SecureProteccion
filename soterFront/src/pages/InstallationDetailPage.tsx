import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { installationService } from '@/services/installation.service';
import { contactService } from '@/services/contact.service';
import { authorityService } from '@/services/authority.service';
import { securityStudyService } from '@/services/security-study.service';
import { adminService } from '@/services/admin.service';
import { Installation, Contact, Authority, SecurityStudy, EquipmentType, Equipment } from '@/types';
import { ContactFormData, AuthorityFormData, SecurityStudyFormData, SecuritySystemFormData, MaintenanceFormData } from '@/lib/schemas';
import { ContactForm } from '@/components/forms/ContactForm';
import { AuthorityForm } from '@/components/forms/AuthorityForm';
import { EquipmentInstallationForm, EquipmentSelectorForm } from '@/components/forms/EquipmentInstallationForm';
import { ElectronicSystemForm } from '@/components/installation/ElectronicSystemForm';
import { ElectronicMaintenanceForm } from '@/components/installation/ElectronicMaintenanceForm';
import { formatDateTime, getStatusText } from '@/lib/utils';
import { ArrowLeft, Building2, MapPin, Phone, Mail, AlertTriangle, Plus, Pencil, Trash2, FileText, Bot, ShieldCheck, Server, Cpu, Wrench, HardDrive, TrendingUp, Calendar } from 'lucide-react';
import api from '@/config/axios';

const SecurityStudyForm = lazy(() => import('@/components/installation/StudyForm').then(m => ({ default: m.StudyForm })));

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

interface SecurityPostGuard {
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
  guards: SecurityPostGuard[];
}

function FormSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-10 bg-muted rounded animate-pulse" />
      <div className="h-20 bg-muted rounded animate-pulse" />
      <div className="h-20 bg-muted rounded animate-pulse" />
      <div className="h-20 bg-muted rounded animate-pulse" />
      <div className="h-10 bg-muted rounded animate-pulse" />
    </div>
  );
}

export default function InstallationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [securityStudies, setSecurityStudies] = useState<SecurityStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('contacts');

  const [systems, setSystems] = useState<SecuritySystem[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceSchedule[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [securityPosts, setSecurityPosts] = useState<SecurityPost[]>([]);
  const [electronicDialogOpen, setElectronicDialogOpen] = useState(false);
  const [electronicDialogType, setElectronicDialogType] = useState<'system' | 'equipment' | 'maintenance'>('system');
  const [editingElectronic, setEditingElectronic] = useState<any>(null);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);

  const [authorityDialogOpen, setAuthorityDialogOpen] = useState(false);
  const [editingAuthority, setEditingAuthority] = useState<Authority | null>(null);
  const [isAuthoritySubmitting, setIsAuthoritySubmitting] = useState(false);

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
      const [instRes, contactsRes, authoritiesRes, postsRes, studiesRes, systemsRes, equipmentRes, maintenanceRes, equipmentTypesRes] = await Promise.all([
        installationService.getById(id!),
        contactService.getAll(id!),
        authorityService.getAll(id!),
        api.get('/physical-security/posts', { params: { installationId: id } }),
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
        if (postsRes.data.success) setSecurityPosts(postsRes.data.data || []);
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

  const handleSaveContact = useCallback(async (data: ContactFormData) => {
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
  }, [id, editingContact]);

  const handleDeleteContact = useCallback(async (contactId: string) => {
    if (!confirm('¿Está seguro de eliminar este contacto?')) return;
    try {
      await contactService.delete(id!, contactId);
      const res = await contactService.getAll(id!);
      setContacts(res.data || []);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  }, [id]);

  const handleSaveAuthority = useCallback(async (data: AuthorityFormData) => {
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
  }, [id, editingAuthority]);

  const handleDeleteAuthority = useCallback(async (authorityId: string) => {
    if (!confirm('¿Está seguro de eliminar esta autoridad?')) return;
    try {
      await authorityService.delete(id!, authorityId);
      const res = await authorityService.getAll(id!);
      setAuthorities(res.data || []);
    } catch (error) {
      console.error('Error deleting authority:', error);
    }
  }, [id]);

  const handleSaveStudy = useCallback(async (data: SecurityStudyFormData) => {
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
  }, [id, editingStudy]);

  const handleDeleteStudy = useCallback(async (studyId: string) => {
    if (!confirm('¿Está seguro de eliminar este estudio?')) return;
    try {
      await securityStudyService.delete(id!, studyId);
      const res = await securityStudyService.getAll(id!);
      setSecurityStudies(res.data || []);
    } catch (error) {
      console.error('Error deleting study:', error);
    }
  }, [id]);

  const handleGenerateAI = useCallback(async (studyId: string) => {
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
  }, [id]);

  const handleSaveElectronic = useCallback(async (type: string, data: any) => {
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
  }, [id, editingElectronic]);

  const handleSelectEquipment = useCallback(async (data: { equipmentId: string; securitySystemId: string }) => {
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
  }, []);

  const handleInstallEquipment = useCallback(async (data: any) => {
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
  }, [id, selectedEquipmentForInstall]);

  const handleDeleteElectronic = useCallback(async (type: string, electronicId: string) => {
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
  }, [id]);

  const openElectronicEdit = useCallback((type: 'system' | 'equipment' | 'maintenance', item: any) => {
    setEditingElectronic(item);
    setElectronicDialogType(type);
    setElectronicDialogOpen(true);
  }, []);

  const openElectronicCreate = useCallback((type: 'system' | 'equipment' | 'maintenance') => {
    setEditingElectronic(null);
    setElectronicDialogType(type);
    setEquipmentAssignmentStep('select');
    setSelectedEquipmentForInstall(null);
    setElectronicDialogOpen(true);
  }, []);

  const totalGuards = useMemo(() => securityPosts.reduce((sum, p) => sum + p.guards.length, 0), [securityPosts]);

  const activeEquipments = useMemo(() => equipments.filter(e => e.status === 'ACTIVE').length, [equipments]);
  const inRepairEquipments = useMemo(() => equipments.filter(e => e.status === 'IN_REPAIR').length, [equipments]);
  const activeSystems = useMemo(() => systems.filter(s => s.isActive).length, [systems]);
  const scheduledMaintenances = useMemo(() => maintenances.filter(m => m.status === 'SCHEDULED').length, [maintenances]);

  const equipmentInvestment = useMemo(() => equipments.reduce((sum, e) => sum + (e.specifications?.cost || 0), 0), [equipments]);
  const completedMaintenanceCost = useMemo(() => maintenances.filter(m => m.status === 'COMPLETED').reduce((sum, m) => sum + (m.cost || 0), 0), [maintenances]);
  const scheduledMaintenanceCost = useMemo(() => maintenances.filter(m => m.status === 'SCHEDULED').reduce((sum, m) => sum + (m.cost || 0), 0), [maintenances]);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }), []);

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
          <TabsTrigger value="guards">Vigilantes ({totalGuards})</TabsTrigger>
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
                        <Button variant="ghost" size="icon" onClick={() => { setEditingContact(contact); setContactDialogOpen(true); }} aria-label="Editar contacto">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)} aria-label="Eliminar contacto">
                          <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
                        <Button variant="ghost" size="icon" onClick={() => { setEditingAuthority(authority); setAuthorityDialogOpen(true); }} aria-label="Editar autoridad">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAuthority(authority.id)} aria-label="Eliminar autoridad">
                          <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
          {securityPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No hay puestos de vigilancia registrados</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {securityPosts.map((post) => (
                <Card key={post.id} className="mb-4">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${post.status === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <MapPin className={`h-5 w-5 ${post.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{post.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{post.company.name}</p>
                        </div>
                      </div>
                      <Badge variant={post.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {post.status === 'ACTIVE' ? 'Activo' : post.status === 'INACTIVE' ? 'Inactivo' : post.status === 'SUSPENDED' ? 'Suspendido' : 'Pendiente'}
                      </Badge>
                    </div>
                    {post.schedule && <p className="text-sm text-muted-foreground mt-2">Horario: {post.schedule}</p>}
                  </CardHeader>
                  <CardContent>
                    {post.guards.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Sin vigilantes asignados</p>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {post.guards.map((guard) => (
                          <div key={guard.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <ShieldCheck className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{guard.name} {guard.lastName}</p>
                              <p className="text-sm text-muted-foreground truncate">{guard.position}</p>
                              <p className="text-xs text-muted-foreground">Tel: {guard.phone}</p>
                              {guard.schedule && <p className="text-xs text-muted-foreground">Horario: {guard.schedule}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
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
                <p className="text-xs text-muted-foreground">{activeEquipments} activos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Reparación</CardTitle>
                <Wrench className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inRepairEquipments}</div>
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
                <p className="text-xs text-muted-foreground">{activeSystems} activos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Próximos Mant.</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduledMaintenances}</div>
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
                  {currencyFormatter.format(equipmentInvestment)}
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
                  {currencyFormatter.format(completedMaintenanceCost)}
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
                  {currencyFormatter.format(scheduledMaintenanceCost)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button size="sm" className="hidden" onClick={() => openElectronicCreate('system')}>
              <Plus className="mr-2 h-4 w-4" />Nuevo Sistema
            </Button>
            <Button size="sm" className="hidden" onClick={() => openElectronicCreate('equipment')}>
              <Plus className="mr-2 h-4 w-4" />Nuevo Equipo
            </Button>
            <Button size="sm" className="hidden" onClick={() => openElectronicCreate('maintenance')}>
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
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openElectronicEdit('system', system)} aria-label="Editar sistema">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteElectronic('system', system.id)} aria-label="Eliminar sistema">
                          <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
                          {currencyFormatter.format(equipment.specifications.cost)}
                        </span>
                      )}
                      <Badge className={equipment.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : equipment.status === 'IN_REPAIR' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}>
                        {getStatusText(equipment.status)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openElectronicEdit('equipment', equipment)} aria-label="Editar equipo">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteElectronic('equipment', equipment.id)} aria-label="Eliminar equipo">
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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
                        {m.cost && <p className="text-sm font-medium text-blue-600">{currencyFormatter.format(m.cost)}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(m.scheduledDate).toLocaleDateString('es-CO')}</p>
                      </div>
                      <Badge className={m.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : m.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                        {getStatusText(m.status)}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openElectronicEdit('maintenance', m)} aria-label="Editar mantenimiento">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
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
                        <Button variant="ghost" size="icon" onClick={() => { setEditingStudy(study); setStudyDialogOpen(true); }} aria-label="Editar estudio">
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleGenerateAI(study.id)} disabled={isGeneratingAI} aria-label="Generar estudio con IA">
                          <Bot className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStudy(study.id)} aria-label="Eliminar estudio">
                          <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
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

      <Dialog open={electronicDialogOpen} onOpenChange={setElectronicDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingElectronic ? 'Editar' : equipmentAssignmentStep === 'install' ? 'Instalar' : 'Asignar'} {electronicDialogType === 'system' ? 'Sistema' : electronicDialogType === 'equipment' ? 'Equipo' : 'Mantenimiento'}
            </DialogTitle>
          </DialogHeader>
          {electronicDialogType === 'system' && (
            <ElectronicSystemForm system={editingElectronic} installationId={id} onSubmit={(d: SecuritySystemFormData) => handleSaveElectronic('system', d)} onCancel={() => setElectronicDialogOpen(false)} />
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
            <ElectronicMaintenanceForm maintenance={editingElectronic} systems={systems} onSubmit={(d: MaintenanceFormData) => handleSaveElectronic('maintenance', d)} onCancel={() => setElectronicDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={studyDialogOpen} onOpenChange={setStudyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStudy ? 'Editar' : 'Nuevo'} Estudio de Seguridad</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<FormSkeleton />}>
            <SecurityStudyForm
              defaultValues={editingStudy || undefined}
              onSubmit={handleSaveStudy}
              onCancel={() => setStudyDialogOpen(false)}
              isLoading={isStudySubmitting}
            />
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
}
