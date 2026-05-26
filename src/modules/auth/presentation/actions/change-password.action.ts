'use server'

import { redirect } from 'next/navigation';
import { SupabaseAuthRepository } from '../../infrastructure/supabase-auth.repository';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { changePasswordSchema } from '../../application/dtos/change-password.dto';

export interface AuthActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export async function changePasswordAction(
  _state: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState> {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const validatedFields = changePasswordSchema.safeParse({ 
    currentPassword, 
    newPassword, 
    confirmPassword 
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revise los campos ingresados.',
    };
  }

  const authRepo = new SupabaseAuthRepository();
  const changePasswordUseCase = new ChangePasswordUseCase(authRepo);

  try {
    await changePasswordUseCase.execute(validatedFields.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al cambiar la contraseña.';
    return {
      message,
    };
  }

  // Si tiene éxito, se cierra sesión y redirige
  redirect('/login');
}
