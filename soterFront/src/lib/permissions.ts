import { RoleType } from '../types';

export type Permission =
  | 'dashboard'
  | 'minuta'
  | 'incidents'
  | 'installations'
  | 'installations.view'
  | 'installations.edit'
  | 'security_electronic'
  | 'security_physical'
  | 'security_physical.view'
  | 'security_physical.edit'
  | 'studies'
  | 'escorts'
  | 'admin'
  | 'maintenance'
  | 'inventory'
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
    'installations.edit',
    'security_electronic',
    'security_physical',
    'security_physical.edit',
    'studies',
    'escorts',
    'admin',
    'maintenance',
    'inventory',
    'ai',
  ],
  OPERADOR_CENTRO: [
    'dashboard',
    'minuta',
    'installations',
    'installations.view',
    'security_physical',
    'security_physical.view',
  ],
  GERENTE_SEGURIDAD: [
    'dashboard',
    'installations',
    'installations.edit',
    'security_physical',
    'security_physical.edit',
    'studies',
    'escorts',
    'incidents',
    'ai',
  ],
  COORDINADOR_FISICA: [
    'dashboard',
    'incidents',
    'installations',
    'installations.edit',
    'studies',
    'security_physical',
    'security_physical.edit',
  ],
  COORDINADOR_ELECTRONICA: [
    'dashboard',
    'security_electronic',
    'maintenance',
    'inventory',
    'installations',
    'installations.view',
    'ai',
  ],
  COORDINADOR_INVESTIGACIONES: [
    'dashboard',
    'incidents',
    'installations',
    'installations.view',
    'studies',
    'security_physical',
    'security_physical.view',
  ],
  COORDINADOR_ADMINISTRATIVO: [
    'dashboard',
    'installations',
    'installations.edit',
  ],
  COORDINADOR_ACCIONES_LOCALITATIVAS: [
    'dashboard',
    'installations',
    'installations.edit',
    'maintenance',
  ],
  ESCOLTA: [
    'dashboard',
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