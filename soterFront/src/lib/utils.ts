import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRoleName(role: string): string {
  const roleNames: Record<string, string> = {
    ADMIN: 'Administrador',
    OPERADOR_CENTRO: 'Operador Centro',
    VIGILANTE: 'Vigilante',
    COORDINADOR_FISICA: 'Coordinador Seguridad Física',
    COORDINADOR_ELECTRONICA: 'Coordinador Seguridad Electrónica',
    COORDINADOR_INVESTIGACIONES: 'Coordinador Investigaciones',
    ESCOLTA: 'Escolta',
    GERENTE_SEGURIDAD: 'Gerente de Seguridad',
  };
  return roleNames[role] || role;
}

export function getStatusText(status: string): string {
  const statusNames: Record<string, string> = {
    // Estados de Incidentes
    OPEN: 'Abierto',
    IN_PROGRESS: 'En Progreso',
    ESCALATED: 'Escalado',
    CLOSED: 'Cerrado',
    CANCELLED: 'Cancelado',
    VERIFIED: 'Verificado',
    // Prioridades
    LOW: 'Baja',
    MEDIUM: 'Media',
    HIGH: 'Alta',
    CRITICAL: 'Crítica',
    // Estados de Equipos
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    IN_REPAIR: 'En Reparación',
    DECOMMISSIONED: 'Dado de Baja',
    // Estados de Movimientos de Equipos
    INSTALLED: 'Instalado',
    MOVED: 'Movido',
    IN_STORAGE: 'En Almacén',
    // Estados de Movimientos de Escoltas
    SCHEDULED: 'Programado',
    STARTED: 'Iniciado',
    PAUSED: 'Pausado',
    NO_SHOW: 'No Presentó',
    // Estados de Asignaciones
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    // Estados de Contratos
    COMPLETED: 'Completado',
    EXPIRED: 'Expirado',
    // Estados de Puestos
    SUSPENDED: 'Suspendido',
  };
  return statusNames[status] || status;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: 'text-green-600 bg-green-100',
    MEDIUM: 'text-yellow-600 bg-yellow-100',
    HIGH: 'text-orange-600 bg-orange-100',
    CRITICAL: 'text-red-600 bg-red-100',
  };
  return colors[priority] || 'text-gray-600 bg-gray-100';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: 'text-blue-600 bg-blue-100',
    IN_PROGRESS: 'text-yellow-600 bg-yellow-100',
    ESCALATED: 'text-orange-600 bg-orange-100',
    CLOSED: 'text-green-600 bg-green-100',
    CANCELLED: 'text-gray-600 bg-gray-100',
    VERIFIED: 'text-purple-600 bg-purple-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
}