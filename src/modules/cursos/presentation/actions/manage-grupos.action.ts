'use server';

import { revalidatePath } from 'next/cache';
import { SupabaseCursoRepository } from '../../infrastructure/supabase-curso.repository';
import { ManageGruposUseCase, createGrupoSchema } from '../../application/use-cases/manage-grupos.use-case';
import { Grupo } from '../../domain/entities/grupo.entity';
import { createClient } from '@/shared/lib/supabase/server';

export interface GrupoActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export async function getGruposAction(
  cursoId: string,
  periodoId: string,
): Promise<{ data?: Grupo[]; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'No autorizado.' };

  const repo = new SupabaseCursoRepository();
  const useCase = new ManageGruposUseCase(repo);

  try {
    const data = await useCase.getGruposForCursoAndPeriodo(cursoId, periodoId);
    return { data };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al obtener secciones.' };
  }
}

export async function getActivePeriodoAction(): Promise<{ id?: string; name?: string; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'No autorizado.' };

  const { data, error } = await supabase
    .from('periodos')
    .select('id, nombre')
    .neq('state', 'Cerrado')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return { message: 'No hay ningún período activo registrado.' };
  }

  return { id: data.id, name: data.nombre };
}

export async function addGrupoAction(
  _prevState: GrupoActionState | undefined,
  formData: FormData,
): Promise<GrupoActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para administrar secciones.' };
  }

  const raw = {
    cursoId: formData.get('cursoId') as string,
    periodoId: formData.get('periodoId') as string,
    nombre: formData.get('nombre') as string,
    numEstudiantes: formData.get('numEstudiantes') as string,
  };

  const validated = createGrupoSchema.safeParse(raw);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const repo = new SupabaseCursoRepository();
  const useCase = new ManageGruposUseCase(repo);

  try {
    await useCase.addGrupo(validated.data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar la sección.';
    return { message };
  }

  revalidatePath('/director/cursos');
  revalidatePath('/secretaria/cursos');
  return { success: true, message: 'Sección registrada exitosamente.' };
}

export async function removeGrupoAction(
  id: string,
): Promise<{ success?: boolean; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'No tiene permisos para eliminar secciones.' };
  }

  const repo = new SupabaseCursoRepository();
  const useCase = new ManageGruposUseCase(repo);

  try {
    await useCase.removeGrupo(id);
    revalidatePath('/director/cursos');
    revalidatePath('/secretaria/cursos');
    return { success: true, message: 'Sección eliminada correctamente.' };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al eliminar la sección.' };
  }
}
