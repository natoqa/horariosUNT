'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';
import { GetHorarioUseCase, GetHorarioResult } from '../../application/use-cases/get-horario.use-case';

export async function getHorarioAction(
  periodoId: string,
): Promise<{ data?: GetHorarioResult; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria' && role !== 'docente') {
    return { message: 'Solo director, secretaria y docente pueden acceder a esta vista.' };
  }

  const repo = new SupabaseHorarioRepository();
  const useCase = new GetHorarioUseCase(repo);

  try {
    const result = await useCase.execute(periodoId);
    if (!result) {
      return { message: 'No se encontró horario para este período.' };
    }
    return { data: result };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al obtener horario.' };
  }
}
