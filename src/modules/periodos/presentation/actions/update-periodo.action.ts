'use server';

import { revalidatePath } from 'next/cache';
import { SupabasePeriodoRepository } from '../../infrastructure/supabase-periodo.repository';
import { UpdatePeriodoUseCase } from '../../application/use-cases/update-periodo.use-case';
import { updatePeriodoSchema } from '../../application/dtos/update-periodo.dto';
import { createClient } from '@/shared/lib/supabase/server';
import { PeriodoActionState } from './create-periodo.action';

export async function updatePeriodoAction(
  _prevState: PeriodoActionState | undefined,
  formData: FormData,
): Promise<PeriodoActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'No tiene permisos para editar períodos.' };
  }

  const raw = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    availabilityDeadline: formData.get('availabilityDeadline') as string,
  };

  const validated = updatePeriodoSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Revise los campos.',
    };
  }

  const repo = new SupabasePeriodoRepository();
  const useCase = new UpdatePeriodoUseCase(repo);

  try {
    await useCase.execute(validated.data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al actualizar.';
    return { message };
  }

  revalidatePath('/director/periodos');
  return { success: true, message: 'Período actualizado exitosamente.' };
}
