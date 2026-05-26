import { UserRole } from '@/shared/types';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
}
