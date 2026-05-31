'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';
import { SaveLectivaAsignacionUseCase } from '../../application/use-cases/save-lectiva-asignacion.use-case';
import { normalizeFormAccessor } from './form-utils';

export async function saveCargaLectivaAsignacionAction(
  _prevState: unknown,
  formData?: FormData | Record<string, any>,
) {
  const fd = normalizeFormAccessor(formData);
  if (!fd) {
    return { message: 'No se recibieron datos del formulario. Recarga la página e intenta nuevamente.' };
  }

  const periodoId = fd.get('periodoId')?.toString() ?? '';
  const docenteId = fd.get('docenteId')?.toString() ?? '';
  const horasLectivasAsignadas = Number(fd.get('horasLectivasAsignadas')?.toString() ?? '0');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'secretaria' && role !== 'director') {
    return { message: 'Solo secretaria o director pueden asignar carga lectiva.' };
  }

  const repository = new SupabaseCargaNoLectivaRepository();
  const useCase = new SaveLectivaAsignacionUseCase(repository);

  try {
    await useCase.execute(docenteId, periodoId, horasLectivasAsignadas);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al asignar la carga lectiva.';
    return { message };
  }

  revalidatePath('/secretaria/carga-no-lectiva');
  return { success: true, message: 'Carga lectiva asignada correctamente.' };
}
