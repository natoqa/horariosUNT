'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';
import { ApproveCargaNoLectivaUseCase } from '../../application/use-cases/approve-carga-no-lectiva.use-case';
import { approveCargaNoLectivaSchema } from '../../application/dtos/approve-carga-no-lectiva.dto';
import { normalizeFormAccessor } from './form-utils';

export async function approveCargaNoLectivaAction(
  _prevState: unknown,
  formData?: FormData | Record<string, any>,
) {
  const fd = normalizeFormAccessor(formData);
  if (!fd) {
    return { message: 'No se recibieron datos del formulario. Recarga la página e intenta nuevamente.' };
  }

  const cargaId = fd.get('cargaId')?.toString() ?? '';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo director o secretaria pueden aprobar cargas no lectivas.' };
  }

  const validated = approveCargaNoLectivaSchema.safeParse({ cargaId });
  if (!validated.success) {
    return { message: 'Solicitud de aprobación inválida.' };
  }

  const repository = new SupabaseCargaNoLectivaRepository();
  const useCase = new ApproveCargaNoLectivaUseCase(repository);

  try {
    await useCase.execute(validated.data.cargaId, role);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al aprobar la carga no lectiva.';
    return { message };
  }

  revalidatePath('/director/carga-no-lectiva');
  revalidatePath('/secretaria/carga-no-lectiva');
  return { success: true, message: 'Carga no lectiva aprobada correctamente.' };
}
