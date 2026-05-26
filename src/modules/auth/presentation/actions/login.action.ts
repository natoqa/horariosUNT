'use server'

import { redirect } from 'next/navigation';
import { SupabaseAuthRepository } from '../../infrastructure/supabase-auth.repository';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { loginSchema } from '../../application/dtos/login.dto';

export async function loginAction(state: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Revise los campos ingresados.',
    };
  }

  const authRepo = new SupabaseAuthRepository();
  const loginUseCase = new LoginUseCase(authRepo);

  let userRole = 'docente';

  try {
    const user = await loginUseCase.execute(validatedFields.data);
    userRole = user.role;
  } catch (error: any) {
    return {
      message: error.message || 'Credenciales inválidas.',
    };
  }

  redirect(`/${userRole}`);
}
