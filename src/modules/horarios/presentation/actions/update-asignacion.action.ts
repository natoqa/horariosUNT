'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';
import { UpdateAsignacionUseCase, EnrichedAsignacionContext } from '../../application/use-cases/update-asignacion.use-case';
import { updateAsignacionSchema } from '../../application/dtos/update-asignacion.dto';
import { Violation } from '../../domain/services/constraint-validator.service';

interface UpdateAsignacionActionResult {
  success?: boolean;
  message?: string;
  violations?: Violation[];
  errors?: Record<string, string[]>;
}

export async function updateAsignacionAction(
  data: Record<string, unknown>,
): Promise<UpdateAsignacionActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'Solo el director puede modificar asignaciones.' };
  }

  const validated = updateAsignacionSchema.safeParse(data);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const repo = new SupabaseHorarioRepository();

  const currentAsignacion = await repo.findAsignacionById(validated.data.asignacionId);
  if (!currentAsignacion) {
    return { message: 'Asignación no encontrada.' };
  }

  const allAsignaciones = await repo.findAsignacionesByHorario(currentAsignacion.horarioId);

  const grupoIds = [...new Set(allAsignaciones.map((a) => a.grupoId))];
  const aulaIds = [...new Set([
    ...allAsignaciones.map((a) => a.aulaId),
    ...(validated.data.aulaId ? [validated.data.aulaId] : []),
  ])];

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

  function buildContext(asignacionId: string, aulaIdOverride?: string): EnrichedAsignacionContext | null {
    const asig = allAsignaciones.find((a) => a.id === asignacionId);
    if (!asig) return null;

    const grupo = grupoMap[asig.grupoId];
    if (!grupo) return null;

    const curso = cursoMap[grupo.cursoId];
    if (!curso) return null;

    const effectiveAulaId = aulaIdOverride ?? asig.aulaId;
    const aula = aulaMap[effectiveAulaId];

    return {
      grupoId: asig.grupoId,
      ciclo: curso.ciclo,
      aulaCapacidad: aula?.capacidad ?? 0,
      numEstudiantes: grupo.numEstudiantes,
      aulaType: aula?.tipo ?? '',
      requiereLaboratorio: curso.requiereLaboratorio,
    };
  }

  const allContexts: Record<string, EnrichedAsignacionContext> = {};
  for (const a of allAsignaciones) {
    const ctx = buildContext(a.id);
    if (ctx) allContexts[a.id] = ctx;
  }

  const useCase = new UpdateAsignacionUseCase(repo);

  const result = await useCase.execute(
    validated.data,
    async (asignacionId, newAulaId) => buildContext(asignacionId, newAulaId),
    allAsignaciones,
    allContexts,
  );

  if (!result.success) {
    if (result.violations && result.violations.length > 0) {
      return { violations: result.violations, message: 'Se detectaron conflictos.' };
    }
    return { message: result.message || 'Error al actualizar la asignación.' };
  }

  revalidatePath('/director/horarios');
  return { success: true, message: 'Asignación actualizada exitosamente.' };
}
