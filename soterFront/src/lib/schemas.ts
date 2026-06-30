import { z } from 'zod';

export const installationStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'IN_MAINTENANCE']);
export type InstallationStatusEnum = z.infer<typeof installationStatusEnum>;

export const installationSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').max(300),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres').max(100),
  department: z.string().min(2, 'El departamento debe tener al menos 2 caracteres').max(100),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  description: z.string().max(1000).optional(),
  status: installationStatusEnum.default('ACTIVE'),
});

export type InstallationFormData = z.infer<typeof installationSchema>;

export const installationUpdateSchema = installationSchema.partial();
export type InstallationUpdateData = z.infer<typeof installationUpdateSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  position: z.string().min(2, 'El cargo debe tener al menos 2 caracteres').max(100),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos').max(20),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  isEmergency: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const authoritySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  type: z.string().min(2, 'El tipo debe tener al menos 2 caracteres').max(100),
  phone: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos').max(20),
  address: z.string().max(300).optional(),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  distance: z.coerce.number().min(0).optional().nullable(),
  responseTime: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export type AuthorityFormData = z.infer<typeof authoritySchema>;

export const securityStudySchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  description: z.string().max(1000).optional(),
  threatAnalysis: z.string().max(5000).optional(),
  vulnerabilityAnalysis: z.string().max(5000).optional(),
  recommendations: z.string().max(5000).optional(),
  riskLevel: z.string().max(50).optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED']).default('DRAFT'),
});

export type SecurityStudyFormData = z.infer<typeof securityStudySchema>;

export const aiConfigurationSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  model: z.string().min(1, 'Seleccione un modelo'),
  baseUrl: z.string().url('URL inválida').default('http://localhost:11434'),
  temperature: z.coerce.number().min(0).max(2).default(0.7),
  maxTokens: z.coerce.number().min(1).max(4096).default(512),
  systemPrompt: z.string().max(2000).optional(),
  isActive: z.boolean().default(true),
});

export type AIConfigurationFormData = z.infer<typeof aiConfigurationSchema>;

export const securitySystemSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  type: z.string().min(1, 'El tipo es requerido').max(100),
  description: z.string().max(1000).optional(),
  installationDate: z.string().optional(),
  isActive: z.boolean().default(true),
  installationId: z.string().min(1, 'Seleccione una instalación'),
});

export type SecuritySystemFormData = z.infer<typeof securitySystemSchema>;

export const investmentContractSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(50),
  name: z.string().min(2, 'El nombre es requerido').max(200),
  description: z.string().max(500).optional(),
  provider: z.string().max(200).optional(),
  contractNumber: z.string().max(50).optional(),
  orderNumber: z.string().max(50).optional(),
  investmentType: z.enum(['PURCHASE', 'LEASE', 'DONATION', 'TRANSFER']).default('PURCHASE'),
  totalAmount: z.coerce.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']).default('ACTIVE'),
});

export type InvestmentContractFormData = z.infer<typeof investmentContractSchema>;

export const equipmentSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  type: z.string().min(2, 'El tipo es requerido').max(100),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'IN_REPAIR', 'DECOMMISSIONED', 'STANDBY']).default('STANDBY'),
  location: z.string().max(200).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  ipAddress: z.string().ip('Dirección IP inválida').optional().or(z.literal('')),
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/, 'MAC inválida (formato: 00:00:00:00:00:00)').optional().or(z.literal('')),
  firmwareVersion: z.string().max(50).optional(),
  expirationDate: z.string().optional(),
  notes: z.string().max(500).optional(),
  specifications: z.object({
    cost: z.coerce.number().min(0).optional(),
  }).optional(),
  purchaseDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  investmentContractId: z.string().optional(),
  installationId: z.string().optional(),
  securitySystemId: z.string().optional(),
  equipmentTypeId: z.string().optional(),
});

export type EquipmentFormData = z.infer<typeof equipmentSchema>;

export const equipmentMovementSchema = z.object({
  equipmentId: z.string().min(1, 'Seleccione un equipo'),
  fromInstallationId: z.string().optional(),
  toInstallationId: z.string().min(1, 'Seleccione la instalación destino'),
  fromSecuritySystemId: z.string().optional(),
  toSecuritySystemId: z.string().optional(),
  movementDate: z.string().min(1, 'La fecha de movimiento es requerida'),
  status: z.enum(['INSTALLED', 'MOVED', 'IN_STORAGE', 'IN_REPAIR', 'DECOMMISSIONED']).default('MOVED'),
  reason: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export type EquipmentMovementFormData = z.infer<typeof equipmentMovementSchema>;

export const maintenanceSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres').max(200),
  type: z.string().min(2, 'El tipo es requerido').max(100),
  frequency: z.string().min(2, 'La frecuencia es requerida').max(50),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  scheduledDate: z.string().min(1, 'La fecha programada es requerida'),
  completedDate: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  provider: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  securitySystemId: z.string().uuid('Seleccione un sistema').optional(),
  equipmentId: z.string().uuid().optional(),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export const securityGuardSchema = z.object({
  documentType: z.enum(['CC', 'CE', 'PP', 'NIT']).default('CC'),
  documentNumber: z.string().min(4, 'Número de documento inválido').max(20),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(100),
  phone: z.string().min(7, 'Teléfono inválido').max(20),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  position: z.string().min(2, 'El cargo es requerido').max(100),
  companyId: z.string().optional(),
  securityPostId: z.string().optional(),
  schedule: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  installationId: z.string().min(1, 'Seleccione una instalación'),
  observations: z.string().max(500).optional(),
});

export type SecurityGuardFormData = z.infer<typeof securityGuardSchema>;

export const securityCompanySchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(200),
  nit: z.string().min(1, 'El NIT es requerido').max(20),
  legalRepresentative: z.string().max(200).optional(),
  contractNumber: z.string().max(50).optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  contractAmount: z.coerce.number().min(0).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  address: z.string().max(300).optional(),
  isActive: z.boolean().default(true),
});

