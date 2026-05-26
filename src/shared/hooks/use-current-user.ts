'use client'

import { useAuth } from './use-auth';
import { User } from '@/modules/auth';

export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) {
    throw new Error('useCurrentUser must be used within an authenticated context');
  }
  return user;
}
