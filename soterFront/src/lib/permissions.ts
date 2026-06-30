import { RoleType } from '../types';

export type Permission =
  | 'dashboard'
  | 'minuta'
  | 'incidents'
  | 'installations'
  | 'electronic_security'
  | 'inventory'
  | 'security_physical'
  | 'escorts'
  | 'admin'
  | 'maintenance'
  | 'ai';

export type ModuleConfig = {
  name: string;
  icon: string;
  href: string;
  permissions: Permission[];
};

export const rolePermissions: Record<RoleType, Permission[]> = {
  ADMIN: [
    'dashboard',
    'minuta',
    'incidents',
    'installations',
    'electronic_security',
    'inventory',
    'security_physical',
    'escorts',
    'admin',
    'maintenance',
    'ai',
  ],
  OPERADOR_CENTRO: [
    'dashboard',
    'minuta',
    'installations',
    'electronic_security',
    'inventory',
  ],
  GERENTE_SEGURIDAD: [
    'dashboard',
    'installations',
    'security_physical',
    'escorts',
    'incidents',
    'ai',
    'electronic_security',
    'inventory',
  ],
  COORDINADOR_FISICA: [
    'dashboard',
    'incidents',
    'installations',
    'security_physical',
    'electronic_security',
    'inventory',
  ],
  COORDINADOR_ELECTRONICA: [
    'dashboard',
    'incidents',
    'electronic_security',
    'inventory',
    'maintenance',
    'ai',
  ],
  COORDINADOR_INVESTIGACIONES: [
    'dashboard',
    'incidents',
  ],
  COORDINADOR_ADMINISTRATIVO: [
    'dashboard',
    'installations',
  ],
  COORDINADOR_ACCIONES_LOCALITATIVAS: [
    'dashboard',
    'installations',
    'maintenance',
  ],
  ESCOLTA: [
    'dashboard',
    'escorts',
  ],
  VIGILANTE: [
    'dashboard',
  ],
};

export function hasPermission(role: RoleType, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: RoleType, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}
