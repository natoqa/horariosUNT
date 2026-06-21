'use server';

import { revalidatePath } from 'next/cache';
import { UpdatePlanEstudioUseCase } from '../../application/use-cases/update-plan-estudio.use-case';
import { savePlanEstudioSchema } from '../../application/dtos/save-plan-estudio.dto';

export async function updatePlanEstudioAction(id: string, data: FormData | { estado?: string; nombre?: string; anio?: number; pdfUrl?: string; fechaPublicacion?: string }) {
  try {
    let nombre: string;
    let anio: string;
    let pdfUrl: string;
    let estado: string;
    let fechaPublicacion: string;

    if (data instanceof FormData) {
      nombre = data.get('nombre')?.toString() ?? '';
      anio = data.get('anio')?.toString() ?? '';
      pdfUrl = data.get('pdfUrl')?.toString() ?? '';
      estado = data.get('estado')?.toString() ?? 'Activo';
      fechaPublicacion = data.get('fechaPublicacion')?.toString() ?? '';
    } else {
      nombre = data.nombre ?? 'Plan de Estudio';
      anio = data.anio?.toString() ?? '';
      pdfUrl = data.pdfUrl ?? '';
      estado = data.estado ?? 'Activo';
      fechaPublicacion = data.fechaPublicacion ?? '';
    }

    const validatedData = savePlanEstudioSchema.parse({
      nombre,
      anio: parseInt(anio),
      pdfUrl: pdfUrl || undefined,
      estado,
      fechaPublicacion: fechaPublicacion || undefined,
    });

    const useCase = new UpdatePlanEstudioUseCase();
    await useCase.execute(id, validatedData);

    revalidatePath('/director/planes-estudio');
    revalidatePath('/secretaria/planes-estudio');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error al actualizar plan de estudios:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error al actualizar plan de estudios' };
  }
}
