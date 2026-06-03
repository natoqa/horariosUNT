'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseDisponibilidadRepository } from '../../infrastructure/supabase-disponibilidad.repository';
import { SaveDisponibilidadUseCase } from '../../application/use-cases/save-disponibilidad.use-case';
import { createClient } from '@/shared/lib/supabase/server';
import { DisponibilidadBlock } from '../../domain/repositories/disponibilidad.repository';
import { Periodo } from '@/modules/periodos';
import { RegimenDocente } from '@/shared/constants/categories';

export interface SaveDisponibilidadState {
  success?: boolean;
  message?: string;
}

export async function saveDisponibilidadAction(
  periodoId: string,
  blocks: DisponibilidadBlock[],
  docenteRegimen: RegimenDocente,
  docenteCargaMaxima?: number,
): Promise<SaveDisponibilidadState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role || 'docente';
  if (role !== 'docente') {
    return { message: 'Solo los docentes pueden registrar disponibilidad.' };
  }

  const { data: periodoData, error: periodoError } = await supabase
    .from('periodos')
    .select('*')
    .eq('id', periodoId)
    .single();

  if (periodoError || !periodoData) {
    return { message: 'El período indicado no existe.' };
  }

  const periodo: Periodo = {
    id: periodoData.id,
    name: periodoData.name,
    tipoCiclo: periodoData.tipo_ciclo,
    startDate: periodoData.start_date,
    endDate: periodoData.end_date,
    availabilityDeadline: periodoData.availability_deadline,
    state: periodoData.state,
    createdAt: periodoData.created_at,
    updatedAt: periodoData.updated_at,
  };

  const disponibilidadRepo = new SupabaseDisponibilidadRepository();
  const useCase = new SaveDisponibilidadUseCase(disponibilidadRepo);

  try {
    const { data: docenteData, error: docenteError } = await supabase
      .from('docentes')
      .select('id, carga_maxima')
      .eq('correo', user.email)
      .single();

    if (docenteError || !docenteData) {
      return { message: 'No se encontró un registro de docente asociado a este usuario.' };
    }

    await useCase.execute(docenteData.id, periodoId, blocks, periodo, docenteRegimen, docenteCargaMaxima ?? docenteData.carga_maxima);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al guardar disponibilidad.';
    return { message };
  }

  revalidatePath('/docente/disponibilidad');
  return { success: true, message: 'Disponibilidad registrada exitosamente.' };
}
