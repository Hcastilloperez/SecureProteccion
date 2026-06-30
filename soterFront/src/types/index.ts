export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phone?: string;
  role: RoleType;
  permissions?: Record<string, boolean>;
  status: UserStatus;
  installation?: Installation;
  createdAt: string;
  updatedAt: string;
}

export type RoleType =
  | 'ADMIN'
  | 'OPERADOR_CENTRO'
  | 'VIGILANTE'
  | 'COORDINADOR_FISICA'
  | 'COORDINADOR_ELECTRONICA'
  | 'COORDINADOR_INVESTIGACIONES'
  | 'COORDINADOR_ADMINISTRATIVO'
  | 'COORDINADOR_ACCIONES_LOCALITATIVAS'
  | 'ESCOLTA'
  | 'GERENTE_SEGURIDAD';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Installation {
  id: string;
  name: string;
  address: string;
  city: string;
  department: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  status: InstallationStatus;
  createdAt: string;
  updatedAt: string;
}

export type InstallationStatus = 'ACTIVE' | 'INACTIVE' | 'IN_MAINTENANCE';

export interface Incident {
  id: string;
  title: string;
  description: string;
  incidentTypeId: string;
  incidentType: IncidentType;
  installationId: string;
  installation: Installation;
  statusId: string;
  status: Status;
  priority: IncidentPriority;
  assignedToId?: string;
  assignedTo?: User;
  reportedBy: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  finalReport?: string;
  closedAt?: string;
  aiAnalysis?: string;
  createdAt: string;
  updatedAt: string;
  timelines?: IncidentTimeline[];
  attachments?: IncidentAttachment[];
  recommendations?: IncidentRecommendation[];
}

export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'CLOSED' | 'CANCELLED';

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IncidentType {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  coordinatorType?: RoleType;
  slaHours?: number;
  isActive: boolean;
}

export interface IncidentTimeline {
  id: string;
  incidentId: string;
  userId: string;
  user: User;
  comment: string;
  isInternal: boolean;
  createdAt: string;
}

export interface IncidentAttachment {
  id: string;
  incidentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  mimeType: string;
  description?: string;
  createdAt: string;
}

export interface IncidentRecommendation {
  id: string;
  incidentId?: string;
  installationId?: string;
  recommendation: string;
  confidence?: number;
  reasoning?: string;
  source?: string;
  createdAt: string;
}

export interface Status {
  id: string;
  code: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  order: number;
}

export interface EquipmentType {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  systemType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecuritySystem {
  id: string;
  installationId: string;
  installation?: Installation;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  description?: string;
  isActive: boolean;
  installationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  investmentContractId?: string;
  investmentContract?: InvestmentContract;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status: EquipmentStatus;
  location?: string;
  ipAddress?: string;
  macAddress?: string;
  firmwareVersion?: string;
  lastMaintenance?: string;
  expirationDate?: string;
  notes?: string;
  specifications?: Record<string, any>;
  purchaseDate?: string;
  deliveryDate?: string;
  installationDate?: string;
  installationId?: string;
  installation?: Installation;
  securitySystemId?: string;
  securitySystem?: SecuritySystem;
  equipmentTypeId?: string;
  equipmentType?: EquipmentType;
  latitude?: number;
  longitude?: number;
  movements?: EquipmentMovement[];
  createdAt: string;
  updatedAt: string;
}

export type EquipmentStatus = 'ACTIVE' | 'INACTIVE' | 'IN_REPAIR' | 'DECOMMISSIONED' | 'STANDBY';

export type EquipmentMovementStatus = 'INSTALLED' | 'MOVED' | 'IN_STORAGE' | 'IN_REPAIR' | 'DECOMMISSIONED';

export interface InvestmentContract {
  id: string;
  code: string;
  name: string;
  description?: string;
  provider?: string;
  contractNumber?: string;
  orderNumber?: string;
  investmentType: 'PURCHASE' | 'LEASE' | 'DONATION' | 'TRANSFER';
  totalAmount?: number;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentMovement {
  id: string;
  equipmentId: string;
  equipment?: Equipment;
  fromInstallationId?: string;
  fromInstallation?: Installation;
  toInstallationId: string;
  toInstallation?: Installation;
  fromSecuritySystemId?: string;
  fromSecuritySystem?: SecuritySystem;
  toSecuritySystemId?: string;
  toSecuritySystem?: SecuritySystem;
  movementDate: string;
  status: EquipmentMovementStatus;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId?: string;
  equipment?: Equipment;
  securitySystemId?: string;
  securitySystem?: SecuritySystem;
  title: string;
  description?: string;
  type: string;
  frequency: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate?: string;
  cost?: number;
  provider?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Contact {
  id: string;
  installationId: string;
  installation?: Installation;
  name: string;
  position: string;
  phone: string;
  email?: string;
  isEmergency: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Authority {
  id: string;
  installationId: string;
  installation?: Installation;
  name: string;
  type: string;
  phone: string;
  address?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  responseTime?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityGuard {
  id: string;
  installationId: string;
  installation?: Installation;
  userId?: string;
  user?: User;
  documentType: string;
  documentNumber: string;
  name: string;
  lastName: string;
  phone: string;
  email?: string;
  position: string;
  companyId?: string;
  company?: string;
  securityPostId?: string;
  schedule?: string;
  isActive: boolean;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Escort {
  id: string;
  documentType: string;
  documentNumber: string;
  name: string;
  lastName: string;
  phone: string;
  email?: string;
  position: string;
  licenseType?: string;
  licenseNumber?: string;
  isActive: boolean;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscortRoute {
  id: string;
  escortId: string;
  escort?: Escort;
  installationId?: string;
  installation?: Installation;
  name: string;
  description?: string;
  waypoints?: any;
  distance?: number;
  estimatedTime?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EscortAssignmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface EscortAssignment {
  id: string;
  escortId: string;
  escort?: Escort;
  routeId?: string;
  route?: EscortRoute;
  officialName: string;
  officialDocument: string;
  officialPhone?: string;
  officialPosition?: string;
  destination: string;
  startDate: string;
  endDate?: string;
  status: EscortAssignmentStatus;
  observations?: string;
  movements?: EscortMovement[];
  createdAt: string;
  updatedAt: string;
}

export interface EscortMovement {
  id: string;
  assignmentId?: string;
  assignment?: EscortAssignment;
  routeId: string;
  route?: EscortRoute;
  escortId: string;
  escort?: Escort;
  userId?: string;
  user?: User;
  date: string;
  startTime: string;
  endTime?: string;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  status: MovementStatus;
  observations?: string;
  routeTrace?: any;
  createdAt: string;
  updatedAt: string;
}

export type MovementStatus = 'SCHEDULED' | 'STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Configuration {
  id: string;
  key: string;
  value: string;
  type: string;
  description?: string;
  isPublic: boolean;
  category: string;
}

export interface AIConfiguration {
  id: string;
  installationId?: string;
  installation?: Installation;
  name: string;
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionDefinition {
  id: string;
  key: string;
  label: string;
  description?: string;
  isActive: boolean;
}

export type SecurityStudyStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface SecurityStudy {
  id: string;
  installationId: string;
  installation?: Installation;
  title: string;
  description?: string;
  threatAnalysis?: string;
  vulnerabilityAnalysis?: string;
  recommendations?: string;
  riskLevel?: string;
  status: SecurityStudyStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalIncidents: number;
  openIncidents: number;
  installationsCount: number;
  securityGuardsCount: number;
  escortsCount: number;
  activeSystems: number;
  incidentsByPriority: Record<string, number>;
  recentIncidents: Incident[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}