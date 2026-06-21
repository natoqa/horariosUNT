'use server';

import { revalidatePath } from 'next/cache';
import { DeletePlanEstudioUseCase } from '../../application/use-cases/delete-plan-estudio.use-case';

export async function deletePlanEstudioAction(id: string) {
  try {
    const useCase = new DeletePlanEstudioUseCase();
    await useCase.execute(id);

    revalidatePath('/director/planes-estudio');
    revalidatePath('/secretaria/planes-estudio');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error al eliminar plan de estudios:', error);
    return { success: false, error: 'Error al eliminar plan de estudios' };
  }
}
