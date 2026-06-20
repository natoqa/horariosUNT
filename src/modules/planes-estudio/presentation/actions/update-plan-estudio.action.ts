'use server';

import { revalidatePath } from 'next/cache';
import { UpdatePlanEstudioUseCase } from '../../application/use-cases/update-plan-estudio.use-case';
import { savePlanEstudioSchema } from '../../application/dtos/save-plan-estudio.dto';

export async function updatePlanEstudioAction(id: string, formData: FormData) {
  try {
    const nombre = formData.get('nombre')?.toString() ?? '';
    const anio = formData.get('anio')?.toString() ?? '';
    const pdfUrl = formData.get('pdfUrl')?.toString() ?? '';
    const estado = formData.get('estado')?.toString() ?? 'Activo';
    const fechaPublicacion = formData.get('fechaPublicacion')?.toString() ?? '';

    const validatedData = savePlanEstudioSchema.parse({
      nombre,
      anio,
      pdfUrl: pdfUrl || undefined,
      estado,
      fechaPublicacion: fechaPublicacion || undefined,
    });

    const useCase = new UpdatePlanEstudioUseCase();
    await useCase.execute(id, validatedData);

    revalidatePath('/director/planes-estudio');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error al actualizar plan de estudios:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error al actualizar plan de estudios' };
  }
}
