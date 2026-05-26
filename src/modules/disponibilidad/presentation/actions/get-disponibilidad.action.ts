'use server';

import { SupabaseDisponibilidadRepository } from '../../infrastructure/supabase-disponibilidad.repository';
import { GetDisponibilidadUseCase } from '../../application/use-cases/get-disponibilidad.use-case';
import { createClient } from '@/shared/lib/supabase/server';
import { Disponibilidad } from '../../domain/entities/disponibilidad.entity';

export async function getDisponibilidadAction(
  periodoId: string,
): Promise<{ data?: Disponibilidad[]; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role || 'docente';
  if (role !== 'docente') {
    return { message: 'Solo los docentes pueden consultar su disponibilidad.' };
  }

  const repo = new SupabaseDisponibilidadRepository();
  const useCase = new GetDisponibilidadUseCase(repo);

  try {
    // Resolve the actual docente_id from the public.docentes table
    const { data: docenteData, error: docenteError } = await supabase
      .from('docentes')
      .select('id')
      .eq('correo', user.email)
      .single();

    if (docenteError || !docenteData) {
      return { message: 'No se encontró un registro de docente asociado a este usuario.' };
    }

    const data = await useCase.execute(docenteData.id, periodoId);
    return { data };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al cargar disponibilidad.' };
  }
}
