'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';
import { UpdateAsignacionUseCase, EnrichedAsignacionContext } from '../../application/use-cases/update-asignacion.use-case';
import { PostPublishUpdateUseCase } from '../../application/use-cases/post-publish-update.use-case';
import { updateAsignacionSchema } from '../../application/dtos/update-asignacion.dto';
import { RegistrarAuditoriaUseCase, SupabaseAuditoriaRepository } from '@/modules/auditoria';
import { Violation } from '../../domain/services/constraint-validator.service';

interface PostPublishUpdateActionResult {
  success?: boolean;
  message?: string;
  violations?: Violation[];
  errors?: Record<string, string[]>;
}

export async function postPublishUpdateAction(
  data: Record<string, unknown>,
): Promise<PostPublishUpdateActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  if (user.user_metadata?.role !== 'director') {
    return { message: 'Solo el director puede modificar horarios publicados.' };
  }

  const validated = updateAsignacionSchema.safeParse(data);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Revise los campos ingresados.',
    };
  }

  const horarioRepo = new SupabaseHorarioRepository();

  const currentAsignacion = await horarioRepo.findAsignacionById(validated.data.asignacionId);
  if (!currentAsignacion) {
    return { message: 'Asignación no encontrada.' };
  }

  const allAsignaciones = await horarioRepo.findAsignacionesByHorario(currentAsignacion.horarioId);

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

  const grupoMap = new Map<string, { cursoId: string; numEstudiantes: number }>();
  (gruposRes.data ?? []).forEach((g) => {
    grupoMap.set(g.id, { cursoId: g.curso_id, numEstudiantes: g.num_estudiantes });
  });

  const cursoMap = new Map<string, { ciclo: string; requiereLaboratorio: boolean }>();
  (cursosRes.data ?? []).forEach((c) => {
    cursoMap.set(c.id, { ciclo: c.ciclo, requiereLaboratorio: c.requiere_laboratorio });
  });

  const aulaMap = new Map<string, { capacidad: number; tipo: string }>();
  (aulasRes.data ?? []).forEach((a) => {
    aulaMap.set(a.id, { capacidad: a.capacidad, tipo: a.tipo });
  });

  function buildContext(asignacionId: string, aulaIdOverride?: string): EnrichedAsignacionContext | null {
    const asig = allAsignaciones.find((a) => a.id === asignacionId);
    if (!asig) return null;

    const grupo = grupoMap.get(asig.grupoId);
    if (!grupo) return null;

    const curso = cursoMap.get(grupo.cursoId);
    if (!curso) return null;

    const effectiveAulaId = aulaIdOverride ?? asig.aulaId;
    const aula = aulaMap.get(effectiveAulaId);

    return {
      grupoId: asig.grupoId,
      ciclo: curso.ciclo,
      aulaCapacidad: aula?.capacidad ?? 0,
      numEstudiantes: grupo.numEstudiantes,
      aulaType: aula?.tipo ?? '',
      requiereLaboratorio: curso.requiereLaboratorio,
    };
  }

  const allContexts = new Map<string, EnrichedAsignacionContext>();
  for (const a of allAsignaciones) {
    const ctx = buildContext(a.id);
    if (ctx) allContexts.set(a.id, ctx);
  }

  const updateUseCase = new UpdateAsignacionUseCase(horarioRepo);
  const auditoriaRepo = new SupabaseAuditoriaRepository();
  const auditoriaUseCase = new RegistrarAuditoriaUseCase(auditoriaRepo);
  const useCase = new PostPublishUpdateUseCase(horarioRepo, updateUseCase, auditoriaUseCase);

  const result = await useCase.execute(
    validated.data,
    async (asignacionId, newAulaId) => buildContext(asignacionId, newAulaId),
    allAsignaciones,
    allContexts,
    {
      userId: user.id,
      userEmail: user.email ?? '',
      userRole: user.user_metadata?.role ?? '',
    },
  );

  if (!result.success) {
    if (result.violations && result.violations.length > 0) {
      return { violations: result.violations, message: 'Se detectaron conflictos.' };
    }
    return { message: result.message ?? 'Error al actualizar la asignación.' };
  }

  revalidatePath('/director/horarios');
  revalidatePath('/secretaria/horarios');
  revalidatePath('/docente/horarios');

  return { success: true, message: 'Asignación actualizada (cambio post-publicación registrado).' };
}
