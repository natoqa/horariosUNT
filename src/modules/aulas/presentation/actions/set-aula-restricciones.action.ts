'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseAulaRepository } from '../../infrastructure/supabase-aula.repository';
import { SetAulaRestriccionesUseCase, SetRestriccionesInput } from '../../application/use-cases/set-aula-restricciones.use-case';
import { AulaRestriccion } from '../../domain/entities/aula.entity';
import { createClient } from '@/shared/lib/supabase/server';

export async function getAulaRestriccionesAction(
  aulaId: string,
): Promise<{ data?: AulaRestriccion[]; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const repo = new SupabaseAulaRepository();
  const useCase = new SetAulaRestriccionesUseCase(repo);

  try {
    const data = await useCase.getRestriccionesForAula(aulaId);
    return { data };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al cargar restricciones.' };
  }
}

export async function saveAulaRestriccionesAction(
  aulaId: string,
  restricciones: SetRestriccionesInput['restricciones'],
): Promise<{ success?: boolean; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para modificar restricciones de aulas.' };
  }

  const repo = new SupabaseAulaRepository();
  const useCase = new SetAulaRestriccionesUseCase(repo);

  try {
    await useCase.execute({ aulaId, restricciones });
    revalidatePath('/director/aulas');
    revalidatePath('/secretaria/aulas');
    return { success: true, message: 'Restricciones de aula actualizadas correctamente.' };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al guardar restricciones.' };
  }
}
