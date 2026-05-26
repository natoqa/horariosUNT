'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';
import { PublishHorarioUseCase } from '../../application/use-cases/publish-horario.use-case';
import { approveHorarioSchema } from '../../application/dtos/approve-horario.dto';
import { changeStateAction } from '@/modules/periodos';

interface PublishHorarioActionResult {
  success?: boolean;
  message?: string;
}

export async function publishHorarioAction(
  horarioId: string,
): Promise<PublishHorarioActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'Solo el director puede publicar horarios.' };
  }

  const validated = approveHorarioSchema.safeParse({ horarioId });
  if (!validated.success) {
    return { message: 'ID de horario inválido.' };
  }

  const horarioRepo = new SupabaseHorarioRepository();

  const horario = await horarioRepo.findById(validated.data.horarioId);
  if (!horario) {
    return { message: 'Horario no encontrado.' };
  }

  const useCase = new PublishHorarioUseCase(horarioRepo);

  try {
    const result = await useCase.execute(validated.data);

    if (!result.success) {
      return { message: result.message };
    }
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al publicar horario.' };
  }

  const stateResult = await changeStateAction(horario.periodoId, 'Publicado');
  if (stateResult.message && !stateResult.success) {
    return { message: `Horario publicado, pero error al cambiar estado del período: ${stateResult.message}` };
  }

  revalidatePath('/director/horarios');
  revalidatePath('/secretaria/horarios');
  revalidatePath('/docente/horarios');

  return { success: true, message: 'Horario publicado exitosamente.' };
}
