'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';
import { SaveLectivaDeclaracionUseCase } from '../../application/use-cases/save-lectiva-declaracion.use-case';
import { normalizeFormAccessor } from './form-utils';

export async function saveCargaLectivaDeclaracionAction(
  _prevState: unknown,
  formData?: FormData | Record<string, any>,
) {
  const fd = normalizeFormAccessor(formData);
  if (!fd) {
    return { message: 'No se recibieron datos del formulario. Recarga la página e intenta nuevamente.' };
  }

  const periodoId = fd.get('periodoId')?.toString() ?? '';
  const horasLectivasNoAsignadas = Number(fd.get('horasLectivasNoAsignadas')?.toString() ?? '0');
  const lectivaDeclarada = fd.get('lectivaDeclarada') === 'on';
  const declaracionLectiva = fd.get('declaracionLectiva')?.toString() ?? '';

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
  const useCase = new SaveLectivaDeclaracionUseCase(repository);

  try {
    await useCase.execute(docenteData.id, periodoId, horasLectivasNoAsignadas, lectivaDeclarada, declaracionLectiva);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al guardar la declaración lectiva.';
    return { message };
  }

  revalidatePath('/docente/carga-no-lectiva');
  return { success: true, message: 'Declaración lectiva guardada correctamente.' };
}