export type SecurityCompanyFormData = z.infer<typeof securityCompanySchema>;

export const securityPostSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido').max(200),
  description: z.string().max(500).optional(),
  schedule: z.string().max(50).optional(),
  guardsRequired: z.coerce.number().int().min(1).default(1),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).default('PENDING'),
  companyId: z.string().min(1, 'Seleccione una empresa'),
  installationId: z.string().min(1, 'Seleccione una instalación'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isAdditional: z.boolean().default(false),
});

export type SecurityPostFormData = z.infer<typeof securityPostSchema>;

export const escortSchema = z.object({
  documentType: z.enum(['CC', 'CE', 'PP', 'NIT']).default('CC'),
  documentNumber: z.string().min(4, 'Número de documento inválido').max(20),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(100),
  phone: z.string().min(7, 'Teléfono inválido').max(20),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  position: z.string().min(2, 'El cargo es requerido').max(100),
  licenseType: z.string().max(50).optional(),
  licenseNumber: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  observations: z.string().max(500).optional(),
});

export type EscortFormData = z.infer<typeof escortSchema>;

export const escortRouteSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  description: z.string().max(500).optional(),
  escortId: z.string().min(1, 'Seleccione un escolta'),
  installationId: z.string().optional(),
  distance: z.coerce.number().min(0).optional(),
  estimatedTime: z.coerce.number().min(0).optional(),
  waypoints: z.any().optional(),
  isActive: z.boolean().default(true),
});

export type EscortRouteFormData = z.infer<typeof escortRouteSchema>;

export const escortAssignmentSchema = z.object({
  escortId: z.string().min(1, 'Seleccione un escolta'),
  routeId: z.string().optional(),
  officialName: z.string().min(2, 'El nombre del funcionario es requerido').max(200),
  officialDocument: z.string().min(4, 'El documento es requerido').max(50),
  officialPhone: z.string().max(20).optional(),
  officialPosition: z.string().max(100).optional(),
  destination: z.string().min(2, 'El destino es requerido').max(300),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  observations: z.string().max(500).optional(),
});

export type EscortAssignmentFormData = z.infer<typeof escortAssignmentSchema>;

export const escortMovementSchema = z.object({
  assignmentId: z.string().optional(),
  routeId: z.string().min(1, 'Seleccione una ruta'),
  escortId: z.string().min(1, 'Seleccione un escolta'),
  date: z.string().min(1, 'La fecha es requerida'),
  startTime: z.string().min(1, 'La hora de inicio es requerida'),
  endTime: z.string().optional(),
  startLatitude: z.coerce.number().min(-90).max(90).optional(),
  startLongitude: z.coerce.number().min(-180).max(180).optional(),
  endLatitude: z.coerce.number().min(-90).max(90).optional(),
  endLongitude: z.coerce.number().min(-180).max(180).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  observations: z.string().max(500).optional(),
  routeTrace: z.any().optional(),
});

export type EscortMovementFormData = z.infer<typeof escortMovementSchema>;

export const incidentSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(2000),
  incidentTypeId: z.string().min(1, 'Seleccione un tipo de incidente'),
  installationId: z.string().min(1, 'Seleccione una instalación'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  location: z.string().max(300).optional(),
  reportedBy: z.string().min(2, 'El nombre del reportador es requerido').max(100),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

export type IncidentFormData = z.infer<typeof incidentSchema>;

export const incidentUpdateSchema = incidentSchema.partial();
export type IncidentUpdateData = z.infer<typeof incidentUpdateSchema>;

export const statusSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(50),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  type: z.string().default('INCIDENT'),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
});

export type StatusFormData = z.infer<typeof statusSchema>;

export const incidentTypeSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(50),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  category: z.enum(['SEGURIDAD', 'EMERGENCIA', 'SALUD', 'CONDUCTA', 'DAÑOS', 'OPERATIVO', 'MANTENIMIENTO', 'OTROS']).default('SEGURIDAD'),
  description: z.string().max(500).optional(),
  slaHours: z.coerce.number().int().min(1).max(168).default(24),
  coordinatorType: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type IncidentTypeFormData = z.infer<typeof incidentTypeSchema>;

export const configurationSchema = z.object({
  key: z.string().min(1, 'La clave es requerida').max(100),
  value: z.string().min(1, 'El valor es requerido').max(500),
  type: z.enum(['string', 'number', 'boolean']).default('string'),
  description: z.string().max(500).optional(),
  category: z.string().max(100).default('general'),
  isPublic: z.boolean().default(false),
});

export type ConfigurationFormData = z.infer<typeof configurationSchema>;

export const userSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(100),
  phone: z.string().min(7, 'Teléfono inválido').max(20).optional(),
  role: z.enum([
    'ADMIN',
    'OPERADOR_CENTRO',
    'VIGILANTE',
    'COORDINADOR_FISICA',
    'COORDINADOR_ELECTRONICA',
    'COORDINADOR_INVESTIGACIONES',
    'COORDINADOR_ADMINISTRATIVO',
    'COORDINADOR_ACCIONES_LOCALITATIVAS',
    'ESCOLTA',
    'GERENTE_SEGURIDAD',
  ]),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

const permissionsSchema = z.record(z.string(), z.boolean().optional());

export const roleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  description: z.string().max(255).optional(),
  permissions: permissionsSchema,
});

export type RoleFormData = z.infer<typeof roleSchema>;