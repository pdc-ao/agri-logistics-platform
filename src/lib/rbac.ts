import { UserRole } from '@/types';

export function hasRole(userRole: UserRole | undefined, allowed: UserRole[]) {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

// Declarative map (extend as needed)
export const RolePermissions: Record<string, UserRole[]> = {
  'admin-area': ['ADMIN'],
  'manage-products': ['PRODUCER', 'ADMIN'],
  'manage-storage': ['STORAGE_OWNER', 'ADMIN'],
  'manage-transport': ['TRANSPORTER', 'ADMIN'],
  'manage-facilities': ['TRANSFORMER', 'ADMIN'],
  'access-wallet': ['PRODUCER','CONSUMER','STORAGE_OWNER','TRANSPORTER','TRANSFORMER','ADMIN'],
};