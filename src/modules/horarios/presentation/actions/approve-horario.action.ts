'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';
import { ApproveHorarioUseCase, EnrichedAsignacionForApproval } from '../../application/use-cases/approve-horario.use-case';
import { approveHorarioSchema } from '../../application/dtos/approve-horario.dto';
import { Violation } from '../../domain/services/constraint-validator.service';
import { changeStateAction } from '@/modules/periodos';

interface ApproveHorarioActionResult {
  success?: boolean;
  message?: string;
  violations?: Violation[];
}

export async function approveHorarioAction(
  horarioId: string,
): Promise<ApproveHorarioActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'Solo el director puede aprobar horarios.' };
  }

  const validated = approveHorarioSchema.safeParse({ horarioId });
  if (!validated.success) {
    return { message: 'ID de horario inválido.' };
  }

  const horarioRepo = new SupabaseHorarioRepository();

  const horario = await horarioRepo.findById(validated.data.horarioId);
  if (!horario) {
    return { message: 'Horario no encontrado.' };
  }

  const asignaciones = await horarioRepo.findAsignacionesByHorario(horario.id);

  const grupoIds = [...new Set(asignaciones.map((a) => a.grupoId))];
  const aulaIds = [...new Set(asignaciones.map((a) => a.aulaId))];

  const [gruposRes, cursosRes, aulasRes] = await Promise.all([
    supabase.from('grupos').select('id, curso_id, num_estudiantes').in('id', grupoIds),
    supabase.from('cursos').select('id, ciclo, requiere_laboratorio'),
    supabase.from('aulas').select('id, capacidad, tipo').in('id', aulaIds),
  ]);

  const grupoMap: Record<string, { cursoId: string; numEstudiantes: number }> = {};
  (gruposRes.data ?? []).forEach((g) => {
    grupoMap[g.id] = { cursoId: g.curso_id, numEstudiantes: g.num_estudiantes };
  });

  const cursoMap: Record<string, { ciclo: string; requiereLaboratorio: boolean }> = {};
  (cursosRes.data ?? []).forEach((c) => {
    cursoMap[c.id] = { ciclo: c.ciclo, requiereLaboratorio: c.requiere_laboratorio };
  });

  const aulaMap: Record<string, { capacidad: number; tipo: string }> = {};
  (aulasRes.data ?? []).forEach((a) => {
    aulaMap[a.id] = { capacidad: a.capacidad, tipo: a.tipo };
  });

  const contextMap: Record<string, EnrichedAsignacionForApproval> = {};
  for (const a of asignaciones) {
    const grupo = grupoMap[a.grupoId];
    if (!grupo) continue;
    const curso = cursoMap[grupo.cursoId];
    if (!curso) continue;
    const aula = aulaMap[a.aulaId];

    contextMap[a.id] = {
      grupoId: a.grupoId,
      ciclo: curso.ciclo,
      aulaCapacidad: aula?.capacidad ?? 0,
      numEstudiantes: grupo.numEstudiantes,
      aulaType: aula?.tipo ?? '',
      requiereLaboratorio: curso.requiereLaboratorio,
    };
  }

  const useCase = new ApproveHorarioUseCase(horarioRepo);

  try {
    const result = await useCase.execute(validated.data, asignaciones, contextMap);

    if (!result.success) {
      return {
        message: result.message,
        violations: result.violations,
      };
    }
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al aprobar horario.' };
  }

  const stateResult = await changeStateAction(horario.periodoId, 'Aprobado');
  if (stateResult.message && !stateResult.success) {
    return { message: `Horario aprobado, pero error al cambiar estado del período: ${stateResult.message}` };
  }

  revalidatePath('/director/horarios');
  revalidatePath('/secretaria/horarios');
  revalidatePath('/docente/horarios');

  return { success: true, message: 'Horario aprobado exitosamente.' };
}
