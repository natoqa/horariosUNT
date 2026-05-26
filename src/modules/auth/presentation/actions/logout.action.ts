'use server'

import { redirect } from 'next/navigation';
import { SupabaseAuthRepository } from '../../infrastructure/supabase-auth.repository';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';

export async function logoutAction() {
  const authRepo = new SupabaseAuthRepository();
  const logoutUseCase = new LogoutUseCase(authRepo);

  try {
    await logoutUseCase.execute();
  } catch (error) {
    console.error('Error logging out:', error);
  }
  
  redirect('/login');
}
