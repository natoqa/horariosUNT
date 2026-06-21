'use server';

import { revalidatePath } from 'next/cache';
import { DeleteCursoUseCase } from '../../application/use-cases/delete-curso.use-case';

export async function deleteCursoAction(id: string) {
  try {
    console.log('Intentando eliminar curso con ID:', id);
    const useCase = new DeleteCursoUseCase();
    await useCase.execute(id);
    console.log('Curso eliminado exitosamente');
    revalidatePath('/secretaria/cursos');
    revalidatePath('/director/cursos');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    return { success: false, error: 'Error al eliminar curso' };
  }
}
