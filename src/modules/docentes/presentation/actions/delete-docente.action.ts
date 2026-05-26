'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseDocenteRepository } from '../../infrastructure/supabase-docente.repository';
import { createClient } from '@/shared/lib/supabase/server';

interface DeleteResult {
  success?: boolean;
  message?: string;
}

export async function deleteDocenteAction(id: string): Promise<DeleteResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'No tiene permisos para eliminar docentes.' };
  }

  const repo = new SupabaseDocenteRepository();

  try {
    const docente = await repo.findById(id);
    if (!docente) {
      return { message: 'Docente no encontrado.' };
    }

    await repo.delete(id);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al eliminar el docente.';
    return { message };
  }

  revalidatePath('/director/docentes');
  revalidatePath('/secretaria/docentes');
  return { success: true, message: 'Docente eliminado exitosamente.' };
}
