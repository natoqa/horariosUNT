'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseAulaRepository } from '../../infrastructure/supabase-aula.repository';
import { CreateAulaUseCase } from '../../application/use-cases/create-aula.use-case';
import { createAulaSchema } from '../../application/dtos/create-aula.dto';
import { createClient } from '@/shared/lib/supabase/server';

export interface AulaActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export async function createAulaAction(
  _prevState: AulaActionState | undefined,
  formData: FormData,
): Promise<AulaActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para registrar aulas.' };
  }

  const raw = {
    codigo: formData.get('codigo') as string,
    nombre: formData.get('nombre') as string,
    pabellon: formData.get('pabellon') as string,
    piso: formData.get('piso') as string,
    capacidad: formData.get('capacidad') as string,
    tipo: formData.get('tipo') as string,
    equipamiento: formData.get('equipamiento') as string,
  };

  const validated = createAulaSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const repo = new SupabaseAulaRepository();
  const useCase = new CreateAulaUseCase(repo);

  try {
    await useCase.execute(validated.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar el aula.';
    return { message };
  }

  revalidatePath('/director/aulas');
  revalidatePath('/secretaria/aulas');
  return { success: true, message: 'Aula registrada exitosamente.' };
}
