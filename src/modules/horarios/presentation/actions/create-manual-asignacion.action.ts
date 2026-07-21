'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/shared/lib/supabase/server';
import { SupabaseHorarioRepository } from '../../infrastructure/supabase-horario.repository';
import { Asignacion } from '../../domain/entities/horario.entity';
import { Violation, PartialAssignment, validateHardConstraints, validateMaxConsecutiveHours, validateTheoryPracticeSeparation, validateBuildingSeparation } from '../../domain/services/constraint-validator.service';
import { DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import { AsignacionTipo } from '../../domain/entities/horario.entity';

export interface CreateManualAsignacionResult {
  success?: boolean;
  asignacion?: Asignacion;
  violations?: Violation[];
  message?: string;
}

export async function createManualAsignacionAction(data: {
  horarioId: string;
  grupoId: string;
  docenteId: string;
  aulaId: string;
  dia: string;
  bloque: string;
  tipo: string;
}): Promise<CreateManualAsignacionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado.' };
  }

  const role = user.user_metadata?.role;
  if (role !== 'director' && role !== 'secretaria') {
    return { message: 'Solo el Director o la Secretaria pueden crear asignaciones.' };
  }

  try {
    const repo = new SupabaseHorarioRepository();

    // Verify horario exists and is in Borrador
    const horario = await repo.findById(data.horarioId);
    if (!horario) {
      return { message: 'Horario no encontrado.' };
    }
    if (horario.estado !== 'Borrador') {
      return { message: `El horario debe estar en estado "Borrador". Estado actual: "${horario.estado}".` };
    }

    // Get all existing assignments for validation
    const allAsignaciones = await repo.findAsignacionesByHorario(data.horarioId);

    // Get context data for validation
    const grupoIds = [...new Set([...allAsignaciones.map((a) => a.grupoId), data.grupoId])];
    const aulaIds = [...new Set([...allAsignaciones.map((a) => a.aulaId), data.aulaId])];

    const [gruposRes, cursosRes, aulasRes] = await Promise.all([
      supabase.from('grupos').select('id, curso_id, num_estudiantes').in('id', grupoIds),
      supabase.from('cursos').select('id, ciclo, requiere_laboratorio'),
      supabase.from('aulas').select('id, capacidad, tipo, pabellon').in('id', aulaIds),
    ]);

    const grupoMap: Record<string, { cursoId: string; numEstudiantes: number }> = {};
    (gruposRes.data ?? []).forEach((g) => {
      grupoMap[g.id] = { cursoId: g.curso_id, numEstudiantes: g.num_estudiantes };
    });

    const cursoMap: Record<string, { ciclo: string; requiereLaboratorio: boolean }> = {};
    (cursosRes.data ?? []).forEach((c) => {
      cursoMap[c.id] = { ciclo: c.ciclo, requiereLaboratorio: c.requiere_laboratorio };
    });

    const aulaMap: Record<string, { capacidad: number; tipo: string; pabellon: string | null }> = {};
    (aulasRes.data ?? []).forEach((a) => {
      aulaMap[a.id] = { capacidad: a.capacidad, tipo: a.tipo, pabellon: a.pabellon };
    });

    // Build candidate
    const grupoCtx = grupoMap[data.grupoId];
    const cursoCtx = grupoCtx ? cursoMap[grupoCtx.cursoId] : null;
    const aulaCtx = aulaMap[data.aulaId];

    if (!grupoCtx || !cursoCtx || !aulaCtx) {
      return { message: 'No se pudo obtener el contexto para la validación.' };
    }

    const candidate: PartialAssignment = {
      grupoId: data.grupoId,
      docenteId: data.docenteId,
      aulaId: data.aulaId,
      dia: data.dia as DiaSemana,
      bloque: data.bloque as BloqueHorario,
      tipo: data.tipo as AsignacionTipo,
      ciclo: cursoCtx.ciclo,
      aulaCapacidad: aulaCtx.capacidad,
      numEstudiantes: grupoCtx.numEstudiantes,
      aulaType: aulaCtx.tipo,
      requiereLaboratorio: cursoCtx.requiereLaboratorio,
      pabellon: aulaCtx.pabellon,
    };

    // Build existing assignments as PartialAssignment[]
    const existing: PartialAssignment[] = allAsignaciones
      .filter((a) => a.dia !== 'Pendiente' && a.bloque !== 'Pendiente')
      .map((a) => {
        const g = grupoMap[a.grupoId];
        const c = g ? cursoMap[g.cursoId] : null;
        const au = aulaMap[a.aulaId];
        return {
          grupoId: a.grupoId,
          docenteId: a.docenteId,
          aulaId: a.aulaId,
          dia: a.dia as DiaSemana,
          bloque: a.bloque as BloqueHorario,
          tipo: a.tipo,
          ciclo: c?.ciclo ?? '',
          aulaCapacidad: au?.capacidad ?? 0,
          numEstudiantes: g?.numEstudiantes ?? 0,
          aulaType: au?.tipo ?? '',
          requiereLaboratorio: c?.requiereLaboratorio ?? false,
          pabellon: au?.pabellon ?? null,
        };
      });

    // Validate all constraints
    const hardViolations = validateHardConstraints(existing, candidate);
    const consecutiveViolations = validateMaxConsecutiveHours(existing, candidate);
    const tpViolations = validateTheoryPracticeSeparation(existing, candidate);
    const buildingViolations = validateBuildingSeparation(existing, candidate);
    const allViolations = [...hardViolations, ...consecutiveViolations, ...tpViolations, ...buildingViolations];

    if (allViolations.length > 0) {
      return { violations: allViolations, message: 'Se detectaron conflictos.' };
    }

    // Save the assignment
    const asignacion = await repo.saveManualAsignacion(data.horarioId, {
      grupoId: data.grupoId,
      docenteId: data.docenteId,
      aulaId: data.aulaId,
      dia: data.dia as DiaSemana,
      bloque: data.bloque as BloqueHorario,
      tipo: data.tipo as AsignacionTipo,
    });

    revalidatePath('/director/horarios');
    revalidatePath('/secretaria/horarios');
    return { success: true, asignacion };
  } catch (error: unknown) {
    return { message: error instanceof Error ? error.message : 'Error al crear asignación.' };
  }
}
