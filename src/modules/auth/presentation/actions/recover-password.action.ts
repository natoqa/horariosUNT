'use server'

import { SupabaseAuthRepository } from '../../infrastructure/supabase-auth.repository';
import { RecoverPasswordUseCase } from '../../application/use-cases/recover-password.use-case';
import { recoverPasswordSchema } from '../../application/dtos/recover-password.dto';

export async function recoverPasswordAction(state: any, formData: FormData) {
  const email = formData.get('email') as string;

  const validatedFields = recoverPasswordSchema.safeParse({ email });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revise los campos ingresados.',
    };
  }

  const authRepo = new SupabaseAuthRepository();
  const recoverUseCase = new RecoverPasswordUseCase(authRepo);

  try {
    await recoverUseCase.execute(validatedFields.data);
    return {
      success: true,
      message: 'Se ha enviado un enlace de recuperación a su correo.',
    };
  } catch (error: any) {
    return {
      message: error.message || 'Error al procesar la solicitud.',
    };
  }
}
