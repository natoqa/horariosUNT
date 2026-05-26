'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseCursoRepository } from '../../infrastructure/supabase-curso.repository';
import { UpdateCursoUseCase } from '../../application/use-cases/update-curso.use-case';
import { updateCursoSchema } from '../../application/dtos/update-curso.dto';
import { createClient } from '@/shared/lib/supabase/server';
import { CursoActionState } from './create-curso.action';

export async function updateCursoAction(
  id: string,
  _prevState: CursoActionState | undefined,
  formData: FormData,
): Promise<CursoActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para modificar cursos.' };
  }

  const raw = {
    nombre: formData.get('nombre') as string,
    ciclo: formData.get('ciclo') as string,
    tipo: formData.get('tipo') as string,
    horasTeoricas: formData.get('horasTeoricas') as string,
    horasPracticas: formData.get('horasPracticas') as string,
    creditos: formData.get('creditos') as string,
    requiereLaboratorio: formData.get('requiereLaboratorio') as string,
    tipoLaboratorio: formData.get('tipoLaboratorio') as string,
    estado: formData.get('estado') as string,
  };

  const validated = updateCursoSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const repo = new SupabaseCursoRepository();
  const useCase = new UpdateCursoUseCase(repo);

  try {
    await useCase.execute(id, validated.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al actualizar el curso.';
    return { message };
  }

  revalidatePath('/director/cursos');
  revalidatePath('/secretaria/cursos');
  return { success: true, message: 'Curso actualizado exitosamente.' };
}
