'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';
import { SaveActividadesCargaNoLectivaUseCase } from '../../application/use-cases/save-actividades-carga-no-lectiva.use-case';
import { ActividadNoLectivaInput } from '../../domain/repositories/carga-no-lectiva.repository';
import { ActividadNoLectivaTipo } from '../../domain/entities/carga-no-lectiva.entity';
import { normalizeFormAccessor } from './form-utils';

export async function saveActividadesCargaNoLectivaAction(
  _prevState: unknown,
  formData?: FormData | Record<string, any>,
) {
  const fd = normalizeFormAccessor(formData);
  if (!fd) {
    return { message: 'No se recibieron datos del formulario. Recarga la página e intenta nuevamente.' };
  }

  const periodoId = fd.get('periodoId')?.toString() ?? '';
  const tipos = (fd.getAll('tipo') || []).map((value: any) => value?.toString() as ActividadNoLectivaTipo);
  const horas = (fd.getAll('horas') || []).map((value: any) => Number(value?.toString()));
  const detalles = (fd.getAll('detalles') || []).map((value: any) => value?.toString());

  const actividades: ActividadNoLectivaInput[] = tipos.map((tipo, index) => ({
    tipo,
    horas: horas[index] ?? 0,
    detalles: detalles[index] ?? '',
  }));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const { data: docenteData, error: docenteError } = await supabase
    .from('docentes')
    .select('id')
    .eq('correo', user.email)
    .single();

  if (docenteError || !docenteData) {
    return { message: 'No se encontró un docente asociado a este usuario.' };
  }

  const repository = new SupabaseCargaNoLectivaRepository();
  const useCase = new SaveActividadesCargaNoLectivaUseCase(repository);

  try {
    await useCase.execute(docenteData.id, periodoId, actividades);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al guardar actividades no lectivas.';
    return { message };
  }

  revalidatePath('/docente/carga-no-lectiva');
  return { success: true, message: 'Actividades no lectivas guardadas correctamente.' };
}
