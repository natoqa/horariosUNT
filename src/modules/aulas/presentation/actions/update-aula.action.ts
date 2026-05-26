'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseAulaRepository } from '../../infrastructure/supabase-aula.repository';
import { UpdateAulaUseCase } from '../../application/use-cases/update-aula.use-case';
import { updateAulaSchema } from '../../application/dtos/update-aula.dto';
import { createClient } from '@/shared/lib/supabase/server';
import { AulaActionState } from './create-aula.action';

export async function updateAulaAction(
  id: string,
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
    return { message: 'No tiene permisos para modificar aulas.' };
  }

  const raw = {
    nombre: formData.get('nombre') as string,
    pabellon: formData.get('pabellon') as string,
    piso: formData.get('piso') as string,
    capacidad: formData.get('capacidad') as string,
    tipo: formData.get('tipo') as string,
    equipamiento: formData.get('equipamiento') as string,
    estado: formData.get('estado') as string,
  };

  const validated = updateAulaSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const repo = new SupabaseAulaRepository();
  const useCase = new UpdateAulaUseCase(repo);

  try {
    await useCase.execute(id, validated.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el aula.';
    return { message };
  }

  revalidatePath('/director/aulas');
  revalidatePath('/secretaria/aulas');
  return { success: true, message: 'Aula actualizada exitosamente.' };
}
