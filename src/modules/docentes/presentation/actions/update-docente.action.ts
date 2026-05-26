'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseDocenteRepository } from '../../infrastructure/supabase-docente.repository';
import { UpdateDocenteUseCase } from '../../application/use-cases/update-docente.use-case';
import { updateDocenteSchema } from '../../application/dtos/update-docente.dto';
import { createClient } from '@/shared/lib/supabase/server';

interface UpdateResult {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export async function updateDocenteAction(data: Record<string, unknown>): Promise<UpdateResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para editar docentes.' };
  }

  const validated = updateDocenteSchema.safeParse(data);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const repo = new SupabaseDocenteRepository();
  const useCase = new UpdateDocenteUseCase(repo);

  try {
    await useCase.execute(validated.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el docente.';
    return { message };
  }

  revalidatePath('/director/docentes');
  revalidatePath('/secretaria/docentes');
  return { success: true, message: 'Docente actualizado exitosamente.' };
}
